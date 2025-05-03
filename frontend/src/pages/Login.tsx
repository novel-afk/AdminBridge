import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon, EnvelopeIcon, LockClosedIcon, AcademicCapIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../lib/AuthContext';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // Get the intended destination from location state, or use default paths by role
  const from = location.state?.from?.pathname || '/';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setLoading(true);
      try {
        // Use the login function from AuthContext
        await login(formData.email, formData.password);
        
        // Get user details from localStorage to determine role
        const userString = localStorage.getItem('user');
        if (userString) {
          const user = JSON.parse(userString);
          const userRole = user.role;
          
          // Determine redirect path based on role
          let redirectPath;
          switch(userRole) {
            case 'SuperAdmin':
              redirectPath = '/admin/dashboard';
              break;
            case 'BranchManager':
              redirectPath = '/branch-manager/dashboard';
              break;
            case 'Counsellor':
              redirectPath = '/counsellor/dashboard';
              break;
            case 'Receptionist':
              redirectPath = '/receptionist/dashboard';
              break;
            case 'BankManager':
              redirectPath = '/bank-manager/dashboard';
              break;
            case 'Student':
              redirectPath = '/student/dashboard';
              break;
            default:
              // If from is not login page, navigate there, otherwise default to admin
              redirectPath = from !== '/login' ? from : '/admin/dashboard';
          }
          
          // Navigate to appropriate dashboard
          navigate(redirectPath);
        } else {
          // Fallback if no user info
          navigate('/admin/dashboard');
        }
      } catch (err: any) {
        console.error('Login failed:', err);
        setErrors({
          ...errors,
          general: err.response?.data?.detail || 'Invalid credentials'
        });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1a237e] relative overflow-hidden">
      {/* Background circles */}
      <div className="absolute top-0 left-0 w-[40vw] h-[40vw] rounded-full bg-[#283593] opacity-40 -translate-x-1/3 -translate-y-1/3"></div>
      <div className="absolute bottom-0 right-0 w-[40vw] h-[40vw] rounded-full bg-[#283593] opacity-40 translate-x-1/3 translate-y-1/3"></div>
      
      <div className="w-full max-w-md bg-white rounded-lg shadow-2xl p-8 mx-4 z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-full bg-[#1a237e] flex items-center justify-center mb-4">
            <AcademicCapIcon className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-[#1a237e] mb-2">Welcome Back</h1>
          <p className="text-gray-600 text-center">
            Please sign in to continue to Admin Bridge
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Default login: Email from database, Password: Nepal@123
          </p>
        </div>

        {errors.general && (
          <div className="mb-4 p-3 bg-red-50 border border-red-300 text-red-700 rounded-lg">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="relative">
              <EnvelopeIcon className="h-5 w-5 text-[#1a237e] absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                className={`w-full pl-10 pr-4 py-3 border ${
                  errors.email ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-[#1a237e]'
                } rounded-lg focus:outline-none focus:ring-2 transition-colors bg-gray-100`}
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          <div>
            <div className="relative">
              <LockClosedIcon className="h-5 w-5 text-[#1a237e] absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                className={`w-full pl-10 pr-12 py-3 border ${
                  errors.password ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-[#1a237e]'
                } rounded-lg focus:outline-none focus:ring-2 transition-colors bg-gray-100`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-500">{errors.password}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-[#3f51b5] hover:bg-[#283593] text-white rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#1a237e] focus:ring-offset-2 relative disabled:opacity-80 h-[50px]"
          >
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
        
        <div className="text-center mt-6">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} Admin Bridge. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login; 