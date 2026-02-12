# Why the app may refresh in development

## In development (`npm run dev`)

- **Fast Refresh (HMR)**  
  Next.js reloads or re-renders the app when you save files. This is normal and only happens in dev. It cannot be fully disabled.

- **To avoid dev-only refreshes**  
  Run a production build and then start the server:
  ```bash
  npm run build && npm run start
  ```
  Then open http://localhost:3000. There is no Hot Reload, so the page will not refresh on file changes.

## Already disabled to prevent unwanted refresh

- Service worker does not call `skipWaiting()` or `clients.claim()` (no controller takeover).
- Root layout unregisters any existing service workers; no new registration.
- Error boundary does not call `router.refresh()`; it only resets local state.
- React Strict Mode is off to avoid double-mount in dev.
- Theme provider has `enableSystem={false}` so OS theme changes don’t trigger updates.

## If you still see refreshes

1. Hard-refresh once (Ctrl+Shift+R / Cmd+Shift+R) and clear site data for localhost so an old service worker is removed.
2. Confirm whether it’s a full page reload or only the content re-rendering (e.g. due to auth/theme state).
3. Test with `npm run build && npm run start`; if refreshes stop, they were from dev Fast Refresh.
