const CACHE_NAME = 'beetle-manager-v2.1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.json',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// 安装 Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(ASSETS_TO_CACHE);
      })
  );
});

// 激活 Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// 拦截网络请求
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // 如果在缓存中找到，直接返回
        if (response) {
          return response;
        }
        
        // 否则发起网络请求
        return fetch(event.request).then(
          (response) => {
            // 检查响应是否有效
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // 克隆响应，因为响应流只能读取一次
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                // 将响应添加到缓存
                // 注意：不要缓存 POST 请求或其他非 GET 请求
                if (event.request.method === 'GET') {
                    cache.put(event.request, responseToCache);
                }
              });

            return response;
          }
        );
      })
  );
});
