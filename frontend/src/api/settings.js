import api from './client';

export const getLlmSettings = () =>
  api.get('/settings/llm').then(r => r.data);

export const setLlmProvider = (provider) =>
  api.post('/settings/llm', { provider }).then(r => r.data);
