# OptioHire Frontend (React + Vite)

Side-by-side migration target for the legacy Next.js app in `../frontend`.

## Quick Start

```bash
cp .env.example .env
npm install
npm run dev
```

Open http://localhost:5173 (requires backend on :3001).

## Architecture

- **Reuses** `../frontend/src` via `@/` alias + Next.js shims
- **Routes** defined in `src/routes.tsx` (95 pages)
- **API** proxied to backend in dev; direct calls in production via Nginx
- **Docs** in `../docs/migration/`

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server on :5173 with API proxy |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview production build |
| `npm run lint` | TypeScript check |

## Migration Status

All route modules are wired. Verify each portal in staging before production cutover (see `docs/migration/STAGING_DEPLOYMENT.md`).
