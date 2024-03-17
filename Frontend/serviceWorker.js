let CACHE_NAME = "sw-test-v1";
let urlsToCache = ["/"];

self.addEventListener("install", function(event) {
    //perform install steps
    event.waitUntil(
        caches.open(CACHE_NAME).then(function(cache) {
            console.log("Opened cache");
            return cache.addAll(urlsToCache);
        })
    );
});

self.addEventListener("activate", function(event) {
    console.log("service worker is activated");
});

