const CACHE_NAME = 'contacts-v1.0.1';
const VERSION = CACHE_NAME.split('-')[1];
const ASSETS = [
	'./',
	'./index.html',
	'./style.css',
	'./script.js',
	'./scripts/api.js',
	'./scripts/ui.js',
	'./scripts/storage.js'
];

// Instalação: o nascimento do Service Worker, baixando todos os arquivos necessário para o cache
self.addEventListener('install', (event) => {
	event.waitUntil( // Espera adicionar todos os arquivos no cache
		caches.open(CACHE_NAME).then((cache) => {
			return cache.addAll(ASSETS);
		})
	);
});

// Interceptação: verifica se já possui os arquivos no cache, se não, baixa na requisição
self.addEventListener('fetch', (event) => {
	event.respondWith( // SW vai decidir ao verificar se o arquivo que está sendo requisitado já está no cache, se não, requisita o arquivo.
		caches.match(event.request).then((response) => {
			return response || fetch(event.request);
		})
	);
});

// Escutar a mensagem enviada pelo script.js
self.addEventListener('message', (event) => {
	if (event.data.type === 'SKIP_WAITING') {
		self.skipWaiting();
	}
	
	if (event.data.type === 'GET_CACHE_NAME') {
		event.source.postMessage({ type: 'CACHE_NAME', name: CACHE_NAME });
	}
	
	if (event.data.type === 'GET_VERSION') {
		event.source.postMessage({ type: 'VERSION', version: VERSION });
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