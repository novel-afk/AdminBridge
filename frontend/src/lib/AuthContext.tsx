import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { authAPI } from './api';
import toast from 'react-hot-toast';

// Define user type
export type User = {
  id?: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  branch?: number;
};

// Define auth context type
type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  isUsingDefaultPassword: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<boolean>;
};

// Create auth context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  loading: true,
  isUsingDefaultPassword: false,
  login: async () => {},
  logout: () => {},
  checkAuth: async () => false,
});

// Hook to use auth context
export const useAuth = () => useContext(AuthContext);

// Auth provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [isUsingDefaultPassword, setIsUsingDefaultPassword] = useState<boolean>(false);

  // Check for default password in response headers
  const checkForDefaultPassword = (headers: any) => {
    if (headers['x-default-password'] === 'true') {
      setIsUsingDefaultPassword(true);
    }
    
    // Also check if password is Nepal@123 which is our default
    const storedPassword = localStorage.getItem('temp_password');
    if (storedPassword === 'Nepal@123') {
      setIsUsingDefaultPassword(true);
      // Clear the temporary stored password
      localStorage.removeItem('temp_password');
    }
  };

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, []);

  // Function to check if user is authenticated
  const checkAuth = async (): Promise<boolean> => {
    setLoading(true);
    
    const token = localStorage.getItem('access_token');
    if (!token) {
      setIsAuthenticated(false);
      setUser(null);
      setLoading(false);
      return false;
    }
    
    try {
      // Fetch user details using the API utility
      const response = await authAPI.getCurrentUser();
      
      // Check for default password header
      checkForDefaultPassword(response.headers);
      
      setUser(response.data);
      setIsAuthenticated(true);
      setLoading(false);
      return true;
    } catch (error) {
      console.error('Error verifying authentication:', error);
      setIsAuthenticated(false);
      setUser(null);
      setLoading(false);
      return false;
    }
  };

  // Login function
  const login = async (email: string, password: string): Promise<void> => {
    setLoading(true);
    
    try {
      // Temporarily store password to check if default
      if (password === 'Nepal@123') {
        localStorage.setItem('temp_password', password);
      }
      
      // Get tokens using the API utility
      const response = await authAPI.login(email, password);
      
      // Store tokens
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      
      // Get user details
      const userResponse = await authAPI.getCurrentUser();
      
      // Check if using default password
      checkForDefaultPassword(userResponse.headers);
      
      // Store user details
      setUser(userResponse.data);
      localStorage.setItem('user', JSON.stringify(userResponse.data));
      setIsAuthenticated(true);
      toast.success('Logged in successfully!');
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    localStorage.removeItem('user_email');
    setUser(null);
    setIsAuthenticated(false);
    setIsUsingDefaultPassword(false);
    toast.success('Logged out successfully!');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      loading, 
      isUsingDefaultPassword,
      login, 
      logout, 
      checkAuth 
    }}>
      {children}
    </AuthContext.Provider>
  );
}; 