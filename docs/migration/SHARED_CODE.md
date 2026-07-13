# Shared Code Strategy

The Vite app reuses the existing Next.js source via path aliases instead of duplicating components.

## Alias Configuration

| Alias | Target | Purpose |
|-------|--------|---------|
| `@/*` | `../frontend/src/*` | All components, hooks, lib, schemas |
| `next/link` | `src/shims/next-link.tsx` | React Router Link |
| `next/navigation` | `src/shims/next-navigation.tsx` | Router hooks |
| `next/image` | `src/shims/next-image.tsx` | Standard img |
| `next/script` | `src/shims/next-script.tsx` | Dynamic script loader |
| `next/dynamic` | `src/shims/next-dynamic.tsx` | React.lazy wrapper |

## Vite-Only Code (`frontend-vite/src/`)

- `lib/api-client.ts` — typed backend fetch (replaces Next API route proxies)
- `lib/portal.ts` — subdomain portal detection
- `layouts/` — RootLayout, AdminLayoutWrapper, InstitutionLayoutWrapper
- `pages/` — wrappers for server-only Next pages (Home, HowItWorks, JobDetail)
- `routes.tsx` — full route map
- `shims/` — Next.js compatibility layer

## Environment Bridging

`vite.config.ts` defines `process.env.NEXT_PUBLIC_*` from `VITE_*` so existing hooks like `use-auth.tsx` work without modification.

## Static Assets

`publicDir` points to `../frontend/public` — logos, manifest, robots, sitemap shared.

## Styles

`RootLayout` imports `@/app/globals.css` from the Next app (Tailwind + neumorphism + landing animations).

## Future Extraction

When migration is complete, optionally move shared code to `packages/shared/` and update both apps. For now, single-source via alias avoids drift.
