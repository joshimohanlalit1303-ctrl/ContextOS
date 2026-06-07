import os
import requests
from typing import Dict, Any, List, Optional

class LibroError(Exception):
    """Base exception for Libro SDK errors."""
    pass

class LibroClient:
    def __init__(self, api_key: Optional[str] = None, base_url: str = "https://api.libro.ai"):
        self.api_key = api_key or os.environ.get("LIBRO_API_KEY")
        if not self.api_key:
            raise ValueError("API key is required. Pass it to the client or set LIBRO_API_KEY env var.")
        
        # Remove trailing slash
        self.base_url = base_url.rstrip("/")
        self.session = requests.Session()
        self.session.headers.update({
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        })

    def ingest(self, user_id: str, text: str, metadata: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Ingest a new memory for a user."""
        payload = {"endUserId": user_id, "text": text}
        if metadata is not None:
            payload["metadata"] = metadata

        res = self.session.post(f"{self.base_url}/api/v1/ingest", json=payload)
        self._check_response(res)
        return res.json()

    def get_context(self, user_id: str, query: str) -> Dict[str, Any]:
        """Retrieve relevant context for a user based on a query."""
        payload = {"endUserId": user_id, "query": query}
        res = self.session.post(f"{self.base_url}/api/v1/get-context", json=payload)
        self._check_response(res)
        return res.json()

    def forget(self, user_id: str, memory_id: Optional[str] = None, query: Optional[str] = None) -> Dict[str, Any]:
        """Delete a specific memory by ID, or memories matching a query for a user."""
        if not memory_id and not query:
            raise ValueError("Must provide either memory_id or query to forget.")
        
        payload = {"endUserId": user_id}
        if memory_id:
            payload["memoryId"] = memory_id
        if query:
            payload["query"] = query

        res = self.session.post(f"{self.base_url}/api/v1/forget", json=payload)
        self._check_response(res)
        return res.json()

    def update(self, user_id: str, memory_id: str, text: Optional[str] = None, metadata: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Update an existing memory's text or metadata."""
        if not text and not metadata:
            raise ValueError("Must provide either text or metadata to update.")
            
        payload = {"endUserId": user_id, "memoryId": memory_id}
        if text:
            payload["text"] = text
        if metadata is not None:
            payload["metadata"] = metadata

        res = self.session.post(f"{self.base_url}/api/v1/update", json=payload)
        self._check_response(res)
        return res.json()

    def _check_response(self, response: requests.Response):
        if not response.ok:
            try:
                err_data = response.json()
                msg = err_data.get("error", response.text)
            except Exception:
                msg = response.text
            raise LibroError(f"API Error {response.status_code}: {msg}")
