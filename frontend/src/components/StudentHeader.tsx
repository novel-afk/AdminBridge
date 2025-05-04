import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { Home, Briefcase, BookOpen, User, LogOut, Menu, X, FileText } from 'lucide-react';
import { Button } from './ui/button';

const StudentHeader: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const menuItems = [
    { path: '/student/dashboard', icon: <Home className="h-5 w-5" />, label: 'Home' },
    { path: '/student/jobs', icon: <Briefcase className="h-5 w-5" />, label: 'Jobs' },
    { path: '/student/applications', icon: <FileText className="h-5 w-5" />, label: 'My Applications' },
    { path: '/student/blogs', icon: <BookOpen className="h-5 w-5" />, label: 'Blogs' },
    { path: '/student/profile', icon: <User className="h-5 w-5" />, label: 'Profile' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10" id="student-header">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-14">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link to="/student/dashboard" className="flex items-center space-x-2">
              <div className="group w-8 h-8 flex items-center justify-center rounded-lg p-1.5 relative bg-gradient-to-br from-[#0A1A2F] via-[#0F2847] to-[#1A3A64]">
                <img 
                  src="/logo.png" 
                  alt="Admin Bridge Logo" 
                  className="w-full h-full object-contain brightness-0 invert"
                />
              </div>
              <div className="leading-tight">
                <span className="block font-bold text-gray-900 text-sm">Admin Bridge</span>
                <span className="block text-xs text-gray-500">Student Portal</span>
              </div>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === item.path || location.pathname.startsWith(item.path + '/')
                    ? 'bg-[#153147] text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="h-8 w-8 p-0"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
          
          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-full bg-[#153147] flex items-center justify-center text-white text-xs font-semibold">
                {user?.first_name?.charAt(0) || 'S'}
              </div>
              <span className="text-xs font-medium">{user?.email}</span>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-red-600 border-red-200 hover:bg-red-50 py-0.5 h-6 text-xs"
              onClick={handleLogout}
            >
              <LogOut className="h-3 w-3 mr-1" />
              Logout
            </Button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-2 space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === item.path || location.pathname.startsWith(item.path + '/')
                    ? 'bg-[#153147] text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
            <div className="border-t border-gray-200 mt-2 pt-2">
              <div className="flex items-center justify-between px-4 py-2">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-[#153147] flex items-center justify-center text-white text-xs font-semibold">
                    {user?.first_name?.charAt(0) || 'S'}
                  </div>
                  <span className="text-sm font-medium truncate">{user?.email}</span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-red-600 border-red-200 hover:bg-red-50 py-0.5 h-6 text-xs"
                  onClick={handleLogout}
                >
                  <LogOut className="h-3 w-3 mr-1" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default StudentHeader; 