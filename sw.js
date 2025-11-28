const CACHE_NAME = 'novel-app-v1';
const CACHE_FILES = [
    'index.html',
    'manifest.json',
    'https://testingcf.jsdelivr.net/gh/Tomkmonkey/EpubReading@main/epubFile/json/5.json',
    'https://testingcf.jsdelivr.net/gh/Tomkmonkey/tjOnlineFile@main/dianlutu/IMG_202511229021_1920x1080.png',
    'https://testingcf.jsdelivr.net/gh/Tomkmonkey/tjOnlineFile@main/icon/app-icon-192x192.png'
];

// 安装时缓存资源
self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(CACHE_FILES))
            .then(() => self.skipWaiting())
    );
});

// 激活时清理旧缓存
self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)));
        }).then(() => self.clients.claim())
    );
});

// 拦截请求并返回缓存资源
self.addEventListener('fetch', e => {
    e.respondWith(
        fetch(e.request).catch(() => caches.match(e.request))
    );
});