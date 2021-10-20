const CACHE_STATIC_NAME = "static-v1";
const CACHE_INMUTABLE_NAME = "inmutable-v1";
const CACHE_DINAMYC_NAME = "dinamyc-v1";

function cleanCache(cacheName, sizeItems) {
  caches.open(cacheName).then((cache) => {
    cache.keys().then((keys) => {
      if (keys.length >= sizeItems) {
        cache.delete(keys[0]).then(() => {
          cleanCache(cacheName, sizeItems);
        });
      }
    });
  });
}

self.addEventListener("install", (event) => {
  const promesaCache = caches.open(CACHE_STATIC_NAME).then((cache) => {
    return cache.addAll([
      "./",
      "./index.html",
      "./css/page.css",
      "./images/inicio.jpg",
      "./images/generica.jpg",
      "./js/app.js",
      "./pages/view-offline.html",
    ]);
  });

  const promesaInmutable = caches
    .open(CACHE_INMUTABLE_NAME)
    .then((cacheInmutable) => {
      return cacheInmutable.addAll([
        "https://cdn.jsdelivr.net/npm/bootstrap@4.6.0/dist/css/bootstrap.min.css",
        "https://cdnjs.cloudflare.com/ajax/libs/jquery/3.1.0/jquery.js",
      ]);
    });

  event.waitUntil(Promise.all([promesaCache, promesaInmutable]));
});

self.addEventListener("activate", (event) => {
  const resDelCache = caches.keys().then((keys) => {
    keys.forEach((key) => {
      if (key !== CACHE_STATIC_NAME && key.includes("static")) {
        return caches.delete(key);
      }
    });
  });

  event.waitUntil(resDelCache);
});

self.addEventListener("fetch", (event) => {
  const respuesta = caches.match(event.request).then((response) => {
    if (response) {
      return response;
    }

    return fetch(event.request)
      .then((res) => {
        caches.open(CACHE_DINAMYC_NAME).then((cache) =>
          cache.put(event.request, res).then(() => {
            cleanCache(CACHE_DINAMYC_NAME, 6);
          })
        );

        return res.clone();
      })
      .catch(() => {
        if (event.request.headers.get("accept").includes("text/html")) {
          return caches.match("./pages/view-offline.html");
        }

        if (event.request.headers.get("accept").includes("image/")) {
          return caches.match("./images/generica.jpg");
        }
      });
  });

  event.respondWith(respuesta);
});
