export type RequirementStatus = {
    PENDING: 'PENDING',
    FULFILLED: 'FULFILLED',
    WAIVED: 'WAIVED'
}

export type RequirementSource = {
  SYSTEM_DEFAULT: 'SYSTEM_DEFAULT',
  MANUAL_OVERRIDE: 'MANUAL_OVERRIDE'
}

export interface RequirementResponse{
    id: string,
    client_id: string
    document_type: string
    description: string
    is_mandatory: boolean

}

const API_BASE_URL = import.meta.env.VITE_TAX_DOC_API_ENDPOINT || '/api/v1'

export async function getClientRequirements(clientId: string){
    const url = `${API_BASE_URL}/clients/${clientId}/requirements`
    const response = await fetch(url,{
        method: 'GET',
        headers: {
            'Content-type': 'application/json'
        }
    })

    if(!response.ok){
        const errMessage = await response.json().catch(() => ({}))
        throw new Error(errMessage.detail || 'Failed to fetch clients (Status: ${response.status})')
    }

    return response.json();
}