# Client Application

React + TypeScript + Vite frontend application.

## Tech Stack

- React 19
- TypeScript
- Vite 7
- @vitejs/plugin-react

## Development

### Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Available variables:
- `VITE_API_URL` - Backend API URL (default: http://localhost:3000)

### Run Development Server

From the client directory:

```bash
npm run dev
```

Or from the root directory:

```bash
npm run dev
```

The application will be available at http://localhost:8080

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## API Integration

API requests to `/api` are proxied to the backend server configured in `vite.config.ts`.
