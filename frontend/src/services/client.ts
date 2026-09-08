export interface ClientRequest{
    primary_name: string,
    spouse_name: string,
    tax_year: string
}

export interface ClientResponse{
    id: string;
    primary_name: string;
    spouse_name: string;
    tax_year: string;
    created_at: string;
}

const API_BASE_URL = import.meta.env.VITE_TAX_DOC_API_ENDPOINT || '/api/v1'

export async function getClients(): Promise<ClientResponse[]> {
    const url = `${API_BASE_URL}/clients`
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-type': "application/json"
        }
    });

    if(!response.ok){
        const errMessage = await response.json().catch(() => ({}))
        throw new Error(errMessage.detail || 'Failed to fetch clients (Status: ${response.status})')
    }

    return response.json();
}

export async function getClientById(client_id: string){
    const url = `${API_BASE_URL}/clients/${client_id}`
    const response = await fetch(url, {
        method: 'GET',
        headers:{
            'Content-type': 'application/json'
        }
    })

    if (!response.ok){
        const errMessage = await response.json().catch(() => ({}))
        throw new Error(errMessage.detail || 'Failed to fetch the client details (Status: ${response.status})')
    }

    return response.json();
}

export async function createClient(payload: ClientRequest) {
    const url = `${API_BASE_URL}/clients`
    const response = await fetch(url, {
        method: 'POST',
        headers:{
            'Content-type': "application/json"
        },
        body: JSON.stringify(payload)
    })

    if(!response.ok){
        const errMessage = await response.json().catch(() => ({}))
        throw new Error(errMessage.detail || 'Failed to create a client (Status: ${response.status})')
    }
    return response.json()
}

export async function deleteClient(client_id: string) {
    const url = `${API_BASE_URL}/clients/${client_id}`
    const response = await fetch(url,{
        method: 'DELETE',
    })

    if(!response.ok){
        const errMessage = await response.json().catch(() => ({}))
        throw new Error(errMessage.detail || 'Failed to delete a client (Status: ${response.status})')
    }
}