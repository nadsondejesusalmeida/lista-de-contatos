export function renderCards(contacts, local) {
	local.innerHTML = '';
	
	if (contacts.length === 0) {
		local.textContent = 'Nenhum contato encontrado';
		return;
	}
	
	contacts.forEach(contact => {
		const { name, email } = contact;
		const firstLetterOfTheName = name.charAt(0);
		
		const contactCard = document.createElement('div');
		contactCard.classList.add('contact-card');
		
		const iconBox = document.createElement('div');
		const detailsBox = document.createElement('div');
		
		iconBox.textContent = firstLetterOfTheName;
		iconBox.classList.add('icon-box');
		detailsBox.classList.add('details-box');
		
		const contactName = document.createElement('p');
		const contactEmail = document.createElement('p');
		
		contactName.textContent = name;
		contactName.classList.add('contact-name');
		
		contactEmail.textContent = email;
		contactEmail.classList.add('contact-email');
		
		detailsBox.appendChild(contactName);
		detailsBox.appendChild(contactEmail);
		
		contactCard.appendChild(iconBox);
		contactCard.appendChild(detailsBox);
		
		
		local.appendChild(contactCard);
	});
}