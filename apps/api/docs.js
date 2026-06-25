import { apiReference } from "@scalar/express-api-reference";

export const scalarDocs = apiReference({
  theme: "deepSpace",
  layout: "modern",
  pageTitle: "FormBuilder API — Developer Reference",
  favicon: "https://formbuilder.summitdigital.in/favicon.ico",
  searchHotKey: "k",
  hideModels: false,
  metaData: {
    title: "FormBuilder API — Developer Reference",
    description:
      "Complete REST API reference for the FormBuilder SaaS platform. Covers authentication, form management, billing, AI insights, and webhooks.",
    ogTitle: "FormBuilder API Reference",
    ogDescription:
      "Explore the official FormBuilder API documentation — authentication flows, form CRUD, billing integration, and more.",
  },
  customCss: `
    :root {
      --scalar-font: 'Inter', system-ui, -apple-system, sans-serif;
      --scalar-font-code: 'JetBrains Mono', 'Fira Code', monospace;
      --scalar-radius: 8px;
      --scalar-radius-lg: 12px;
    }
    .dark-mode {
      --scalar-background-1: #0f0f13;
      --scalar-background-2: #16161d;
      --scalar-background-3: #1e1e28;
      --scalar-color-accent: #8b5cf6;
      --scalar-border-color: rgba(139, 92, 246, 0.12);
    }
    .light-mode {
      --scalar-color-accent: #7c3aed;
    }
    .introduction-description {
      font-size: 1.05rem;
      line-height: 1.75;
    }
  `,
  spec: {
    content: {
      openapi: "3.1.0",
      info: {
        title: "FormBuilder API",
        version: "1.0.0",
        description: `
## Overview

The **FormBuilder API** powers a modern, full-stack SaaS form-builder platform. It provides endpoints for user authentication, form lifecycle management, response collection, AI-powered analytics, billing, and workspace collaboration.

### Architecture

| Layer | Technology |
|---|---|
| **API Gateway** | Express.js with Helmet & CORS |
| **RPC Layer** | tRPC v10 (type-safe procedures) |
| **Database** | PostgreSQL via Drizzle ORM |
| **Auth** | Google OAuth 2.0 + JWT |
| **Payments** | Razorpay Subscriptions |
| **AI** | Gemini-powered form insights |

### Base URLs

- **Production** — \`https://form-builder-7vyq.onrender.com\`
- **Development** — \`http://localhost:4000\`

### Authentication

Most endpoints require a valid **JWT Bearer token** in the \`Authorization\` header. Tokens are issued via the Google OAuth flow.

\`\`\`
Authorization: Bearer <your_access_token>
\`\`\`
        `.trim(),
        contact: {
          name: "FormBuilder Team",
          url: "https://form-builder-by-rukhaam.vercel.app",
        },
        license: {
          name: "MIT",
          url: "https://opensource.org/licenses/MIT",
        },
      },
      externalDocs: {
        description: "View the live application",
        url: "https://form-builder-by-rukhaam.vercel.app",
      },
      servers: [
        {
          url: "https://form-builder-7vyq.onrender.com",
          description: "Production Server",
        },
        {
          url: "http://localhost:4000",
          description: "Local Development",
        },
      ],

      // ─── Security Schemes ───────────────────────────────────────
      components: {
        securitySchemes: {
          BearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
            description:
              "JWT access token obtained from the Google OAuth callback. Pass as `Authorization: Bearer <token>`.",
          },
        },
        schemas: {
          Error: {
            type: "object",
            properties: {
              error: { type: "string", example: "Unauthorized" },
              message: {
                type: "string",
                example: "Invalid or expired token.",
              },
            },
          },
          OAuthError: {
            type: "object",
            properties: {
              error: {
                type: "string",
                enum: [
                  "oauth_not_configured",
                  "oauth_missing_code",
                  "oauth_failed",
                  "manual_account_exists",
                  "oauth_account_mismatch",
                ],
                description:
                  "Machine-readable error code appended as a query parameter on redirect.",
              },
            },
          },
          WebhookPayload: {
            type: "object",
            description: "Razorpay webhook event payload.",
            properties: {
              event: {
                type: "string",
                example: "subscription.charged",
              },
              payload: {
                type: "object",
                description: "Event-specific data from Razorpay.",
              },
            },
          },
          HealthStatus: {
            type: "object",
            properties: {
              status: { type: "string", example: "awake" },
              timestamp: {
                type: "string",
                format: "date-time",
                example: "2025-06-24T12:00:00.000Z",
              },
            },
          },
        },
      },

      // ─── Tags ───────────────────────────────────────────────────
      tags: [
        {
          name: "Authentication",
          description:
            "OAuth 2.0 login flow via Google. Handles user creation, token issuance, and account linking.",
        },
        {
          name: "Billing",
          description:
            "Razorpay payment integration — subscription lifecycle events and webhook processing.",
        },
        {
          name: "Health",
          description:
            "Uptime monitoring endpoints for keep-alive pings and health checks.",
        },
        {
          name: "tRPC",
          description:
            "Type-safe RPC procedures for forms, reviews, AI insights, workspaces, and more. Use the tRPC client SDK for full type safety.",
        },
      ],

      // ─── Paths ──────────────────────────────────────────────────
      paths: {
        // ── Authentication ──
        "/api/auth/google": {
          get: {
            operationId: "initiateGoogleOAuth",
            summary: "Initiate Google OAuth",
            description:
              "Redirects the user to the Google consent screen to begin the OAuth 2.0 authorization code flow. After consent, Google redirects to the configured callback URL.",
            tags: ["Authentication"],
            responses: {
              302: {
                description: "Redirect to Google accounts consent screen.",
                headers: {
                  Location: {
                    schema: { type: "string" },
                    description: "Google OAuth authorization URL.",
                  },
                },
              },
              500: {
                description:
                  "OAuth not configured — redirects to frontend with error.",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/OAuthError" },
                  },
                },
              },
            },
          },
        },
        "/api/auth/callback/google": {
          get: {
            operationId: "googleOAuthCallback",
            summary: "Google OAuth Callback",
            description:
              "Receives the authorization code from Google, exchanges it for tokens, creates or updates the user record, and redirects to the frontend with JWT access and refresh tokens.",
            tags: ["Authentication"],
            parameters: [
              {
                name: "code",
                in: "query",
                required: true,
                description:
                  "Authorization code provided by Google after user consent.",
                schema: { type: "string" },
              },
            ],
            responses: {
              302: {
                description:
                  "Successful authentication — redirects to the frontend dashboard with `accessToken` and `refreshToken` as query parameters.",
                headers: {
                  Location: {
                    schema: { type: "string" },
                    description:
                      "Frontend auth success URL with embedded tokens.",
                  },
                },
              },
              400: {
                description:
                  "OAuth failure — missing authorization code, account mismatch, or provider conflict. Redirects to the frontend login page with an error code.",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/OAuthError" },
                  },
                },
              },
            },
          },
        },
        "/api/auth/google/callback": {
          get: {
            operationId: "googleOAuthCallbackLegacy",
            summary: "Google OAuth Callback (Legacy)",
            description:
              "Alternate callback path supported for existing OAuth client configurations. Behaves identically to `/api/auth/callback/google`.",
            tags: ["Authentication"],
            parameters: [
              {
                name: "code",
                in: "query",
                required: true,
                description: "Authorization code provided by Google.",
                schema: { type: "string" },
              },
            ],
            responses: {
              302: {
                description: "Redirects to frontend dashboard with JWT tokens.",
                headers: {
                  Location: {
                    schema: { type: "string" },
                    description: "Frontend auth success URL.",
                  },
                },
              },
              400: {
                description:
                  "OAuth failure or missing code. Redirects with error.",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/OAuthError" },
                  },
                },
              },
            },
          },
        },

        // ── Billing ──
        "/api/billing/webhook": {
          post: {
            operationId: "razorpayWebhook",
            summary: "Razorpay Webhook",
            description:
              "Receives and processes webhook events from Razorpay. Handles `subscription.charged`, `subscription.activated`, `subscription.cancelled`, and `payment.captured` events to sync subscription state.",
            tags: ["Billing"],
            parameters: [
              {
                name: "x-razorpay-signature",
                in: "header",
                required: true,
                description: "HMAC SHA-256 signature for payload verification.",
                schema: { type: "string" },
              },
            ],
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/WebhookPayload" },
                },
              },
            },
            responses: {
              200: {
                description: "Webhook event processed successfully.",
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      properties: {
                        status: { type: "string", example: "ok" },
                      },
                    },
                  },
                },
              },
              400: {
                description: "Invalid signature or malformed payload.",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/Error" },
                  },
                },
              },
            },
          },
        },

        // ── Health ──
        "/api/keep-alive": {
          get: {
            operationId: "keepAlive",
            summary: "Keep-Alive Ping",
            description:
              "Lightweight health-check endpoint used for uptime monitoring. Returns the current server status and timestamp.",
            tags: ["Health"],
            responses: {
              200: {
                description: "Server is running.",
                content: {
                  "application/json": {
                    schema: {
                      $ref: "#/components/schemas/HealthStatus",
                    },
                  },
                },
              },
            },
          },
        },

        // ── tRPC ──
        "/trpc/{procedure}": {
          get: {
            operationId: "trpcQuery",
            summary: "tRPC Query",
            description:
              "Execute a tRPC query procedure. Available routers: `auth`, `form`, `review`, `billing`, `ai`, `webhook`, `workspace`. Use dot notation for nested procedures (e.g., `form.getAll`).",
            tags: ["tRPC"],
            security: [{ BearerAuth: [] }],
            parameters: [
              {
                name: "procedure",
                in: "path",
                required: true,
                description:
                  "Dot-separated procedure name (e.g., `form.getById`, `auth.me`).",
                schema: { type: "string" },
              },
              {
                name: "input",
                in: "query",
                required: false,
                description: "JSON-encoded input for the procedure.",
                schema: { type: "string" },
              },
            ],
            responses: {
              200: {
                description: "Successful query response.",
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      properties: {
                        result: {
                          type: "object",
                          properties: {
                            data: {
                              description: "Procedure-specific response data.",
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
              401: {
                description: "Missing or invalid authentication token.",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/Error" },
                  },
                },
              },
            },
          },
          post: {
            operationId: "trpcMutation",
            summary: "tRPC Mutation",
            description:
              "Execute a tRPC mutation procedure. Mutations modify data (create, update, delete). Requires a valid JWT Bearer token for protected procedures.",
            tags: ["tRPC"],
            security: [{ BearerAuth: [] }],
            parameters: [
              {
                name: "procedure",
                in: "path",
                required: true,
                description:
                  "Dot-separated procedure name (e.g., `form.create`, `workspace.update`).",
                schema: { type: "string" },
              },
            ],
            requestBody: {
              required: false,
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    description: "Procedure-specific input payload.",
                  },
                },
              },
            },
            responses: {
              200: {
                description: "Successful mutation response.",
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      properties: {
                        result: {
                          type: "object",
                          properties: {
                            data: {
                              description: "Procedure-specific response data.",
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
              401: {
                description: "Missing or invalid authentication token.",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/Error" },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
});
