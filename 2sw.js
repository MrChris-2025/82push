self.addEventListener("install", function (event) {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", function (event) {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", function (event) {
  let payload = {};

  try {
    payload = event.data ? event.data.json() : {};
  } catch (error) {
    payload = {
      body: event.data ? event.data.text() : "New sports update"
    };
  }

  event.waitUntil(
    self.registration.showNotification(payload.title || "Live Sports Hub", {
      body: payload.body || "New sports update",
      icon: "./sports-icon.svg",
      badge: "./sports-icon.svg",
      tag: payload.tag || "sports-score",
      renotify: true,
      data: payload.data || { url: "./" }
    })
  );
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();

  const destination =
    event.notification.data && event.notification.data.url
      ? event.notification.data.url
      : "./";

  event.waitUntil(
    (async function () {
      const clientWindows = await clients.matchAll({
        type: "window",
        includeUncontrolled: true
      });

      if (clientWindows.length > 0) {
        await clientWindows[0].focus();
        return;
      }

      await clients.openWindow(destination);
    })()
  );
});
