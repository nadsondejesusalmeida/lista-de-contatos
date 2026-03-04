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

const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

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

const pickRandom = (argument) => {
	if (typeof argument === 'number') {
		return Math.floor(Math.random() * Math.floor(argument)) + 1;
	}
	
	if (Array.isArray(argument)) {
		return argument[Math.floor(Math.random() * argument.length)];
	}
	
	console.error(`A função 'pickRandom' não recebeu nenhum valor válido.`);
	return '';
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

const isValidContact = (name, email) => {
	return !!name && emailRegex.test(email);
}

const deleteContact = (id) => {
	contacts = contacts.filter(contact => contact.id !== id);
	renderContactCards(contacts, contactList);
	saveToStorage(contacts);
}

const addErrorMessage = (selector, local = document) => {
	local.querySelector(selector).classList.add('error');
}

const addAllErrorMessages = (selectors, local = document) => {
	local.querySelectorAll(selectors).forEach(selector => {
		selector.classList.add('error');
	});
}

const removeErrorMessage = (selector) => {
	local.querySelector(selector).classList.remove('error');
}

const removeAllErrorMessages = (selectors, local = document) => {
	local.querySelectorAll(selectors).forEach(selector => {
		selector.classList.remove('error');
	});
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
		listContacts.forEach(({ name, email }) => {
			const newContact = {
				name,
				email: email.toLowerCase(),
				id: contacts.length + 1,
				color: pickRandom(iconContainerColors)
			}
			contacts.push(newContact);
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
	removeAllErrorMessages('.edit-field-text');
});

createContactButton.addEventListener('click', () => {
	contactEditingSection.removeAttribute('data-id');
	contactNameFromTheContactEditingSectionInput.value = '';
	contactEmailFromTheContactEditingSectionInput.value = '';
	contactEditingSectionIconContainer.textContent = '';
	addButton.classList.remove('active');
	removeAllErrorMessages('.edit-field-text');
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
		
		removeAllErrorMessages('.edit-field-text');
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

contactNameFromTheContactEditingSectionInput.addEventListener('input', (event) => {
	const targetInput = event.currentTarget;
	const editFieldText = targetInput.parentNode;
	
	// Nome indefinido
	if (!targetInput.value.trim()) {
		editFieldText.classList.add('error');
	} else {
		editFieldText.classList.remove('error');
	}
});

contactEmailFromTheContactEditingSectionInput.addEventListener('input', (event) => {
	const targetInput = event.currentTarget;
	const editFieldText = targetInput.parentNode;
	
	// Email inválido
	if (!emailRegex.test(targetInput.value.trim())) {
		editFieldText.classList.add('error');
	} else {
		editFieldText.classList.remove('error');
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
	const contactEmail = contactEmailFromTheContactEditingSectionInput.value.trim().toLowerCase();
	
	// Clique no botão de voltar para seção de informação de contato
	if (backToContactInformationSectionButton) {
		if (isNewContact) { // Caso seja um novo contato
			if (contactName && contactEmail) {
				const confirmBackToContactInformationSection = confirm('Existem alterações não salvas. Tem certeza de que deseja voltar?');
				if (confirmBackToContactInformationSection) {
					goToMainContactSection();
				}
			} else {
				goToMainContactSection();
			}
			return;
		}
		
		const { name, email } = contacts.find(contact => contact.id === sectionID);
		
		if (name.trim() === contactName && email.trim() === contactEmail) { // Não houve alteração
			goToContactInformationSection();
			return;
		}
		
		const confirmBackToContactInformationSection = confirm('Existem alterações não salvas. Tem certeza que deseja sair?');
		if (confirmBackToContactInformationSection) {
			goToContactInformationSection();
		}
		
		return;
	}
	
	// Clique no botão de salvar informação de contato
	if (saveContactInformationButton) {
		if (isNewContact) {
			// Contato inválido
			if (!isValidContact(contactName, contactEmail)) return;
			
			const newContact = {
				name: contactName,
				email: contactEmail,
				id: contacts.length + 1,
				color: pickRandom(iconContainerColors)
			};
			
			contacts.push(newContact);
			goToMainContactSection();
			showToast('Novo contato criado!', 'success');
		} else {
			if (!isValidContact(contactName, contactEmail)) return;
			
			const contactIndex = contacts.findIndex(contact => contact.id === sectionID);
			const currentContact = contacts[contactIndex];
			
			currentContact.name = contactName;
			currentContact.email = contactEmail;
			
			goToMainContactSection();
			showToast('Alterações salvas com sucesso!', 'success');
		}
		
		renderContactCards(contacts, contactList, 'Nenhum contato encontrado');
		saveToStorage(contacts);
		return;
	}
	
	// Clique no botão de excluir contato
	if (deleteContactButton) {
		if (isNewContact) {
			showToast('Você não pode excluir um contato que não foi criado!', 'error');
			return;
		}
		
		const confirmContactDeletion = confirm('Tem certeza que deseja excluir esse contato?');
		
		if (confirmContactDeletion) {
			const contactID = Number(targetSection.dataset.id);
			deleteContact(contactID);
			goToMainContactSection();
			showToast('Contato excluído com sucesso!', 'success');
		}
		return;
	}
});

// Executar o Service Worker no navegador
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