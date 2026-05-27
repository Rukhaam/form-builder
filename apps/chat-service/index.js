import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { generateChatStream } from './services/gemini.js';

dotenv.config();

const PORT = process.env.RPORT || 3005;
if(!PORT) console.log('⚠️ RPORT environment variable not set, defaulting to 3005');
const DEFAULT_ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'https://form-builder-by-rukhaam.vercel.app',
];

function normalizeOrigin(origin) {
  return origin?.trim().replace(/\/+$/, '');
}

const configuredOrigins = [
  ...DEFAULT_ALLOWED_ORIGINS,
  process.env.FRONTEND_URL,
  process.env.CORS_ORIGIN,
  process.env.CORS_ORIGINS,
]
  .filter(Boolean)
  .flatMap((origin) => origin.split(','))
  .map(normalizeOrigin)
  .filter(Boolean);

const allowAllOrigins = configuredOrigins.includes('*');
const allowedOrigins = new Set(configuredOrigins.filter((origin) => origin !== '*'));

function corsOrigin(origin, callback) {
  const normalizedOrigin = normalizeOrigin(origin);

  if (!origin || allowAllOrigins || allowedOrigins.has(normalizedOrigin)) {
    callback(null, true);
    return;
  }

  callback(new Error(`CORS blocked origin: ${origin}`));
}

const app = express();
app.use(cors({ origin: corsOrigin }));

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: corsOrigin,
    methods: ['GET', 'POST'],
  },
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'chat-service', ai: 'gemini-1.5-flash' });
});

const chatSessions = new Map();

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on('chat:join', (data) => {
    const { roomId } = data || {};
    const room = roomId || socket.id;
    socket.join(room);
    console.log(`Socket ${socket.id} joined room ${room}`);

    if (!chatSessions.has(room)) {
      chatSessions.set(room, []);
    }
  });

  socket.on('chat:user_message', async (data) => {
    const { message, roomId } = data;
    const room = roomId || socket.id;

    console.log(`Processing message in ${room}: "${message}"`);

    const history = chatSessions.get(room) || [];

    await generateChatStream(history, message, {
      onChunk: (chunk) => {
        io.to(room).emit('chat:assistant_chunk', { chunk });
      },

      onComplete: (fullResponse) => {
        history.push({ role: 'user', parts: [{ text: message }] });
        history.push({ role: 'model', parts: [{ text: fullResponse }] });
        chatSessions.set(room, history);

        io.to(room).emit('chat:assistant_done');
      },

      onError: () => {
        io.to(room).emit('chat:error', { error: 'The AI encountered an error processing your request.' });
      },
    });
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
    chatSessions.delete(socket.id);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Chat Service running on port ${PORT}`);
  console.log('Gemini AI Engine initialized');
});
