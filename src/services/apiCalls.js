import api from './api';

export const categoryService = {
  getAll: () => api.get('/category/get'),
  add: (data) => api.post('/category/add', data),
  update: (data) => api.put('/category/update', data), // expects id and name usually
  delete: (id) => api.delete('/category/delete/' + id),
};

export const productService = {
  getAll: () => api.get('/product/get'),
  add: (data) => api.post('/product/add', data),
  update: (data) => api.put('/product/update', data),
  delete: (id) => api.delete(`/product/delete/${id}`),
  updateStatus: (data) => api.put('/product/updateStatus', null, { params: data }), // Sends as ?id=X&status=Y
  getByCategory: (id) => api.get(`/product/category/${id}`),
};

export const userService = {
  getAll: () => api.get('/user/all'),
  signup: (data) => api.post('/user/signup', data),
  updateStatus: (data) => api.put('/user/updateStatus', data),
};

export const billService = {
  getAll: () => api.get('/bill/getBills'),
  generateReport: (data) => api.post('/bill/generateReport', data),
  placePublicOrder: (data) => api.post('/bill/public/placeOrder', data),
  getPdf: (uuid) => api.get(`/bill/getPdf/${uuid}`, { responseType: 'blob' }),
  delete: (id) => api.delete(`/bill/delete/${id}`),
};

export const dashboardService = {
  getSummary: () => api.get('/dashboard/summary'),
};

export const aiService = {
  getSalesPrediction: () => api.get('/ai/sales-prediction'),
  getSmartInsights: () => api.get('/ai/smart-insights'),
  getStockPrediction: () => api.get('/ai/stock-prediction'),
  getForecast: () => api.get('/ai/forecast'),
  chat: (question) => api.get('/ai/chat', { params: { question } }),
};

export const inventoryService = {
  get: () => api.get('/inventory/get'),
  add: (data) => api.post('/inventory/add', data),
  update: (data) => api.post('/inventory/update', data),
  delete: (id) => api.delete(`/inventory/delete/${id}`),
  getIngredients: (productId) => api.get(`/inventory/ingredients/${productId}`),
  addIngredient: (data) => api.post('/inventory/addIngredient', data),
  removeIngredient: (id) => api.delete(`/inventory/removeIngredient/${id}`),
};

export const auditService = {
  getAll: () => api.get('/audit/all'),
};
