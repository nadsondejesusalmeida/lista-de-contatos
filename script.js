import { fetchContacts } from './scripts/api.js';
import { saveToStorage, getFromStorage, cleanFromStorage } from './scripts/storage.js';
import { renderContactCards, showToast, showUpdateBanner } from '/assets/scripts/ui/index.js';

let contacts = getFromStorage() || [];

// Seção principal de contato
const mainContactSection = document.querySelector('#main-contact-section'),
contactSearchInput = mainContactSection.querySelector('#contact-search-input'),
syncButton = mainContactSection.querySelector('#sync-button'),
clearButton = mainContactSection.querySelector('#clear-button'),
contactList = mainContactSection.querySelector('#contact-list');

// Seção de informação de contato
const contactInformationSection = document.querySelector('#contact-information-section'),
contactInformationSectionIconContainer = contactInformationSection.querySelector('.icon-container'),
contactNameFromTheContactInformationSection = contactInformationSection.querySelector('.contact-name'),
contactEmailFromTheContactInformationSection = contactInformationSection.querySelector('.contact-email');

// Seção de edição de contato
const contactEditingSection = document.querySelector('#contact-editing-section'),
contactEditingSectionIconContainer = contactEditingSection.querySelector('.icon-container'),
contactNameFromTheContactEditingSectionInput = contactEditingSection.querySelector('#edit-contact-name'),
contactEmailFromTheContactEditingSectionInput = contactEditingSection.querySelector('#edit-contact-email');

// Cores de contêiner de ícones
const iconContainerColors = [
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

async function getVersion(worker) {
	return new Promise((resolve) => {
		const messageChannel = new MessageChannel();
		messageChannel.port1.onmessage = (event) => {
			if (event.data.type === 'VERSION') {
				resolve(event.data.version);
			}
		}
		
		worker.postMessage({ type: 'GET_VERSION' }, [messageChannel.port2]);
	});
}

function deleteContact(id) {
	contacts = contacts.filter(contact => contact.id !== id);
	renderContactCards(contacts, contactList);
	saveToStorage(contacts);
}

window.addEventListener('online', () => {
	showToast('Conexão restabelecida!', 'success');
});

window.addEventListener('offline', () => {
	showToast('Vocé está offline. Usando dados locais', 'error');
});

// Canpo de pesquisa de contato
contactSearchInput.addEventListener('input', (event) => {
	const searchTerm = event.target.value.toLowerCase().trim();
	const filteredContacts = contacts.filter(contact => contact.name.toLowerCase().includes(searchTerm));
	
	 renderContactCards(filteredContacts, contactList, 'Nenhum contato encontrado.');
});

// Evento de clique no botão de sincronização com os dados atuais
syncButton.addEventListener('click', async (event) => {
	const targetButton = event.currentTarget;
	targetButton.disabled = true;
	
	try {
		const listContacts = await fetchContacts();
		listContacts.forEach(contact => {
			contact.color = iconContainerColors[Math.floor(Math.random() * iconContainerColors.length)];
		});
		contacts = listContacts;
		
		renderContactCards(listContacts, contactList);
		saveToStorage(listContacts);
		showToast('Contatos atualizados!', 'success');
	} catch (error) {
		showToast('Erro ao conectar ao servidor! Verifique sua conexão e tente novamente.', 'error');
		console.error(error);
	} finally {
		targetButton.disabled = false;
		console.log('Operação de sincronização finalizado!');
	}
});

// Evento de clique no botão de limpar todos os contatos
clearButton.addEventListener('click', () => {
	if (contacts.length === 0) {
		showToast('Você não tem contatos!', 'error');
		return;
	}
	
	const confirmClearButton = confirm('Você tem certeza de que deseja excluir todos os seus contatos?');
	if (confirmClearButton) {
		contacts = [];
		cleanFromStorage();
		renderContactCards(contacts, contactList);
		contactList.textContent = 'Clique em sincronizar para baixar seus contatos.';
		showToast('Todos os seus contatos foram excluídos com sucesso!', 'success');
	}
});

// Eventos de clique na lista de contatos
contactList.addEventListener('click', (event) => {
	const targetList = event.currentTarget;
	const contactCard = event.target.closest('.contact-card');
	
	if (contactCard) {
		mainContactSection.setAttribute('inert', '');
		contactInformationSection.removeAttribute('inert');
		
		const contactName = contactCard.querySelector('.contact-name').innerText;
		const contactEmail = contactCard.querySelector('.contact-email').innerText;
		const firstLetterOfTheName = contactCard.querySelector('.icon-container').innerText;
		const iconColor = contactCard.querySelector('.icon-container').style.backgroundColor;
		const contactID = contactCard.dataset.id;
		
		contactInformationSection.dataset.id = contactID;
		
		contactInformationSectionIconContainer.textContent = firstLetterOfTheName;
		
		contactInformationSectionIconContainer.style.backgroundColor = iconColor;
		
		contactInformationSection.querySelector('.contact-name .information-text').innerText = contactName;
		
		contactInformationSection.querySelector('.contact-email .information-text').innerText = contactEmail;
		
		contactInformationSection.classList.add('open');
	}
});

// Eventos de cliques na seção de informação de contato
contactInformationSection.addEventListener('click', (event) => {
	const targetSection = event.currentTarget;
	const sectionID = Number(targetSection.dataset.id);
	
	const backToMainContactSectionButton = event.target.closest('.back-to-main-section-button');
	const editContactButton = event.target.closest('.edit-contact-button');
	const deleteContactButton = event.target.closest('.delete-contact-button');
	
	if (backToMainContactSectionButton) {
		contactInformationSection.classList.remove('open');
		contactInformationSection.setAttribute('inert', '');
		mainContactSection.removeAttribute('inert');
		return;
	}
	
	if (editContactButton) {
		targetSection.classList.remove('open');
		targetSection.setAttribute('inert', '');
		
		contactEditingSection.removeAttribute('inert');
		contactEditingSection.dataset.id = sectionID;
		contactEditingSection.classList.add('open');
		
		contactEditingSectionIconContainer.textContent = contactInformationSectionIconContainer.textContent;
		
		contactEditingSectionIconContainer.style.backgroundColor = contactInformationSectionIconContainer.style.backgroundColor;
		
		contactNameFromTheContactEditingSectionInput.value = contactNameFromTheContactInformationSection.innerText;
		
		contactEmailFromTheContactEditingSectionInput.value = contactEmailFromTheContactInformationSection.innerText;
		return;
	}
	
	if (deleteContactButton) {
		const contactName = contactInformationSection.querySelector('.contact-name').innerText;
		const confirmContactDeletion = confirm(`Tem certeza que deseja excluir o contato ${contactName}?`);
		
		if (confirmContactDeletion) {
			targetSection.setAttribute('inert', '');
			mainContactSection.removeAttribute('inert');
			deleteContact(sectionID);
			contactInformationSection.classList.remove('open');
			showToast(`${contactName} foi excluído da sua lista de contatos!`, 'success');
		}
		
		return;
	}
});

// Evento de duplo clique na seção de contato
contactInformationSection.addEventListener('dblclick', (event) => {
	const informationField = event.target.closest('.information-field');
	if (informationField) {
		const informationText = informationField.innerText;
		navigator.clipboard.writeText(informationText);
		
		showToast('Copiado para a área de transferência', 'success');
	}
});

// Eventos de seção de editar contato
contactEditingSection.addEventListener('click', (event) => {
	const targetSection = event.currentTarget;
	const sectionID = Number(targetSection.dataset.id);
	
	const backToContactInformationSectionButton = event.target.closest('.back-to-contact-information-section-button');
	const saveContactInformationButton = event.target.closest('.save-contact-information-button');
	const deleteContactButton = event.target.closest('.delete-contact-button');
	
	if (backToContactInformationSectionButton) {
		contacts.forEach(contact => {
			if (sectionID !== contact.id) {
				return;
			}
			
			if (contact.name === contactNameFromTheContactEditingSectionInput.value && contact.email === contactEmailFromTheContactEditingSectionInput.value) {
				contactInformationSection.classList.add('open');
				contactInformationSection.removeAttribute('inert');
				
				targetSection.setAttribute('inert', '');
				targetSection.classList.remove('open');
			} else {
				const confirmBackTocontactEditingSection = confirm('Existem alterações não salvas. Tem certeza que deseja sair?');
				if (confirmBackTocontactEditingSection) {
					contactInformationSection.classList.add('open');
					contactInformationSection.removeAttribute('inert');
					
					targetSection.setAttribute('inert', '');
					targetSection.classList.remove('open');
				}
			}
		});
		
		return;
	}
	
	if (saveContactInformationButton) {
		contacts.forEach(contact => {
			if (contact.id === sectionID) {
				contact.name = contactNameFromTheContactEditingSectionInput.value.trim() || 'Nome do contato não definido';
				contact.email = contactEmailFromTheContactEditingSectionInput.value.trim() || 'E-mail do contato não definido';
				
				contactEditingSection.classList.remove('open');
				contactEditingSection.setAttribute('inert', '');
				
				mainContactSection.removeAttribute('inert');
				showToast('Alterações salvas com sucesso!', 'success');
			}
		});
		
		renderContactCards(contacts, contactList, 'Nenhum contato encontrado');
		saveToStorage(contacts);
		return;
	}
	
	if (deleteContactButton) {
		const confirmContactDeletion = confirm('Tem certeza que deseja excluir esse contato?');
		
		if (confirmContactDeletion) {
			mainContactSection.removeAttribute('inert');
			deleteContact(Number(targetSection.dataset.id));
			targetSection.setAttribute('inert', '');
			targetSection.classList.remove('open');
			showToast('Contato excluído com sucesso!', 'success');
		}
		
		return;
	}
});

if ('serviceWorker' in navigator) {
	window.addEventListener('load', () => {
		// Monitoramento de um novo Service Worker
		navigator.serviceWorker.register('./service-worker.js').then(async (registration) => {
			console.log('Service Worker registrado', registration);
			
			await navigator.serviceWorker.ready;
			const activeWorker = registration.active;
			
			if (activeWorker) {
				getVersion(activeWorker).then(version => {
					const span = document.createElement('span');
					span.id = 'app-version';
					span.textContent = version;
					mainContactSection.appendChild(span);
				});
			}
			
			registration.addEventListener('updatefound', () => {
				const newWorker = registration.installing;
				
				newWorker.addEventListener('statechange', () => {
					if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
						showUpdateBanner(registration);
					}
				});
			});
		}).catch(error => console.error('Falha ao registrar Service Worker', error));
	});
}

renderContactCards(contacts, contactList);