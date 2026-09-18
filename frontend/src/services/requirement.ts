// Runtime Object (exists in JS bundle at runtime)
export const RequirementStatus = Object.freeze({
  PENDING: 'PENDING',
  FULFILLED: 'FULFILLED',
  WAIVED: 'WAIVED',
} as const);

// Derived TypeScript Union Type: 'PENDING' | 'FULFILLED' | 'WAIVED'
export type RequirementStatusValue =
  (typeof RequirementStatus)[keyof typeof RequirementStatus];

export const RequirementSource = Object.freeze({
  SYSTEM_DEFAULT: 'SYSTEM_DERIVED',
  MANUAL_OVERRIDE: 'MANUAL',
} as const);

// Derived TypeScript Union Type: 'SYSTEM_DERIVED' | 'MANUAL'
export type RequirementSourceValue =
  (typeof RequirementSource)[keyof typeof RequirementSource];

export interface RequirementRequest {
  document_type: string;
  description: string;
  is_mandatory: boolean;
}

export interface RequirementUpdateRequest {
  status: RequirementStatusValue;
}

export interface RequirementResponse {
  id: string;
  client_id: string;
  document_type: string;
  description: string;
  is_mandatory: boolean;
  status: RequirementStatusValue;
  source: RequirementSourceValue;
}

const API_BASE_URL = import.meta.env.VITE_TAX_DOC_API_ENDPOINT || '/api/v1';

export async function getClientRequirements(clientId: string) {
  const url = `${API_BASE_URL}/clients/${clientId}/requirements`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-type': 'application/json',
    },
  });

  if (!response.ok) {
    const errMessage = await response.json().catch(() => ({}));
    throw new Error(
      errMessage.detail ||
        'Failed to fetch clients (Status: ${response.status})'
    );
  }

  return response.json();
}

export async function createClientRequirement(
  client_id: string,
  payload: RequirementRequest
) {
  const url = `${API_BASE_URL}/clients/${client_id}/requirements`;
  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: {
      'Content-type': 'application/json',
    },
  });

  if (!response.ok) {
    const errMessage = await response.json().catch(() => ({}));
    throw new Error(
      errMessage.detail ||
        'Failed to create the client requirement (Status: ${response.status})'
    );
  }
}

export async function rederiveClientRequirements(client_id: string) {
  const url = `${API_BASE_URL}/clients/${client_id}/requirements/rederive`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-type': 'applcation/json',
    },
  });

  if (!response.ok) {
    const errMessage = await response.json().catch(() => ({}));
    throw new Error(
      errMessage.detail ||
        'Failed creating client requirements (Status: ${response.status})'
    );
  }

  return response.json();
}

export async function updateRequirements(
  requirement_id: string,
  payload: RequirementUpdateRequest
) {
  const url = `${API_BASE_URL}/requirements/${requirement_id}`;
  const response = await fetch(url, {
    method: 'PATCH',
    body: JSON.stringify(payload),
    headers: {
      'Content-type': 'application/json',
    },
  });

  if (!response.ok) {
    const errMessage = await response.json().catch(() => ({}));
    throw new Error(
      errMessage.detail ||
        'Failed to update requirement status (Status: ${response.status})'
    );
  }
}
