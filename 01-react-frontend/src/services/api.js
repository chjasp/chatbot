// api.js

const BASE_URL = 'http://127.0.0.1:5000';

async function fetchWithAuth(url, options = {}) {
    const token = localStorage.getItem('token');
    const headers = {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
    };

    const response = await fetch(url, { ...options, headers });
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return response.json();
}

export async function fetchChatResponse(endpoint, messages) {
    try {
        const response = await fetchWithAuth(`${BASE_URL}${endpoint}`, {
            method: 'POST',
            body: JSON.stringify({ messages }),
        });
        return response.response;
    } catch (error) {
        console.error('Error fetching chat response:', error);
        throw error;
    }
}

export async function saveChat(chatData) {
    try {
        const response = await fetchWithAuth(`${BASE_URL}/save-chat`, {
            method: 'POST',
            body: JSON.stringify(chatData),
        });
        return response;
    } catch (error) {
        console.error('Error saving chat:', error);
        throw error;
    }
}

export async function getChat() {
    try {
        const response = await fetchWithAuth(`${BASE_URL}/get-chat`);
        return response;
    } catch (error) {
        console.error('Error getting chat:', error);
        throw error;
    }
}

export async function deleteChatAPI(chatId) {
    try {
      const response = await fetch(`${BASE_URL}/delete-chat/${chatId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return await response.json();
    } catch (error) {
      console.error('Error deleting chat:', error);
      throw error;
    }
  }