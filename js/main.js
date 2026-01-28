import { fetchContacts } from './api.js';
import { saveToStorage, getFromStorage } from './storage.js';
import { renderCards } from './ui.js';

let contacts = getFromStorage() || [];

const contactSearchInput = document.querySelector('#contact-search-input');
const syncButton = document.querySelector('#sync-button');
const contactList = document.querySelector('#contact-list');

renderCards(contacts, contactList);

contactSearchInput.addEventListener('input', (event) => {
	const searchTerm = event.target.value.toLowerCase().trim();
	const filteredContacts = contacts.filter(contact => contact.name.toLowerCase().includes(searchTerm));
	
	 renderCards(filteredContacts, contactList);
});

syncButton.addEventListener('click', async (event) => {
	const targetButton = event.currentTarget;
	targetButton.disabled = true;
	
	try {
		const listContacts = await fetchContacts();
		renderCards(listContacts, contactList);
		saveToStorage(listContacts);
	} catch (error) {
		console.error(error);
	} finally {
		targetButton.disabled = false;
		
		console.log('Operação de sincronização finalizado!');
	}
});

if (contactList.children.length === 0) {
	contactList.textContent = 'Clique em sincronizar para baixar seus contatos.';
}