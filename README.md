# FormBuilder ⚡️ AI-Powered Dynamic Data Collection

FormBuilder is a high-performance, full-stack SaaS platform designed to revolutionize dynamic data collection. It features an embedded **Real-Time AI Assistant** that helps users design and structure their forms interactively. Built with a modern monorepo architecture, the platform ensures enterprise-grade security, real-time communication, and developer-friendly API integrations.

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![Express.js](https://img.shields.io/badge/Express.js-Backend-white?logo=express)
![Socket.io](https://img.shields.io/badge/Socket.io-WebSockets-black?logo=socket.io)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-blue?logo=postgresql)
![tRPC](https://img.shields.io/badge/tRPC-TypeSafe-2596be?logo=typescript)

## ✨ Core Features

* **🤖 AI-Driven Interactive Assistant:** A persistent, real-time chat widget powered by **Google Gemini 1.5 Flash**. Utilizes Socket.io over a dedicated Node.js Microservice to stream AI responses without blocking the main application thread.
* **🔐 Enterprise-Grade Authentication:** Secure, passwordless login via a custom-built Google OAuth 2.0 flow. Uses JWT (JSON Web Tokens) for stateless, secure session management.
* **🛡️ End-to-End Type Safety:** Seamless communication between the database, backend, and frontend utilizing **tRPC** and **Drizzle ORM**.
* **💳 Automated Billing:** Integrated Razorpay Webhooks using raw body parsing and cryptographic signature verification for secure subscription processing.
* **📚 Interactive API Docs:** Developer-first API documentation generated natively via **Scalar**, offering a beautiful OpenAPI specification page directly from the Express backend.

## 🏗️ Architecture & Tech Stack

This project is structured as a **Turborepo** (Monorepo) to efficiently share packages, schemas, and database logic across multiple services.

### Apps
* `apps/web`: The frontend Next.js (App Router) application. Uses Redux Toolkit, Tailwind CSS, and Framer Motion.
* `apps/api`: The primary Express.js backend handling REST routes (OAuth, Webhooks) and tRPC batch requests.
* `apps/chat-service`: An isolated Express + Socket.io microservice dedicated entirely to real-time Gemini AI streaming.

### Packages
* `packages/database`: PostgreSQL connection and Drizzle ORM schemas.
* `packages/trpc`: Shared tRPC routers and server utilities.
* `packages/schemas`: Zod schemas for strict cross-boundary validation.

## 🚀 Getting Started (Local Development)

### Prerequisites
* Node.js (v18+)
* pnpm
* PostgreSQL (Running locally or via Docker)

### 1. Clone & Install
```bash
git clone [https://github.com/yourusername/form-builder.git](https://github.com/yourusername/form-builder.git)
cd form-builder
pnpm install
