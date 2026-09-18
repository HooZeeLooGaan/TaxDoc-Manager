export interface UploadDocumentParams {
  clientId: string;
  file: File;
  requirementId?: string;
}

export interface IngestedDocumentResponse {
  id: string;
  client_id: string;
  assigned_requirement_id: string | null;

  file_name: string;
  file_id: string;
  file_size: string;
  mime_type: string;
  file_path: string;
  status: string;

  confidence_score: string;
  predicted_type: string;
  predicted_year: string;
  predicted_owner: string;
  flag_reason: string;

  uploaded_at: string;
}

export interface FileMetadataResponse {
  file_name: string;
  file_id: string;
  mime_type: string;
  file_size: string;
  file_path: string;
}

export const DocumentType = Object.freeze({
  FORM_1040: 'FORM 1040',
  GOVT_ID: 'GOVT_ID',
  W2: 'W-2',
});

const API_BASE_URL = import.meta.env.VITE_TAX_DOC_API_ENDPOINT || '/api/v1';

export async function uploadFile({
  clientId,
  file,
  requirementId,
}: UploadDocumentParams): Promise<IngestedDocumentResponse> {
  const url = new URL(`${API_BASE_URL}/clients/${clientId}/documents/upload`);
  if (requirementId) {
    url.searchParams.append('requirement_id', requirementId);
  }

  const formData = new FormData();
  formData.append('file', file);
  const response = await fetch(url.toString(), {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errMessage = await response.json().catch(() => ({}));
    throw new Error(errMessage || 'Error uploading a file');
  }
  return await response.json();
}

export async function getClientDocuments(clientId: string) {
  const params = new URLSearchParams({
    getReviewDocsOnly: 'true',
  });

  const url = `${API_BASE_URL}/clients/${clientId}/documents?${params}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'content-type': 'application/json',
    },
  });

  if (!response.ok) {
    const errMessage = await response.json().catch(() => ({}));
    throw new Error(errMessage || 'Error fetching all the client documents');
  }

  return await response.json();
}

export async function getDocumentMetadata(fileId: string) {
  const url = `${API_BASE_URL}/documents/${fileId}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'content-type': 'application/json',
    },
  });

  if (!response.ok) {
    const errMessage = await response.json().catch(() => ({}));
    throw new Error(errMessage || 'Error fetching file metadata');
  }
  return response.json();
}
