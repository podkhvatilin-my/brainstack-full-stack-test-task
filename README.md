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

This builds both the server and client applications.

### 5. Run in Production Mode

```bash
npm start
```

This runs both the built server and client in production mode:

- Client: http://localhost:8080
- Server: http://localhost:3000

## Available Scripts

- `npm run install:all` - Install all dependencies
- `npm run dev` - Run both client and server in development mode
- `npm run dev:debug` - Run both in development mode with server debugging enabled
- `npm run build` - Build both server and client for production
- `npm start` - Run both server and client in production mode

## Tech Stack

### Frontend

- React 19
- TypeScript
- Vite

### Backend

- Fastify 5
- TypeScript
- Native Node.js env support (--env-file)

## API Proxy

The client development server proxies API requests from `/api` to the backend server.
