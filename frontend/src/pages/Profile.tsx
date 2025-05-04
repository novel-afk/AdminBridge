import { useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { authAPI } from '../lib/api';

const Profile = () => {
  const { user, isUsingDefaultPassword } = useAuth();
  const [changePassword, setChangePassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value
    });
    // Clear error when typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validatePasswordForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!passwordData.current_password) {
      newErrors.current_password = 'Current password is required';
    }
    
    if (!passwordData.new_password) {
      newErrors.new_password = 'New password is required';
    } else if (passwordData.new_password.length < 8) {
      newErrors.new_password = 'Password must be at least 8 characters long';
    }
    
    if (passwordData.new_password !== passwordData.confirm_password) {
      newErrors.confirm_password = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitPasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validatePasswordForm()) {
      setLoading(true);
      setSuccess('');
      
      try {
        // Use the API utility to change password
        await authAPI.changePassword(
          passwordData.current_password,
          passwordData.new_password
        );
        
        setSuccess('Password has been updated successfully');
        setPasswordData({
          current_password: '',
          new_password: '',
          confirm_password: ''
        });
        setChangePassword(false);
      } catch (error: any) {
        setErrors({
          ...errors,
          general: error.response?.data?.detail || 'Failed to change password'
        });
      } finally {
        setLoading(false);
      }
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">My Profile</h1>
      
      {isUsingDefaultPassword && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="font-medium">Security Alert!</span>
          </div>
          <p className="mt-1 ml-7">
            You are using the default password (Nepal@123). Please change your password immediately for security reasons.
          </p>
          {!changePassword && (
            <button
              type="button"
              onClick={() => setChangePassword(true)}
              className="mt-2 ml-7 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-md hover:bg-yellow-200 transition-colors"
            >
              Change Password Now
            </button>
          )}
        </div>
      )}
      
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md text-green-700">
          {success}
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="p-6">
          <div className="flex items-start">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold">
              {user?.first_name?.[0]}{user?.last_name?.[0]}
            </div>
            
            <div className="ml-6">
              <h2 className="text-2xl font-bold text-gray-900">{user?.first_name || ''} {user?.last_name || ''}</h2>
              <p className="text-gray-600">{user?.email || 'No email available'}</p>
              <div className="mt-2 inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {user?.role || 'User'}
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-200 px-6 py-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Account Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">First Name</p>
              <p className="text-gray-800">{user?.first_name || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Last Name</p>
              <p className="text-gray-800">{user?.last_name || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="text-gray-800">{user?.email || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Role</p>
              <p className="text-gray-800">{user?.role || 'Not specified'}</p>
            </div>
          </div>
          
          <div className="mt-6">
            <button
              type="button"
              onClick={() => setChangePassword(!changePassword)}
              className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition-colors"
            >
              {changePassword ? 'Cancel' : 'Change Password'}
            </button>
          </div>
        </div>
        
        {changePassword && (
          <div className="border-t border-gray-200 px-6 py-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Change Password</h3>
            
            {errors.general && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700">
                {errors.general}
              </div>
            )}
            
            <form onSubmit={handleSubmitPasswordChange} className="space-y-4">
              <div>
                <label htmlFor="current_password" className="block text-sm font-medium text-gray-700 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  id="current_password"
                  name="current_password"
                  value={passwordData.current_password}
                  onChange={handlePasswordChange}
                  className={`w-full px-4 py-2 border ${
                    errors.current_password ? 'border-red-300' : 'border-gray-300'
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                {errors.current_password && (
                  <p className="mt-1 text-sm text-red-600">{errors.current_password}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="new_password" className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  id="new_password"
                  name="new_password"
                  value={passwordData.new_password}
                  onChange={handlePasswordChange}
                  className={`w-full px-4 py-2 border ${
                    errors.new_password ? 'border-red-300' : 'border-gray-300'
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                {errors.new_password && (
                  <p className="mt-1 text-sm text-red-600">{errors.new_password}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirm_password"
                  name="confirm_password"
                  value={passwordData.confirm_password}
                  onChange={handlePasswordChange}
                  className={`w-full px-4 py-2 border ${
                    errors.confirm_password ? 'border-red-300' : 'border-gray-300'
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                {errors.confirm_password && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirm_password}</p>
                )}
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile; 