self.addEventListener('push', function(event) {
  let payload = { title: 'Update', body: 'Score change' };
  try {
    payload = event.data ? event.data.json() : payload;
  } catch (e) {
    try { payload.body = event.data.text(); } catch (e) {}
  }
  const title = payload.title || 'Notification';
  const options = Object.assign({ body: payload.body, data: payload.data || {} }, payload.options || {});
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || '/';
  event.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
    for (let client of windowClients) {
      if (client.url === url && 'focus' in client) return client.focus();
    }
    if (clients.openWindow) return clients.openWindow(url);
  }));
});
