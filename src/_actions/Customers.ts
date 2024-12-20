'use server'

import { Attributes2, CustomerData } from "../../types/customers-strape";

export interface userData {
	data: {
		first_name: string | null | undefined;
		last_name: string | null | undefined;
		email: string | undefined;
		phone: string | undefined;
		cpf? : string | undefined;
		address?: {
			street: string;
			number: string;
			complement: string;
			neighborhood: string;
			city: string;
			state: string;
			zipCode: string;
			country: string;
		}
	}
}

 
const handleFetchError = async (response: Response) => {
	if (!response.ok) {
		const errorData = await response.json();
		console.error("Resposta completa:", JSON.stringify(errorData));
		throw new Error(`Erro: ${JSON.stringify(errorData)}`);
	}
}
const fetchCustomerByEmail = async (email: string | undefined) => {
	const HOST = process.env.HOST;
	const tokenStrapi = process.env.STRAPI_TOKEN;
	const response = await fetch(`${HOST}/api/customers?filters[email][$eq]=${email}&populate=*`, {
		method: 'GET',
		headers: {
			"Authorization": `Bearer ${tokenStrapi}`,
		},
	});

	 
 	await handleFetchError(response);
	return response.json();
}

const createCustomerInAPI = async (user: userData) => {
	const HOST = process.env.HOST;
	const tokenStrapi = process.env.STRAPI_TOKEN;
	const response = await fetch(`${HOST}/api/customers`, {
		method: 'POST',
		headers: {
			"Authorization": `Bearer ${tokenStrapi}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ data: user.data })
	});
	await handleFetchError(response);
	return response.json();
}

export const getCustomerOrCreate = async (user: userData): Promise<CustomerData> => {
	if (!user) {
		throw new Error("Dados de usuário ou endereço ausentes");
	}
	const cliente = await fetchCustomerByEmail(user.data.email);
	if (cliente.data.length > 0) {
 		return cliente.data[0] as CustomerData
		
	} else {
		const newCustomer = await createCustomerInAPI(user);
		return newCustomer.data as CustomerData
	}
}
export const updateCustomer = async (customerId: string, user: userData): Promise<string> => {
	const HOST = process.env.HOST;
	const tokenStrapi = process.env.STRAPI_TOKEN;
 	const response = await fetch(`${HOST}/api/customers/${customerId}`, {
		method: 'PUT',
		headers: {
			"Authorization": `Bearer ${tokenStrapi}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ data: user.data })
	});
	await handleFetchError(response);
	const updatedCustomer = await response.json();
 	return updatedCustomer.data.id;
}

export const updateAddress = async (addressId: string, address: Attributes2) => {
	const HOST = process.env.HOST;
	const tokenStrapi = process.env.STRAPI_TOKEN;
	const response = await fetch(`${HOST}/api/enderecos/${addressId}`, {
		method: 'PUT',
		headers: {
			"Authorization": `Bearer ${tokenStrapi}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ data: address })
	});
	await handleFetchError(response);
	return response.json();
}

export const createAddressForCustomer = async (email: string | undefined, address: Attributes2) => {
	const customer = await fetchCustomerByEmail(email);
	const customerId = customer.data[0].id;
 	const HOST = process.env.HOST;
	const tokenStrapi = process.env.STRAPI_TOKEN;
	const response = await fetch(`${HOST}/api/enderecos`, {
		method: 'POST',
		headers: {
			"Authorization": `Bearer ${tokenStrapi}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ data: {
			...address,
			customer:{
				connect: [customerId]
			}
			},  })
	});
	await handleFetchError(response);
	return response.json();
}