import os
import io
from typing import Dict, Any 
from uuid import UUID

from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseUpload, MediaIoBaseDownload

# ---------- Google Drive Client ----------
# 
class GoogleDriveClient:

    def __init__(self) -> None:
        self.creds_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
        self.root_folder = os.getenv("GOOGLE_DRIVE_PARENT_FOLDER_ID")

        if not self.creds_path or not os.path.exists(self.creds_path):
            raise FileNotFoundError("Service account key not found")

        self.scopes = ["https://www.googleapis.com/auth/drive.file"]
        credentials = service_account.Credentials.from_service_account_file(
            self.creds_path, scopes=self.scopes
        )
        self.google_service = build("drive", "v3", credentials=credentials)


    def get_or_create_client_folder(self, client_id: UUID, client_name: str):
        folder_name = f"{client_name}_{client_id}"
        query = (
            f"name = '{folder_name}' and "
            f"'{self.root_folder}' in parents and "
            "mimeType = 'application/vnd.google-apps.folder' and "
            "trashed = false"
        )

        response = self.google_service.files().list(q=query, fields="files(id, name)").execute()
        files = response.get("files", [])

        if files:
            return files[0]["id"]

        # Create subfolder inside parent folder
        folder_metadata = {
            "name": folder_name,
            "mimeType": "application/vnd.google-apps.folder",
            "parents": [self.root_folder]
        }
        folder = self.google_service.files().create(body=folder_metadata, fields="id").execute()
        return folder.get("id")

    def get_document_bytes(self, file_id) -> bytes:
        request = self.google_service.files().get().get_media(fileId=file_id)
        file_stream = io.BytesIO()
        downloader = MediaIoBaseDownload(file_stream, request)

        done = False
        while not done:
            _, done = downloader.next_chunk()

        return file_stream.getvalue()

    def upload_file_bytes(self, file_bytes: bytes, filename: str, content_type: str, folder_id: str) -> Dict[str, Any]:
        file_metadata = {
            "name": filename,
            "parents": [folder_id]
        }
        
        media = MediaIoBaseUpload(
            io.BytesIO(file_bytes),
            mimetype=content_type,
            resumable=False
        )

        uploaded_file = self.google_service.files().create(
            body=file_metadata,
            media_body=media,
            fields="id, name, webViewLink, webContentLink",
            supportsAllDrives=True
        ).execute()

        return {
            "drive_file_id": uploaded_file.get("id"),
            "file_name": uploaded_file.get("name"),
            "web_view_link": uploaded_file.get("webViewLink"),
            "web_content_link": uploaded_file.get("webContentLink")
        }

    def delete_file(self, file_id: str) -> None:
        self.google_service.files().delete(fileId=file_id).execute()