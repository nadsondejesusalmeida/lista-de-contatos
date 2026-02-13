export async function fetchContacts() {
	const response = await fetch('https://jsonplaceholder.typicode.com/users');
	
	if (!response.ok) {
		const error = new Error('Lista de usuários não encontrados no banco de dados.');
		error.code = 'NOT_FOUND';
		throw error;
	}
	
	return response.json();
}