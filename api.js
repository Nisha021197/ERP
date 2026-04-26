import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

export const dashboard = {
  getSummary: () => api.get('/dashboard'),
};

export const suppliers = {
  getAll: () => api.get('/suppliers'),
  getOne: (id) => api.get(`/suppliers/${id}`),
  create: (d) => api.post('/suppliers', d),
  update: (id, d) => api.put(`/suppliers/${id}`, d),
  remove: (id) => api.delete(`/suppliers/${id}`),
};

export const materials = {
  getAll: () => api.get('/materials'),
  getOne: (id) => api.get(`/materials/${id}`),
  create: (d) => api.post('/materials', d),
  update: (id, d) => api.put(`/materials/${id}`, d),
  adjustStock: (id, d) => api.post(`/materials/${id}/adjust-stock`, d),
  remove: (id) => api.delete(`/materials/${id}`),
};

export const purchaseOrders = {
  getAll: () => api.get('/purchase-orders'),
  getOne: (id) => api.get(`/purchase-orders/${id}`),
  create: (d) => api.post('/purchase-orders', d),
  updateStatus: (id, d) => api.patch(`/purchase-orders/${id}/status`, d),
  remove: (id) => api.delete(`/purchase-orders/${id}`),
};

export const products = {
  getAll: () => api.get('/products'),
  getOne: (id) => api.get(`/products/${id}`),
  create: (d) => api.post('/products', d),
  update: (id, d) => api.put(`/products/${id}`, d),
  remove: (id) => api.delete(`/products/${id}`),
};

export const productionOrders = {
  getAll: () => api.get('/production-orders'),
  getOne: (id) => api.get(`/production-orders/${id}`),
  create: (d) => api.post('/production-orders', d),
  advance: (id, d) => api.patch(`/production-orders/${id}/advance`, d),
  cancel: (id) => api.delete(`/production-orders/${id}`),
};

export const quality = {
  getAll: () => api.get('/quality-checks'),
  getStats: () => api.get('/quality-checks/stats'),
  create: (d) => api.post('/quality-checks', d),
};

export const shipments = {
  getAll: () => api.get('/shipments'),
  getOne: (id) => api.get(`/shipments/${id}`),
  create: (d) => api.post('/shipments', d),
  updateStatus: (id, d) => api.patch(`/shipments/${id}/status`, d),
};

export default api;