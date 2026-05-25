import { CollaborationRequest } from '../types';

const getAuthHeaders = () => {
  const token = localStorage.getItem('business_nexus_token');
  return {
    'Content-Type': 'application/json',
    Authorization: token ? `Bearer ${token}` : ''
  };
};

export const fetchReceivedCollaborationRequests = async (): Promise<CollaborationRequest[]> => {
  const response = await fetch('/api/collaboration/requests/received', {
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    throw new Error('Failed to fetch collaboration requests');
  }

  return response.json();
};

export const fetchSentCollaborationRequests = async (): Promise<CollaborationRequest[]> => {
  const response = await fetch('/api/collaboration/requests/sent', {
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    throw new Error('Failed to fetch sent requests');
  }

  return response.json();
};

export const sendCollaborationRequest = async (
  entrepreneurId: string,
  message?: string
): Promise<CollaborationRequest> => {
  const response = await fetch('/api/collaboration/requests', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      entrepreneurId,
      message: message || "I'm interested in learning more about your startup."
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to send collaboration request');
  }

  return response.json();
};

export const updateCollaborationRequestStatus = async (
  requestId: string,
  status: 'accepted' | 'rejected'
): Promise<CollaborationRequest> => {
  const response = await fetch(`/api/collaboration/requests/${requestId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status })
  });

  if (!response.ok) {
    throw new Error('Failed to update collaboration request');
  }

  return response.json();
};
