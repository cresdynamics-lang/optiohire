# React + Vite Migration

Migrate from Next.js (`frontend/`) to React + Vite (`frontend-vite/`) without breaking production.

## Documents

| File | Purpose |
|------|---------|
| [AUDIT.md](./AUDIT.md) | Baseline inventory of routes, API handlers, env vars, middleware |
| [API_CONTRACT.md](./API_CONTRACT.md) | Frontend `/api/*` → Express backend path mapping |
| [SHARED_CODE.md](./SHARED_CODE.md) | How Vite reuses Next source via aliases + shims |
| [VERIFICATION.md](./VERIFICATION.md) | Per-module parity checklist |
| [STAGING_DEPLOYMENT.md](./STAGING_DEPLOYMENT.md) | Run Next + Vite side-by-side |
| [PRODUCTION_CUTOVER.md](./PRODUCTION_CUTOVER.md) | Gradual traffic switch + rollback |

## Quick Start

```bash
# Install
npm run install:vite

# Dev (backend must be running on :3001)
npm run dev:vite
# → http://localhost:5173

# Build
npm run build:vite
```

## Architecture

```
frontend-vite/src/
├── shims/          # next/link, next/navigation, next/image → React Router
├── routes.tsx      # All 95 routes (lazy-loaded from ../frontend/src)
├── layouts/        # Root, Admin, Institution wrappers
├── lib/            # api-client, portal detection
└── pages/          # Vite wrappers for server-only Next pages

../frontend/src/    # Reused via @/ alias (components, hooks, pages)
```

## Migration Status

All route modules are **wired**. Next.js remains the production frontend until staging parity is verified module-by-module.

## Next Steps

1. Run `npm run dev:vite` locally and smoke-test key flows
2. Deploy Vite to staging alongside Next (see STAGING_DEPLOYMENT.md)
3. Route marketing pages first, then auth, portals, admin
4. Full cutover when VERIFICATION.md checklist passes
