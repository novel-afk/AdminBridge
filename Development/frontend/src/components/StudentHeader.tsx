import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { LogOut } from 'lucide-react';

const StudentHeader: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Get user display name
  const userName = user?.first_name && user?.last_name 
    ? `${user.first_name} ${user.last_name}` 
    : (user?.email?.split('@')[0] || 'User');
  
  // Get user email
  const userEmail = user?.email || '';
  
  // Get profile image URL or use placeholder
  const profileImageUrl = user?.profile_image || '/placeholder-avatar.jpg';

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="bg-white rounded-lg shadow-md border border-gray-200 mb-2">
        <div className="flex justify-between items-center px-4 py-2">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-[#153147] flex items-center justify-center text-white font-medium overflow-hidden">
                {profileImageUrl ? (
                <img 
                    src={profileImageUrl}
                    alt="User avatar"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement.innerHTML = userName?.[0]?.toUpperCase() || 'U';
                    }}
                  />
                ) : (
                  userName?.[0]?.toUpperCase() || 'U'
                )}
              </div>
              <div className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
            <div>
              <p className="font-medium text-sm text-[#153147]">{userName}</p>
              <p className="text-xs text-gray-500">{userEmail}</p>
            </div>
          </div>
          <button 
                  onClick={handleLogout}
            className="px-3 py-1.5 text-xs font-medium text-white bg-[#153147] hover:bg-[#0c1f2e] rounded-lg transition-colors duration-200 flex items-center gap-1.5"
                >
                  Logout
            <LogOut className="h-3.5 w-3.5" />
          </button>
          </div>
      </div>
    </header>
  );
};

export default StudentHeader; 