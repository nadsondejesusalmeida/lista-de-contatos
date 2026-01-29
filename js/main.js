import { fetchContacts } from './api.js';
import { saveToStorage, getFromStorage, cleanFromStorage } from './storage.js';
import { renderCards } from './ui.js';

let contacts = getFromStorage() || [];

const contactSearchInput = document.querySelector('#contact-search-input');
const syncButton = document.querySelector('#sync-button');
const clearButton = document.querySelector('#clear-button');
const contactList = document.querySelector('#contact-list');

function deleteContact(id) {
	contacts = contacts.filter(contact => contact.id !== id);
	renderCards(contacts, contactList);
	saveToStorage(contacts);
}

contactSearchInput.addEventListener('input', (event) => {
	const searchTerm = event.target.value.toLowerCase().trim();
	const filteredContacts = contacts.filter(contact => contact.name.toLowerCase().includes(searchTerm));
	
	 renderCards(filteredContacts, contactList, 'Nenhum contato encontrado.');
});

syncButton.addEventListener('click', async (event) => {
	const targetButton = event.currentTarget;
	targetButton.disabled = true;
	
	try {
		const listContacts = await fetchContacts();
		contacts = listContacts;
		renderCards(listContacts, contactList);
		saveToStorage(listContacts);
	} catch (error) {
		console.error(error);
	} finally {
		targetButton.disabled = false;
		
		console.log('Operação de sincronização finalizado!');
	}
});

clearButton.addEventListener('click', () => {
	contacts = [];
	cleanFromStorage();
	renderCards(contacts, contactList);
	contactList.textContent = 'Clique em sincronizar para baixar seus contatos.';
});

contactList.addEventListener('click', (event) => {
	const deleteContactButton = event.target.closest('.delete-contact-button');
	if (deleteContactButton) {
		const confirmContactDeletion = confirm('Você tem certeza que deseja excluir este contato?');
		
		if (confirmContactDeletion) {
			const card = deleteContactButton.closest('.contact-card');
			const userId = Number(card.dataset.id);
			
			deleteContact(userId);
		}
	}
});

renderCards(contacts, contactList);

if ('serviceWorker' in navigator) {
	window.addEventListener('load', () => {
		navigator.serviceWorker.register('../sw.js').then(reg => console.log('Service Worker registrado!', reg)).catch(error => console.log('Falha ao registrar SW', error));
	})
}