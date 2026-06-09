const CACHE_NAME = "todo-app-v2";
const STATIC_ASSETS = ["/", "/index.html", "/icon.svg", "/manifest.json"];

// Install: pre-cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  
  // Show a system notification if permission is granted.
  if (self.registration.showNotification && Notification.permission === "granted") {
    event.waitUntil(
      self.registration.showNotification("Mise à jour disponible", {
        body: "Une nouvelle version de Todo est disponible pour une meilleure expérience.",
        icon: "/icon.svg",
        tag: "pwa-update",
        badge: "/icon.svg",
        data: { url: "/" }
      })
    );
  }
});

// Activate: clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
        )
      )
  );
  self.clients.claim();
});

// Fetch: network-first for API calls, cache-first for static assets
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const networkFetch = fetch(event.request).then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      });
      return cached ?? networkFetch;
    })
  );
});

// Handle messages from the client
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// Handle system notification click
self.addEventListener("notificationclick", (event) => {
  const notification = event.notification;
  const action = event.action;
  const data = notification.data || {};

  notification.close();
  
  // 1. Handle App Update notification
  if (notification.tag === "pwa-update") {
    const urlToOpen = data.url || "/";
    event.waitUntil(
      self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
        for (let i = 0; i < windowClients.length; i++) {
          const client = windowClients[i];
          if (client.url === urlToOpen && "focus" in client) {
            return client.focus().then(() => {
              client.postMessage({ type: "UPDATE_REQUESTED" });
            });
          }
        }
        if (self.clients.openWindow) return self.clients.openWindow(urlToOpen);
      })
    );
    return;
  }

  // 2. Handle Task Reminder notification
  if (data.type === "TASK_REMINDER") {
    event.waitUntil(
      self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
        const isAppOpen = windowClients.length > 0;

        // Helper to send message to all clients
        const broadcast = (msg) => {
          windowClients.forEach(client => client.postMessage(msg));
        };

        if (action === "complete") {
          if (isAppOpen) {
            broadcast({ type: "TASK_ACTION", action: "complete", taskId: data.taskId });
            windowClients[0].focus();
          } else {
            // App is closed, open it and pass the action via URL
            if (self.clients.openWindow) {
              self.clients.openWindow(`/?action=complete&taskId=${data.taskId}`);
            }
          }
          return;
        }

        if (action === "snooze") {
          if (isAppOpen) {
            broadcast({ type: "TASK_ACTION", action: "snooze", taskId: data.taskId });
            windowClients[0].focus();
          } else {
            if (self.clients.openWindow) {
              self.clients.openWindow(`/?action=snooze&taskId=${data.taskId}`);
            }
          }
          return;
        }

        // Default click: open/focus app
        if (isAppOpen) {
          windowClients[0].focus();
          broadcast({ type: "OPEN_TASK", taskId: data.taskId });
        } else if (self.clients.openWindow) {
          self.clients.openWindow(`/?taskId=${data.taskId}`);
        }
      })
    );
  }
});
