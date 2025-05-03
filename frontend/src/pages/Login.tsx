import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { XMarkIcon, EyeIcon, EyeSlashIcon, EnvelopeIcon, LockClosedIcon, AcademicCapIcon } from '@heroicons/react/24/outline';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();

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
        // Using the correct endpoint from your Django API
        const response = await axios.post('http://localhost:8000/api/token/', {
          email: formData.email,
          password: formData.password
        });

        // Store the tokens
        localStorage.setItem('access_token', response.data.access);
        localStorage.setItem('refresh_token', response.data.refresh);
        
        // Store minimal user info we have
        localStorage.setItem('user_email', formData.email);
        
        // Try to get user details from the me endpoint
        try {
          const userResponse = await axios.get('http://localhost:8000/api/users/me/', {
            headers: {
              'Authorization': `Bearer ${response.data.access}`
            }
          });
          
          // Store the user details
          localStorage.setItem('user', JSON.stringify(userResponse.data));
          
          // Route based on user role
          const userRole = userResponse.data.role;
          
          switch(userRole) {
            case 'SuperAdmin':
              navigate('/admin/dashboard');
              break;
            case 'BranchManager':
              navigate('/branch-manager/dashboard');
              break;
            case 'Counsellor':
              navigate('/counsellor/dashboard');
              break;
            case 'Receptionist':
              navigate('/receptionist/dashboard');
              break;
            case 'BankManager':
              navigate('/bank-manager/dashboard');
              break;
            case 'Student':
              navigate('/student/dashboard');
              break;
            default:
              navigate('/admin/dashboard');
          }
        } catch (userError) {
          console.error('Error fetching user details:', userError);
          // Default to admin dashboard if we can't determine role
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