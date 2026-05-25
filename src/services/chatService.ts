import { ChatConversation, Message, User } from '../types';

const getAuthHeaders = () => {
  const token = localStorage.getItem('business_nexus_token');
  return {
    'Content-Type': 'application/json',
    Authorization: token ? `Bearer ${token}` : ''
  };
};

export const fetchChatConversations = async (): Promise<Array<ChatConversation & { partner: User }>> => {
  const response = await fetch('/api/chat/conversations', {
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    throw new Error('Failed to load conversations');
  }

  return response.json();
};

export const fetchChatMessages = async (partnerId: string): Promise<Message[]> => {
  const response = await fetch(`/api/chat/${partnerId}/messages`, {
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    throw new Error('Failed to load messages');
  }

  return response.json();
};

export const sendChatMessage = async (partnerId: string, content: string): Promise<Message> => {
  const response = await fetch(`/api/chat/${partnerId}/messages`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ content })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to send message');
  }

  return response.json();
};

export const fetchUserProfile = async (userId: string): Promise<User> => {
  const response = await fetch(`/api/users/profile/${userId}`, {
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    throw new Error('Failed to load user profile');
  }

  return response.json();
};
