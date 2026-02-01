import { fetchContacts } from './api.js';
import { saveToStorage, getFromStorage, cleanFromStorage } from './storage.js';
import { renderCards } from './ui.js';

let contacts = getFromStorage() || [];

const mainSection = document.querySelector('#main-section');
const contactSearchInput = document.querySelector('#contact-search-input');
const syncButton = document.querySelector('#sync-button');
const clearButton = document.querySelector('#clear-button');
const contactList = document.querySelector('#contact-list');

const contactInformationSection = document.querySelector('#contact-information-section');

const iconBoxColors = [
	'#C04018',
	'#A2184C',
	'#0871AB',
	'#AF2A2A',
	'#08655A',
	'#077D89',
	'#C04119',
	'#347636',
	'#CB6705',
	'#067D89',
	'#0871AB'
];

function deleteContact(id) {
	contacts = contacts.filter(contact => contact.id !== id);
	renderCards(contacts, contactList);
	saveToStorage(contacts);
}

function showUpdateBanner(registration) {
	const banner = document.createElement('div');
	banner.classList.add('update-banner');
	banner.innerHTML = `
		<p>Nova versão disponível!</p>
		<button id="update-confirm"
	`;
	
	document.body.appendChild(banner);
	document.getElementById('update-confirm').addEventListener('click', () => {
		// Avisar o Service Worker para pular a espera
		if (registration.waiting) {
			registration.waiting.postMessage({ type: 'SKIP_WAITING' });
		}
		
		window.location.reload();
	});
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
		listContacts.forEach(contact => {
			contact.color = iconBoxColors[Math.floor(Math.random() * iconBoxColors.length)];
		});
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
	const targetList = event.currentTarget;
	const contactCard = event.target.closest('.contact-card');
	
	if (contactCard) {
		mainSection.setAttribute('inert', '');
		contactInformationSection.removeAttribute('inert');
		
		const contactName = contactCard.querySelector('.contact-name').innerText;
		const contactEmail = contactCard.querySelector('.contact-email').innerText;
		const firstLetterOfTheName = contactCard.querySelector('.icon-box').innerText;
		const iconColor = contactCard.querySelector('.icon-box').style.backgroundColor;
		const contactID = contactCard.dataset.id;
		
		contactInformationSection.dataset.id = contactID;
		contactInformationSection.querySelector('.icon-box').textContent = firstLetterOfTheName;
		contactInformationSection.querySelector('.icon-box').style.backgroundColor = iconColor;
		contactInformationSection.querySelector('.contact-name .information-text').innerText = contactName;
		contactInformationSection.querySelector('.contact-email .information-text').innerText = contactEmail;
		contactInformationSection.classList.add('open');
	}
});

contactInformationSection.addEventListener('click', (event) => {
	const backToMainSectionButton = event.target.closest('.back-to-main-section-button');
	const editContactButton = event.target.closest('.edit-contact-button');
	const deleteContactButton = event.target.closest('.delete-contact-button');
	
	if (backToMainSectionButton) {
		contactInformationSection.classList.remove('open');
		return;
	}
	
	if (deleteContactButton) {
		const contactName = contactInformationSection.querySelector('.contact-name').innerText;
		const confirmContactDeletion = confirm(`Tem certeza que deseja excluir o contato ${contactName}?`);
		
		if (confirmContactDeletion) {
			deleteContact(Number(contactInformationSection.dataset.id));
			contactInformationSection.classList.remove('open');
			return;
		}
		return;
	}
});

contactInformationSection.addEventListener('dblclick', (event) => {
	const informationField = event.target.closest('.information-field');
	if (informationField) {
		const informationText = informationField.innerText;
		navigator.clipboard.writeText(informationText);
		
		const temporaryMessage = document.createElement('div');
		temporaryMessage.classList.add('temporary-message');
		temporaryMessage.textContent = 'Copiado para a área de transferência';
		document.body.appendChild(temporaryMessage);
		
		setTimeout(() => {
			document.body.removeChild(temporaryMessage);
		}, 1500)
	}
});

renderCards(contacts, contactList);

if ('serviceWorker' in navigator) {
	window.addEventListener('load', () => {
		// Monitoramento de um novo Service Worker
		navigator.serviceWorker.register('../service-worker.js').then(registration => {
			console.log('Service Worker registrado', registration);
			
			registration.addEventListener('updatefound', () => {
				const newWorker = registration.installing;
				
				newWorker.addEventListener('statechange', () => {
					if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
						showUpdateBanner(registration);
					}
				});
			});
		}).catch(error => console.log('Falha ao registrar Service Worker', error));
	});
}