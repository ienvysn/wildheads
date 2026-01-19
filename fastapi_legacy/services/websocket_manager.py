from fastapi import WebSocket
from typing import List, Dict
import logging

logger = logging.getLogger(__name__)

class ConnectionManager:
    def __init__(self):
        # Store connections: "role:admin" -> [ws1, ws2], "user:1" -> [ws1]
        self.active_connections: List[dict] = []

    async def connect(self, websocket: WebSocket, user_id: int, role: str):
        await websocket.accept()
        connection_info = {
            "ws": websocket,
            "user_id": user_id,
            "role": role
        }
        self.active_connections.append(connection_info)
        logger.info(f"WebSocket connected: User {user_id} ({role})")

    def disconnect(self, websocket: WebSocket):
        self.active_connections = [c for c in self.active_connections if c["ws"] != websocket]

    async def broadcast(self, message: str):
        """Send to everyone"""
        for connection in self.active_connections:
            try:
                await connection["ws"].send_text(message)
            except Exception:
                pass # Already disconnected

    async def broadcast_to_role(self, message: str, role: str):
        """Send to all users with a specific role (e.g., 'doctor')"""
        for connection in self.active_connections:
            if connection["role"] == role or connection["role"] == "admin": # Admins see all
                try:
                    await connection["ws"].send_text(message)
                except Exception:
                    pass

    async def send_personal_message(self, message: str, user_id: int):
        """Send to a specific user"""
        for connection in self.active_connections:
            if connection["user_id"] == user_id:
                try:
                    await connection["ws"].send_text(message)
                except Exception:
                    pass

manager = ConnectionManager()
