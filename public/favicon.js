// Force favicon refresh
(function() {
  const favicon = document.querySelector('link[rel="icon"]');
  if (favicon) {
    // Force a reload by appending a timestamp
    const originalHref = favicon.href;
    favicon.href = originalHref + '?t=' + new Date().getTime();
  }
})(); 