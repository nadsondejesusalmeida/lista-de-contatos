export function renderCards(contacts, local, message) {
	message = message ? message : 'Clique em sincronizar para baixar seus contatos.';
	local.innerHTML = '';
	
	if (contacts.length === 0) {
		local.textContent = message;
		return;
	}
	
	const deleteSVG = '<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" height="1.5em" width="1.5em"><path fill="currentColor" d="M13.05 42q-1.2 0-2.1-.9-.9-.9-.9-2.1V10.5H9.5q-.65 0-1.075-.425Q8 9.65 8 9q0-.65.425-1.075Q8.85 7.5 9.5 7.5h7.9q0-.65.425-1.075Q18.25 6 18.9 6h10.2q.65 0 1.075.425.425.425.425 1.075h7.9q.65 0 1.075.425Q40 8.35 40 9q0 .65-.425 1.075-.425.425-1.075.425h-.55V39q0 1.2-.9 2.1-.9.9-2.1.9Zm5.3-8.8q0 .65.425 1.075.425.425 1.075.425.65 0 1.075-.425.425-.425.425-1.075V16.25q0-.65-.425-1.075-.425-.425-1.075-.425-.65 0-1.075.425-.425.425-.425 1.075Zm8.3 0q0 .65.425 1.075.425.425 1.075.425.65 0 1.075-.425.425-.425.425-1.075V16.25q0-.65-.425-1.075-.425-.425-1.075-.425-.65 0-1.075.425-.425.425-.425 1.075Z"/></svg>';
	
	contacts.forEach(contact => {
		const { name, email, id, color } = contact;
		const firstLetterOfTheName = name.charAt(0);
		
		const contactCard = document.createElement('div');
		contactCard.classList.add('contact-card');
		contactCard.dataset.id = id;
		
		const userBox = document.createElement('div');
		const controlBox = document.createElement('div');
		
		userBox.classList.add('user-box');
		controlBox.classList.add('control-box');
		
		const iconBox = document.createElement('div');
		const detailsBox = document.createElement('div');
		
		iconBox.textContent = firstLetterOfTheName;
		iconBox.classList.add('icon-box');
		iconBox.style.backgroundColor = color;
		detailsBox.classList.add('details-box');
		
		const contactName = document.createElement('p');
		const contactEmail = document.createElement('p');
		
		contactName.textContent = name;
		contactName.classList.add('contact-name');
		
		contactEmail.textContent = email;
		contactEmail.classList.add('contact-email');
		
		const deleteContactButton = document.createElement('button');
		deleteContactButton.classList.add('delete-contact-button');
		deleteContactButton.innerHTML = deleteSVG;
		
		detailsBox.appendChild(contactName);
		detailsBox.appendChild(contactEmail);
		
		userBox.appendChild(iconBox);
		userBox.appendChild(detailsBox)
		
		controlBox.appendChild(deleteContactButton);
		
		contactCard.appendChild(userBox);
		contactCard.appendChild(controlBox);
		
		local.appendChild(contactCard);
	});
}