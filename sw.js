const CACHE_NAME = "parent-child-cache-v1";
const CACHE_RESOURCES = [
  "index.html",
  "https://unpkg.com/vue@3/dist/vue.global.js",
  "icon-192x192.png",
  "icon-512x512.png",
  "manifest.json"
];

// 安装时缓存核心资源
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CACHE_RESOURCES))
  );
  self.skipWaiting(); // 立即激活新的Service Worker
});

// 拦截请求，优先使用缓存
self.addEventListener("fetch", (event) => {
  // 只处理同源请求和Vue依赖，避免跨域问题
  if (event.request.mode === "navigate" || 
      (event.request.url.includes("vue.global.js") && event.request.mode === "no-cors")) {
    event.respondWith(
      caches.match(event.request)
        .then((cachedResponse) => cachedResponse || fetch(event.request))
    );
  }
});

// 激活时删除旧缓存
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim(); // 控制所有打开的页面
});
