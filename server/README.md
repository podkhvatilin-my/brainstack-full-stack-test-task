# Server Application

Fastify backend API with TypeScript.

## Tech Stack

- Fastify 5
- TypeScript
- @fastify/cors
- tsx (for development)
- Node.js 24 with native env file support

## Development

### Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Available variables:
- `PORT` - Server port (default: 3000)

### Run Development Server

From the server directory:

```bash
npm run dev
```

Or from the root directory:

```bash
npm run dev
```

The server will be available at http://localhost:3000

The development server uses `tsx watch` with Node.js native `--env-file` flag for automatic restarts and environment variable loading.

### Build for Production

```bash
npm run build
```

### Run Production Server

```bash
npm start
```
