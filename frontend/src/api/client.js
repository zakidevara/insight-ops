import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

export const fetchReports = (service) => {
  const params = service ? { service } : {};
  return api.get('/reports', { params }).then(res => res.data);
};

export const fetchReport = (id) =>
  api.get(`/reports/${id}`).then(res => res.data);

export const submitAlert = (alert) =>
  api.post('/webhook', alert).then(res => res.data);

export const ingestFile = (file, type = 'markdown') => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post(`/ingest/${type}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(res => res.data);
};

export const fetchPostMortems = () =>
  api.get('/postmortems').then(res => res.data);

export const fetchPostMortem = (id) =>
  api.get(`/postmortems/${id}`).then(res => res.data);

export const fetchPostMortemsForIncident = (incidentId) =>
  api.get(`/incidents/${incidentId}/postmortems`).then(res => res.data);

export default api;
