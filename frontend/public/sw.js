// Service worker disabled to prevent auto-refresh.
// No install/activate/fetch behavior - does not take control or refresh the page.
self.addEventListener('install', () => {
  // Do not call skipWaiting() - prevents taking control and refreshing
})
self.addEventListener('activate', () => {
  // Do not call clients.claim() - prevents taking control
})
