import asyncio
from typing import Dict, List, Any
from datetime import datetime
import json

class ChatService:
    def __init__(self):
        self.active_connections: Dict[int, Dict[str, List]] = {}  # mandant_id -> channel -> connections
        self.message_history: Dict[int, Dict[str, List]] = {}     # mandant_id -> channel -> messages
        self.channels = ['allgemein', 'proben', 'auftritte', 'technik', 'verwaltung']

    async def connect(self, mandant_id: int, channel: str, websocket):
        """Verbindet einen Client mit einem Chat-Kanal"""
        if mandant_id not in self.active_connections:
            self.active_connections[mandant_id] = {}
        if channel not in self.active_connections[mandant_id]:
            self.active_connections[mandant_id][channel] = []

        self.active_connections[mandant_id][channel].append(websocket)

        # Sende Begrüßungsnachricht
        welcome_message = {
            'type': 'system',
            'content': f'Verbindung zu Kanal "{channel}" hergestellt',
            'timestamp': datetime.now().isoformat(),
            'user': 'System'
        }
        await self.send_personal_message(welcome_message, websocket)

        # Sende letzte Nachrichten
        recent_messages = self.get_recent_messages(mandant_id, channel, limit=20)
        for message in recent_messages:
            await self.send_personal_message(message, websocket)

    async def disconnect(self, mandant_id: int, channel: str, websocket):
        """Trennt einen Client von einem Chat-Kanal"""
        if mandant_id in self.active_connections and channel in self.active_connections[mandant_id]:
            if websocket in self.active_connections[mandant_id][channel]:
                self.active_connections[mandant_id][channel].remove(websocket)

    async def send_message(self, mandant_id: int, channel: str, message: Dict[str, Any]):
        """Sendet eine Nachricht an alle Clients in einem Kanal"""
        # Nachricht zur Historie hinzufügen
        if mandant_id not in self.message_history:
            self.message_history[mandant_id] = {}
        if channel not in self.message_history[mandant_id]:
            self.message_history[mandant_id][channel] = []

        message['timestamp'] = datetime.now().isoformat()
        self.message_history[mandant_id][channel].append(message)

        # Begrenze Historie auf 1000 Nachrichten pro Kanal
        if len(self.message_history[mandant_id][channel]) > 1000:
            self.message_history[mandant_id][channel] = self.message_history[mandant_id][channel][-1000:]

        # Nachricht an alle verbundenen Clients senden
        if mandant_id in self.active_connections and channel in self.active_connections[mandant_id]:
            for connection in self.active_connections[mandant_id][channel]:
                try:
                    await connection.send_text(json.dumps(message))
                except Exception:
                    # Entferne fehlerhafte Verbindungen
                    await self.disconnect(mandant_id, channel, connection)

    async def send_personal_message(self, message: Dict[str, Any], websocket):
        """Sendet eine persönliche Nachricht an einen Client"""
        try:
            await websocket.send_text(json.dumps(message))
        except Exception:
            pass

    def get_recent_messages(self, mandant_id: int, channel: str, limit: int = 50) -> List[Dict[str, Any]]:
        """Gibt die letzten Nachrichten eines Kanals zurück"""
        if mandant_id in self.message_history and channel in self.message_history[mandant_id]:
            return self.message_history[mandant_id][channel][-limit:]
        return []

    def get_active_channels(self, mandant_id: int) -> List[str]:
        """Gibt alle verfügbaren Kanäle für einen Mandanten zurück"""
        return self.channels

    def get_channel_stats(self, mandant_id: int) -> Dict[str, Any]:
        """Gibt Statistiken für alle Kanäle eines Mandanten zurück"""
        stats = {}
        for channel in self.channels:
            message_count = len(self.message_history.get(mandant_id, {}).get(channel, []))
            active_users = len(self.active_connections.get(mandant_id, {}).get(channel, []))
            stats[channel] = {
                'messages': message_count,
                'active_users': active_users,
                'last_activity': None
            }

            # Finde letzte Aktivität
            if message_count > 0:
                last_message = self.message_history[mandant_id][channel][-1]
                stats[channel]['last_activity'] = last_message.get('timestamp')

        return stats

    async def broadcast_system_message(self, mandant_id: int, content: str):
        """Sendet eine Systemnachricht an alle Kanäle eines Mandanten"""
        system_message = {
            'type': 'system',
            'content': content,
            'timestamp': datetime.now().isoformat(),
            'user': 'System'
        }

        for channel in self.channels:
            await self.send_message(mandant_id, channel, system_message)

# Globale Chat-Instanz
chat_service = ChatService()