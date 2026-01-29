const CACHE_NAME = 'contacts-v2';
const ASSETS = [
	'/lista-de-contatos/',
	'/lista-de-contatos/index.html',
	'/lista-de-contatos/style.css',
	'/lista-de-contatos/js/main.js',
	'/lista-de-contatos/js/api.js',
	'/lista-de-contatos/js/ui.js',
	'/lista-de-contatos/js/storage.js'
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