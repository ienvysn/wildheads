import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api/',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh (basic)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
           const res = await axios.post('http://localhost:8000/api/users/token/refresh/', { refresh: refreshToken });
           if (res.status === 200) {
               localStorage.setItem('access_token', res.data.access);
               api.defaults.headers.Authorization = `Bearer ${res.data.access}`;
               return api(originalRequest);
           }
        }
      } catch (err) {
        // Redirect to login or clear tokens
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
    login: (credentials: any) => api.post('users/login/', credentials),
    register: (data: any) => api.post('users/register/', data),
    getProfile: () => api.get('users/profile/'),
};

export const usersApi = {
  getPatients: () => api.get('users/patients/'),
  getPatient: (id: number) => api.get(`users/patients/${id}/`),
  getDoctors: () => api.get('users/doctors/'),
  getSummary: () => api.get('users/summary/'),
};

export const medicalApi = {
    getVitals: () => api.get('medical/vitals/'), // Need to implement list view for this if not exists
    createVitals: (data: any) => api.post('medical/vitals/', data),
    getAppointments: () => api.get('medical/appointments/'),
    createAppointment: (data: any) => api.post('medical/appointments/', data),
};

export const pharmacyApi = {
    getMedicines: () => api.get('pharmacy/medicines/'),
    getPrescriptions: () => api.get('pharmacy/prescriptions/'),
};

export const labApi = {
    getLabTests: () => api.get('lab/tests/'),
    getResults: () => api.get('lab/results/'),
  createResult: (formData: FormData) => api.post('lab/results/create/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};

export const billingApi = {
    getInvoices: () => api.get('billing/invoices/'),
};

export const aiApi = {
    chat: (message: string, history: any[]) => api.post('ai/chat/', { message, history }),
    analyze: (patientId: number, data: any) => api.post(`ai/analyze/${patientId}/`, data),
};

export default api;
