import httpx
from typing import Dict, Any, Optional

class GoogleDriveClient():
    def __init__(self, root_folder: str, client_id: str, client_secret: str, refresh_token: str, base_url: str = "https://www.googleapis.com", upload_url: str = "https://www.googleapis.com/upload/drive/v3") -> None:
        self.root_folder = root_folder
        self.client_id = client_id
        self.client_secret = client_secret
        self.refresh_token = refresh_token
        self.base_url = base_url
        self.upload_url = upload_url

        self._access_token: Optional[str] = None
        self._token_url = "https://oauth2.googleapis.com/token"
        self.http_methods = {
            'GET', 'POST', 'PUT', 'DELETE', 'PATCH'
        }
        

    async def _get_access_token(self) -> Optional[str]:
        payload = {
            "client_id": self.client_id,
            "client_secret": self.client_secret,
            "refresh_token": self.refresh_token,
            "grant_type": "refresh_token",
        }

        async with httpx.AsyncClient() as client:
            res = await client.post(self._token_url, data=payload)
            res.raise_for_status()
            data = res.json()
            self._access_token = data["access_token"]
            return self._access_token

    async def _send_http_request(
        self, method: str, url: str, **kwargs
    ) -> httpx.Response:
        if not self._access_token:
            await self._get_access_token()

        headers = kwargs.pop("headers", {})
        headers["Authorization"] = f"Bearer {self._access_token}"

        async with httpx.AsyncClient() as client:
            res = await client.request(method, url, headers=headers, **kwargs)

            # If token expired, refresh and retry once
            if res.status_code == 401:
                await self._get_access_token()
                headers["Authorization"] = f"Bearer {self._access_token}"
                res = await client.request(
                    method, url, headers=headers, **kwargs
                )

            res.raise_for_status()
            return res

    async def get_file_metadata(self, file_id:str) -> Dict[str, Any]:    
        url=f"{self.base_url}/drive/v3/files/{file_id}"
        params={"fields": "id, name, mimeType, size, createdTime, md5Checksum"}
        response = await self._send_http_request('GET', url, params=params)
        return response.json()

    #
    async def get_file_content(self, file_id:str) -> bytes:
        url=f"{self.base_url}/drive/v3/files/{file_id}"
        params={"alt":"media"}
        response = await self._send_http_request("GET", url, params=params)
        return response.content


    async def get_or_create_folder(self, folder_name:str) -> str:
        url = f"{self.base_url}/drive/v3/files"

        query = (
            f"name = '{folder_name}' and "
            f"mimeType = 'application/vnd.google-apps.folder' and "
            f"'{self.root_folder}' in parents and "
            f"trashed = false"
        )
        params={"q": query, "fields": "files(id)"}

        response = await self._send_http_request("GET", url, params=params)
        files = response.json().get("files", [])

        if files:
            return files[0]["id"]

        payload = {
            "name": folder_name,
            "mimeType": "application/vnd.google-apps.folder",
            "parents": [self.root_folder]
        }

        response = await self._send_http_request("POST", url, json=payload)
        return response.json()["id"]

    async def upload_file(
        self,
        file_bytes: bytes,
        filename: str,
        folder_id: str,
        mime_type: str = "application/pdf",
    ) -> Dict[str, Any]:
        # Step 1: Initiate resumable session with explicit parent folder ID
        init_url = f"{self.upload_url}/drive/v3/files?uploadType=resumable"
        
        metadata_payload = {
            "name": filename,
            "parents": [folder_id],  # Ensures file is created directly inside target folder
            "mimeType": mime_type,
        }

        init_res = await self._send_http_request(
            "POST",
            init_url,
            json=metadata_payload,
            headers={"Content-Type": "application/json; charset=UTF-8"},
        )
        
        # Extract session URI
        session_url = init_res.headers["Location"]

        # Step 2: Upload raw binary content
        upload_res = await self._send_http_request(
            "PUT",
            session_url,
            content=file_bytes,
            headers={"Content-Type": mime_type},
        )
        
        return upload_res.json()

    async def delete_file(self, file_id: str, soft: bool = False) -> None:
        url = f"{self.base_url}/drive/v3/files/{file_id}"

        if soft:
            # Soft delete: move to trash
            await self._send_http_request("PATCH", url, json={"trashed": True})
        else:
            # Hard delete: purge completely
            await self._send_http_request("DELETE", url)