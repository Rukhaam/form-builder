import { apiReference } from '@scalar/express-api-reference';

export const scalarDocs = apiReference({
  theme: 'purple',
  spec: {
    content: {
      openapi: '3.1.0',
      info: {
        title: 'FormBuilder API Reference',
        version: '1.0.0',
        description: 'Official API documentation for the FormBuilder platform.',
      },
      servers: [
        {
          url: 'https://form-builder-7vyq.onrender.com',
          description: 'Production Server',
        },
        {
          url: 'http://localhost:4000',
          description: 'Local Development',
        },
      ],
      paths: {
        '/api/auth/google': {
          get: {
            summary: 'Initiate Google OAuth',
            description: 'Redirects the user to the Google consent screen for authentication.',
            tags: ['Authentication'],
            responses: {
              302: { description: 'Redirects to Google.' },
            },
          },
        },
        '/api/auth/google/callback': {
          get: {
            summary: 'Google OAuth Callback',
            description: 'Handles the code from Google, creates/updates the user, and returns JWT tokens.',
            tags: ['Authentication'],
            parameters: [
              { name: 'code', in: 'query', required: true, schema: { type: 'string' } }
            ],
            responses: {
              302: { description: 'Redirects back to the frontend dashboard with tokens.' },
              400: { description: 'OAuth failure or missing code.' }
            },
          },
        },
        '/api/billing/webhook': {
          post: {
            summary: 'Razorpay Webhook',
            description: 'Listens for subscription updates and payment successes from Razorpay.',
            tags: ['Billing'],
            responses: {
              200: { description: 'Webhook processed successfully.' },
            },
          },
        },
      },
    },
  },
});