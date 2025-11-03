const API_BASE_URL = 'http://localhost:3001/api';

export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: string;
  subject?: string;
  hasSteps?: boolean;
  hasCode?: boolean;
  isStreaming?: boolean;
}

export interface Chat {
  id: string;
  name: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export const chatAPI = {
  // Get all chats
  getAll: async (): Promise<Chat[]> => {
    const response = await fetch(`${API_BASE_URL}/chats`);
    if (!response.ok) throw new Error('Failed to fetch chats');
    return response.json();
  },

  // Get specific chat by ID
  getById: async (id: string): Promise<Chat> => {
    const response = await fetch(`${API_BASE_URL}/chats/${id}`);
    if (!response.ok) throw new Error('Failed to fetch chat');
    return response.json();
  },

  // Create new chat
  create: async (chat: Omit<Chat, 'createdAt' | 'updatedAt'>): Promise<Chat> => {
    const response = await fetch(`${API_BASE_URL}/chats`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(chat),
    });
    if (!response.ok) throw new Error('Failed to create chat');
    return response.json();
  },

  // Update chat
  update: async (id: string, chat: Partial<Chat>): Promise<Chat> => {
    const response = await fetch(`${API_BASE_URL}/chats/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(chat),
    });
    if (!response.ok) throw new Error('Failed to update chat');
    return response.json();
  },

  // Delete chat
  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/chats/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete chat');
  },

  // Add message to chat
  addMessage: async (chatId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>): Promise<ChatMessage> => {
    const response = await fetch(`${API_BASE_URL}/chats/${chatId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message),
    });
    if (!response.ok) throw new Error('Failed to add message');
    return response.json();
  },
};