import axios from 'axios';

// Base API URL - should be environment-based in production
export const API_URL = 'http://localhost:8000/api';

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
    
    // For debugging purposes
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`, { 
      headers: config.headers,
      hasAuthHeader: !!config.headers.Authorization
    });
    
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
  getAll: () => {
    console.log('Fetching all leads');
    return api.get('/leads/');
  },
  
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
  getAll: () => {
    const token = localStorage.getItem('access_token');
    return api.get('/jobs/', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  },
    
  getActive: () => {
    const token = localStorage.getItem('access_token');
    return api.get('/jobs/?is_active=true&ordering=-created_at', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  },
  
  getById: (id: number) => {
    const token = localStorage.getItem('access_token');
    return api.get(`/jobs/${id}/`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  },
  
  create: (jobData: any) => {
    const token = localStorage.getItem('access_token');
    return api.post('/jobs/', jobData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  },
  
  update: (id: number, jobData: any) => {
    const token = localStorage.getItem('access_token');
    return api.put(`/jobs/${id}/`, jobData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  },
  
  delete: (id: number) => {
    const token = localStorage.getItem('access_token');
    return api.delete(`/jobs/${id}/`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  },
  
  getResponses: (jobId: number) => {
    const token = localStorage.getItem('access_token');
    return api.get(`/job-responses/?job=${jobId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  },
    
  getAllResponses: () => {
    const token = localStorage.getItem('access_token');
    return api.get('/job-responses/', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  },
    
  getResponseById: (id: number) => {
    const token = localStorage.getItem('access_token');
    return api.get(`/job-responses/${id}/`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  },
    
  updateResponseStatus: (id: number, statusData: {status: string}) => {
    const token = localStorage.getItem('access_token');
    return api.patch(`/job-responses/${id}/`, statusData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  },
    
  deleteResponse: (id: number) => {
    const token = localStorage.getItem('access_token');
    return api.delete(`/job-responses/${id}/`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }
};

// Branch API
export const branchAPI = {
  getAll: () => 
    api.get('/branches/'),
  
  getById: (id: number) => 
    api.get(`/branches/${id}/`),
  
  create: (branchData: any) => {
    // Extract only necessary fields for branch creation
    const { name, country, city, address } = branchData;
    return api.post('/branches/', { name, country, city, address });
  },
  
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
  
  create: (blogData: FormData) => {
    const token = localStorage.getItem('access_token');
    return api.post('/blogs/', blogData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      }
    });
  },
  
  update: (id: number, blogData: FormData) => {
    const token = localStorage.getItem('access_token');
    return api.put(`/blogs/${id}/`, blogData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      }
    });
  },
  
  delete: (id: number) => {
    // Get token from localStorage to ensure it's included
    const token = localStorage.getItem('access_token');
    return api.delete(`/blogs/${id}/`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  },
    
  // Additional endpoint to get blogs by branch
  getByBranch: (branchId: number) => 
    api.get(`/blogs/?branch=${branchId}`),
};

export interface ActivityLog {
  id: number;
  user: number;
  user_name: string;
  user_role: string;
  action_type: string;
  action_model: string;
  action_details: string;
  ip_address: string;
  created_at: string;
}

// Activity Log API
export const activityLogAPI = {
  getAll: (params?: { 
    role?: string;
    action_type?: string;
    start_date?: string;
    end_date?: string;
    page?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.role) queryParams.append('role', params.role);
    if (params?.action_type) queryParams.append('action_type', params.action_type);
    if (params?.start_date) queryParams.append('start_date', params.start_date);
    if (params?.end_date) queryParams.append('end_date', params.end_date);
    if (params?.page) queryParams.append('page', params.page.toString());
    
    return api.get(`/activity-logs/?${queryParams.toString()}`);
  }
};

// Student Profile API
export const studentProfileAPI = {
  getProfile: () => api.get('/student-profile/'),
  
  updateProfile: (profileData: FormData) => 
    api.patch('/student-profile/', profileData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
}; 