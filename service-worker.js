const CACHE_NAME = 'contacts-v1.0.0';
const ASSETS = [
	'./',
	'./index.html',
	'./style.css',
	'./js/main.js',
	'./js/api.js',
	'./js/ui.js',
	'./js/storage.js'
];

// Instalação
self.addEventListener('install', (event) => {
	event.waitUntil(
		caches.open(CACHE_NAME).then((cache) => {
			return cache.addAll(ASSETS);
		})
	);
});

// Interceptação
self.addEventListener('fetch', (event) => {
	event.respondWith(
		caches.match(event.request).then((response) => {
			return response || fetch(event.request);
		})
	);
});

// Escutar a mensagem enviada pelo main.js
self.addEventListener('message', (event) => {
	if (event.data.type === 'SKIP_WAITING') {
		self.skipWaiting();
	}
	
	if (event.data.type === 'GET_CACHE_NAME') {
		event.source.postMessage({ type: 'CACHE_NAME', name: CACHE_NAME });
	}
});

// Limpar os caches antigos automaticamente
self.addEventListener('activate', (event) => {
	event.waitUntil(
		caches.keys().then(keys => {
			return Promise.all(
				keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
			)
		})
	);
});