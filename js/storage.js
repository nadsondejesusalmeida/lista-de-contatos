export function saveToStorage(contacts) {
	const contactList = JSON.stringify(contacts);
	localStorage.setItem('contactList', contactList);
}

export function getFromStorage() {
	const rawData = localStorage.getItem('contactList');
	if (rawData) {
		const contacts = JSON.parse(rawData);
		return contacts;
	}
}