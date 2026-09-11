export interface UploadDocumentParams {
  clientId: string
  file: File
  requirementId?: string
}

export interface IngestedDocumentResponse {
  id: string
  client_id: string
  assigned_requirement_id: string | null
  file_name: string
  google_drive_file_id: string
  status: string
  uploaded_at: string
}

const API_BASE_URL = import.meta.env.VITE_TAX_DOC_API_ENDPOINT || '/api/v1'

export async function uploadFile({clientId, file, requirementId}: UploadDocumentParams): Promise<IngestedDocumentResponse>{
    const url = new URL(`${API_BASE_URL}clients/${clientId}/documents/upload`)

    if (requirementId) {
        url.searchParams.append('requirement_id', requirementId)
    }

    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(url.toString(),{
        method: 'POST',
        body: formData
    })

    if (!response.ok){
        const errMessage = await response.json().catch(()=>({}))
        throw new Error(errMessage || 'Error uploading a file')
    }

    return await response.json()
}