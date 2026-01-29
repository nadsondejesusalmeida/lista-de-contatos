const CACHE_NAME = 'contacts-v1';
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