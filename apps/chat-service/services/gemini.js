import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const SYSTEM_INSTRUCTION = `You are a helpful, expert AI assistant embedded inside 'FormBuilder', a modern SaaS application for creating online forms and surveys. 
Your goal is to help users design better forms, suggest optimal questions for their use case, analyze data collection strategies, and explain FormBuilder features.
Keep your answers concise, highly professional, and perfectly formatted. Do not use markdown headers larger than H3.`;

const model = genAI.getGenerativeModel({ 
    model: 'gemini-3.5-flash',
    systemInstruction: SYSTEM_INSTRUCTION 
});

export async function generateChatStream(history, userMessage, callbacks) {
    const { onChunk, onComplete, onError } = callbacks;
    
    try {

        const chat = model.startChat({
            history: history,
            generationConfig: {
                maxOutputTokens: 800,
                temperature: 0.7,
            },
        });

        const result = await chat.sendMessageStream(userMessage);

        let fullText = '';
    
        for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            fullText += chunkText;
            onChunk(chunkText);
        }

        onComplete(fullText);
    } catch (error) {
        console.error("❌ Gemini API Error:", error);
        onError(error.message);
    }
}