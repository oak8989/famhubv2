import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

export const pantryAPI = {
  getItems: (familyId) => api.get(`/pantry?familyId=${familyId}`),
  addItem: (data) => api.post('/pantry', data),
  updateItem: (id, data) => api.put(`/pantry/${id}`, data),
  deleteItem: (id) => api.delete(`/pantry/${id}`),
  searchByBarcode: (barcode, familyId) => api.get(`/pantry/barcode/${barcode}?familyId=${familyId}`),
  getExpiring: (familyId, days) => api.get(`/pantry/expiring?familyId=${familyId}&days=${days}`),
};

export const calendarAPI = {
  getEvents: (familyId) => api.get(`/calendar?familyId=${familyId}`),
  createEvent: (data) => api.post('/calendar', data),
  updateEvent: (id, data) => api.put(`/calendar/${id}`, data),
  deleteEvent: (id) => api.delete(`/calendar/${id}`),
};

export const tasksAPI = {
  getTasks: (familyId, status) => {
    let url = `/tasks?familyId=${familyId}`;
    if (status) url += `&status=${status}`;
    return api.get(url);
  },
  createTask: (data) => api.post('/tasks', data),
  updateTask: (id, data) => api.put(`/tasks/${id}`, data),
  deleteTask: (id) => api.delete(`/tasks/${id}`),
};

export const shoppingAPI = {
  getLists: (familyId) => api.get(`/shopping/lists?familyId=${familyId}`),
  createList: (data) => api.post('/shopping/lists', data),
  addItem: (listId, data) => api.post(`/shopping/lists/${listId}/items`, data),
  updateItem: (id, data) => api.put(`/shopping/items/${id}`, data),
  deleteItem: (id) => api.delete(`/shopping/items/${id}`),
  deleteList: (id) => api.delete(`/shopping/lists/${id}`),
};

export const mealsAPI = {
  getMealPlans: (familyId, startDate, endDate) => {
    let url = `/meals/plans?familyId=${familyId}`;
    if (startDate && endDate) url += `&startDate=${startDate}&endDate=${endDate}`;
    return api.get(url);
  },
  createMealPlan: (data) => api.post('/meals/plans', data),
  updateMealPlan: (id, data) => api.put(`/meals/plans/${id}`, data),
  deleteMealPlan: (id) => api.delete(`/meals/plans/${id}`),
  getRecipes: (familyId) => api.get(`/meals/recipes?familyId=${familyId}`),
  createRecipe: (data) => api.post('/meals/recipes', data),
  updateRecipe: (id, data) => api.put(`/meals/recipes/${id}`, data),
  deleteRecipe: (id) => api.delete(`/meals/recipes/${id}`),
};

export default api;
