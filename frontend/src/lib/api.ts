import axios from 'axios';

// Base API URL - should be environment-based in production
const API_URL = 'http://localhost:8000/api';

// Create an axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to attach the auth token
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('access_token');
    
    // If token exists, add Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 and we haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Get refresh token
        const refreshToken = localStorage.getItem('refresh_token');
        
        if (!refreshToken) {
          // No refresh token, user needs to login again
          return Promise.reject(error);
        }
        
        // Try to get new access token
        const response = await axios.post(`${API_URL}/token/refresh/`, {
          refresh: refreshToken
        });
        
        // Store new access token
        localStorage.setItem('access_token', response.data.access);
        
        // Update Authorization header and retry the original request
        originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, logout
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        
        return Promise.reject(refreshError);
      }
    }
    
    // Return original error for all other cases
    return Promise.reject(error);
  }
);

// Authentication API
export const authAPI = {
  login: (email: string, password: string) => 
    api.post('/token/', { email, password }),
  
  refreshToken: (refreshToken: string) => 
    api.post('/token/refresh/', { refresh: refreshToken }),
  
  getCurrentUser: () => 
    api.get('/users/me/'),
  
  changePassword: (current_password: string, new_password: string) => 
    api.post('/users/change-password/', { current_password, new_password }),
};

// User API
export const userAPI = {
  getAll: () => 
    api.get('/users/'),
  
  getById: (id: number) => 
    api.get(`/users/${id}/`),
  
  create: (userData: any) => 
    api.post('/users/', userData),
  
  update: (id: number, userData: any) => 
    api.put(`/users/${id}/`, userData),
  
  delete: (id: number) => 
    api.delete(`/users/${id}/`),
};

// Employee API
export const employeeAPI = {
  getAll: () => 
    api.get('/employees/'),
  
  getById: (id: number) => 
    api.get(`/employees/${id}/`),
  
  create: (employeeData: any) => 
    api.post('/employees/', employeeData),
  
  update: (id: number, employeeData: any) => 
    api.put(`/employees/${id}/`, employeeData),
  
  delete: (id: number) => 
    api.delete(`/employees/${id}/`),
};

// Student API
export const studentAPI = {
  getAll: () => 
    api.get('/students/'),
  
  getById: (id: number) => 
    api.get(`/students/${id}/`),
  
  create: (studentData: any) => 
    api.post('/students/', studentData),
  
  update: (id: number, studentData: any) => 
    api.put(`/students/${id}/`, studentData),
  
  delete: (id: number) => 
    api.delete(`/students/${id}/`),
};

// Lead API
export const leadAPI = {
  getAll: () => 
    api.get('/leads/'),
  
  getById: (id: number) => 
    api.get(`/leads/${id}/`),
  
  create: (leadData: any) => 
    api.post('/leads/', leadData),
  
  update: (id: number, leadData: any) => 
    api.put(`/leads/${id}/`, leadData),
  
  delete: (id: number) => 
    api.delete(`/leads/${id}/`),
};

// Job API
export const jobAPI = {
  getAll: () => 
    api.get('/jobs/'),
    
  getActive: () => 
    api.get('/jobs/?is_active=true&ordering=-created_at'),
  
  getById: (id: number) => 
    api.get(`/jobs/${id}/`),
  
  create: (jobData: any) => 
    api.post('/jobs/', jobData),
  
  update: (id: number, jobData: any) => 
    api.put(`/jobs/${id}/`, jobData),
  
  delete: (id: number) => 
    api.delete(`/jobs/${id}/`),
  
  getResponses: (jobId: number) => 
    api.get(`/job-responses/?job=${jobId}`),
};

// Branch API
export const branchAPI = {
  getAll: () => 
    api.get('/branches/'),
  
  getById: (id: number) => 
    api.get(`/branches/${id}/`),
  
  create: (branchData: any) => 
    api.post('/branches/', branchData),
  
  update: (id: number, branchData: any) => 
    api.put(`/branches/${id}/`, branchData),
  
  delete: (id: number) => 
    api.delete(`/branches/${id}/`),
};

// Blog API
export const blogAPI = {
  getAll: () => 
    api.get('/blogs/'),
    
  getPublished: () => 
    api.get('/blogs/?status=published&ordering=-published_date'),
  
  getById: (id: number) => 
    api.get(`/blogs/${id}/`),
  
  create: (blogData: any) => 
    api.post('/blogs/', blogData),
  
  update: (id: number, blogData: any) => 
    api.put(`/blogs/${id}/`, blogData),
  
  delete: (id: number) => 
    api.delete(`/blogs/${id}/`),
    
  // Additional endpoint to get blogs by branch
  getByBranch: (branchId: number) => 
    api.get(`/blogs/?branch=${branchId}`),
}; 