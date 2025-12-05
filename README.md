# BrainStack Full Stack Test Task

A full-stack application with React + TypeScript frontend and Fastify backend.

## Project Structure

```
├── client/          # React + Vite frontend
├── server/          # Fastify backend
└── package.json     # Root package with scripts
```

## Prerequisites

- Node.js 24.x or higher
- npm

## Getting Started

### 1. Install Dependencies

```bash
npm run install:all
```

This will install dependencies for the root project, client, and server.

### 2. Environment Setup

Copy the example environment files:

```bash
cp client/.env.example client/.env
cp server/.env.example server/.env
```

Adjust the values if needed.

### 3. Run Development Servers

```bash
npm run dev
```

This runs both the client and server concurrently:
- Client: http://localhost:8080
- Server: http://localhost:3000

### 4. Build for Production

```bash
npm run build
```

This builds the client application.

## Available Scripts

- `npm run install:all` - Install all dependencies
- `npm run dev` - Run both client and server in development mode
- `npm run build` - Build the client for production

## Tech Stack

### Frontend
- React 19
- TypeScript
- Vite
- Port: 8080

### Backend
- Fastify 5
- TypeScript
- Native Node.js env support (--env-file)
- Port: 3000

## API Proxy

The client development server proxies API requests from `/api` to the backend server at `http://localhost:3000` (configurable via `VITE_API_URL`).
