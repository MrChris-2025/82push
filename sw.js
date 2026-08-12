/* sw.js */

self.addEventListener('push', function(event) {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Live Sports Hub';
  const body = data.body || 'You have a new sports update.';
  const tag = data.tag; // For grouping notifications
  const url = data.data && data.data.url ? data.data.url : './'; // URL from server

  const options = {
    body: body,
    icon: '/images/icon-192x192.png', // Or your app's icon
    vibrate: [200, 100, 200],
    data: {
      url: url,
      eventId: data.data ? data.data.eventId : null
    },
    tag: tag,
    renotify: true // For displaying a new notification even if one with the same tag exists
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close(); // Close the notification

  const urlToOpen = event.notification.data.url || './';

  event.waitUntil(
    clients.openWindow(urlToOpen) // Open the URL
  );
});

self.addEventListener('install', function(event) {
  console.log('Service Worker installing.');
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  console.log('Service Worker activating.');
  event.waitUntil(self.clients.claim());
});
