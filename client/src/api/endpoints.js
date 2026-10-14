import api from './axios';

// ==================== Auth ====================
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
};

// ==================== Profile ====================
export const profileAPI = {
  get: () => api.get('/api/profile'),
  update: (data) => api.put('/api/profile', data),
};

// ==================== Symptoms ====================
export const symptomAPI = {
  analyze: (description) => api.post('/api/symptoms', { description }),
  getHistory: (page = 1, limit = 10) =>
    api.get(`/api/symptoms/history?page=${page}&limit=${limit}`),
};

// ==================== Reports ====================
export const reportAPI = {
  upload: (formData) =>
    api.post('/api/reports/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000, // 60s for file upload + OCR
    }),
  uploadText: (rawText, symptomCheckId) =>
    api.post('/api/reports/upload', { rawText, symptomCheckId }),
  analyze: (reportId) => api.post(`/api/reports/${reportId}/analyze`),
  get: (reportId) => api.get(`/api/reports/${reportId}`),
  getAll: (page = 1, limit = 10) =>
    api.get(`/api/reports?page=${page}&limit=${limit}`),
};

// ==================== Appointments ====================
export const appointmentAPI = {
  getAll: (page = 1, limit = 10, status) => {
    let url = `/api/appointments?page=${page}&limit=${limit}`;
    if (status) url += `&status=${status}`;
    return api.get(url);
  },
  create: (data) => api.post('/api/appointments', data),
};
