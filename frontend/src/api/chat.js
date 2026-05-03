import api from './client';

export const sendChatMessage = (message, history = []) =>
  api.post('/chat', { message, history }).then(r => r.data.content);
