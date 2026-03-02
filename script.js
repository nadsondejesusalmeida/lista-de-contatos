import { fetchContacts } from './scripts/api.js';
import { saveToStorage, getFromStorage, cleanFromStorage } from './scripts/storage.js';
import { renderContactCards, showToast, showUpdateBanner } from '/assets/scripts/ui/index.js';

let contacts = getFromStorage() || [];

// Seção principal de contato
const mainContactSection = document.querySelector('#main-contact-section'),
contactSearchInput = mainContactSection.querySelector('#contact-search-input'),
syncButton = mainContactSection.querySelector('#sync-button'),
clearButton = mainContactSection.querySelector('#clear-button'),
contactList = mainContactSection.querySelector('#contact-list'),
addButton = mainContactSection.querySelector('#add-button'),
createContactButton = mainContactSection.querySelector('#create-contact-button');

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

const goToMainContactSection = () => {
	mainContactSection.removeAttribute('inert');
	
	contactInformationSection.setAttribute('inert', '');
	contactInformationSection.classList.remove('open');
	
	contactEditingSection.setAttribute('inert', '');
	contactEditingSection.classList.remove('open');
}

const goToContactInformationSection = () => {
	contactInformationSection.classList.add('open');
	contactInformationSection.removeAttribute('inert');

	mainContactSection.setAttribute('inert', '');
	contactEditingSection.setAttribute('inert', '');
	contactEditingSection.classList.remove('open');
}

const goToContactEditingSection = () => {
	contactEditingSection.classList.add('open');
	contactEditingSection.removeAttribute('inert');
	
	mainContactSection.setAttribute('inert', '');
	contactInformationSection.setAttribute('inert', '');
	contactInformationSection.classList.remove('open');
}

const deleteContact = (id) => {
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
			contacts.push(contact);
		});
		
		renderContactCards(contacts, contactList);
		saveToStorage(contacts);
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
		const contactName = contactCard.querySelector('.contact-name').innerText;
		const contactEmail = contactCard.querySelector('.contact-email').innerText;
		const firstLetterOfTheName = contactCard.querySelector('.icon-container').innerText;
		const iconColor = contactCard.querySelector('.icon-container').style.backgroundColor;
		
		contactInformationSection.dataset.id = contactCard.dataset.id;
		
		contactInformationSectionIconContainer.textContent = firstLetterOfTheName;
		
		contactInformationSectionIconContainer.style.backgroundColor = iconColor;
		
		contactInformationSection.querySelector('.contact-name .information-text').innerText = contactName;
		
		contactInformationSection.querySelector('.contact-email .information-text').innerText = contactEmail;
		
		goToContactInformationSection();
		return;
	}
});

addButton.addEventListener('click', (event) => {
	const targetButton = event.currentTarget;
	targetButton.classList.toggle('active');
});

createContactButton.addEventListener('click', () => {
	contactEditingSection.removeAttribute('data-id');
	contactNameFromTheContactEditingSectionInput.value = '';
	contactEmailFromTheContactEditingSectionInput.value = '';
	contactEditingSectionIconContainer.textContent = '';
	addButton.classList.remove('active');
	goToContactEditingSection();
});

// Eventos de cliques na seção de informação de contato
contactInformationSection.addEventListener('click', (event) => {
	const targetSection = event.currentTarget;
	const sectionID = Number(targetSection.dataset.id);
	
	const backToMainContactSectionButton = event.target.closest('.back-to-main-section-button');
	const editContactButton = event.target.closest('.edit-contact-button');
	const deleteContactButton = event.target.closest('.delete-contact-button');
	
	if (backToMainContactSectionButton) {
		goToMainContactSection();
		return;
	}
	
	if (editContactButton) {
		contactEditingSection.dataset.id = sectionID;
		
		contactEditingSectionIconContainer.textContent = contactInformationSectionIconContainer.textContent;
		
		contactEditingSectionIconContainer.style.backgroundColor = contactInformationSectionIconContainer.style.backgroundColor;
		
		contactNameFromTheContactEditingSectionInput.value = contactNameFromTheContactInformationSection.innerText;
		
		contactEmailFromTheContactEditingSectionInput.value = contactEmailFromTheContactInformationSection.innerText;
		
		goToContactEditingSection();
		return;
	}
	
	if (deleteContactButton) {
		const contactName = contactInformationSection.querySelector('.contact-name').innerText;
		const confirmContactDeletion = confirm(`Tem certeza que deseja excluir o contato ${contactName}?`);
		
		if (confirmContactDeletion) {
			deleteContact(sectionID);
			goToMainContactSection();
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
	const isNewContact = contacts.every(contact => contact.id !== sectionID);
	
	const backToContactInformationSectionButton = event.target.closest('.back-to-contact-information-section-button');
	const saveContactInformationButton = event.target.closest('.save-contact-information-button');
	const deleteContactButton = event.target.closest('.delete-contact-button');
	
	const contactName = contactNameFromTheContactEditingSectionInput.value.trim();
	const contactEmail = contactEmailFromTheContactEditingSectionInput.value.trim();
	
	if (backToContactInformationSectionButton) {
		if (isNewContact) {
			goToMainContactSection();
		} else {
			contacts.forEach(({ name, email, id }) => {
				if (sectionID !== id) {
					return;
				}
				
				if (name.trim() === contactName && email.trim() === contactEmail) {
					goToContactInformationSection();
				} else {
					const confirmBackTocontactEditingSection = confirm('Existem alterações não salvas. Tem certeza que deseja sair?');
					if (confirmBackTocontactEditingSection) {
						goToContactInformationSection();
					}
				}
			});
		}
		
		return;
	}
	
	if (saveContactInformationButton) {
		if (isNewContact) {
			const newContact = {
				name: contactName,
				email: contactEmail,
				id: contacts.length + 1,
				color: iconContainerColors[Math.floor(Math.random() * iconContainerColors.length)]
			}
			
			contacts.push(newContact);
			goToMainContactSection();
			showToast('Novo contato criado!', 'success');
		} else {
			contacts.forEach(contact => {
				if (contact.id === sectionID) {
					contact.name = contactNameFromTheContactEditingSectionInput.value.trim() || 'Nome indefinido';
					contact.email = contactEmailFromTheContactEditingSectionInput.value.trim() || 'E-mail indefinido';
					
					goToMainContactSection();
					showToast('Alterações salvas com sucesso!', 'success');
				}
			});
		}
		
		renderContactCards(contacts, contactList, 'Nenhum contato encontrado');
		saveToStorage(contacts);
		return;
	}
	
	if (deleteContactButton) {
		if (isNewContact) {
			showToast('Você não pode excluir um contato que não foi criado!', 'error');
		} else {
			const confirmContactDeletion = confirm('Tem certeza que deseja excluir esse contato?');
			
			if (confirmContactDeletion) {
				const contactID = Number(targetSection.dataset.id);
				deleteContact(contactID);
				goToMainContactSection();
				showToast('Contato excluído com sucesso!', 'success');
			}
			return;
		}
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

(function() {
	const buttons = document.querySelectorAll('#contact-information-section .button-container button, #contact-editing-section .button-container button');
	let tooltipTimeout, hideTooltipTimeout;
	
	buttons.forEach((button, index, array) => {
		const tooltip = button.parentNode.querySelector('.tooltip');
		
		button.addEventListener('pointerdown', () => {
			clearTimeout(tooltipTimeout);
			array.forEach(item => {
				item.classList.remove('active');
				item.parentNode.querySelector('.tooltip').setAttribute('inert', '');
			});
			
			tooltipTimeout = setTimeout(() => {
				button.classList.add('active');
				tooltip.removeAttribute('inert');
			}, 400);
		});
		
		button.addEventListener('pointerup', () => {
			clearTimeout(tooltipTimeout);
			hideTooltipTimeout = setTimeout(() => {
				button.classList.remove('active');
				tooltip.setAttribute('inert', '');
			}, 800);
		});
	})
})();