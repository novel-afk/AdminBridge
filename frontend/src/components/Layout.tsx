import { Link, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  UserGroupIcon,
  UserPlusIcon,
  BriefcaseIcon,
  BuildingOfficeIcon,
  ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline';
import Header from './Header';
import { useAuth } from '../lib/AuthContext';
import { User } from '../lib/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Sidebar = () => {
  const location = useLocation();
  const { user } = useAuth();
  const userRole = user?.role || '';

  // Define menu items based on user role
  const getMenuItems = () => {
    const baseItems = [
      { 
        path: `/${userRole === 'SuperAdmin' ? 'admin' : userRole.toLowerCase()}/dashboard`, 
        icon: HomeIcon, 
        label: 'Dashboard'
      }
    ];
    
    // SuperAdmin and BranchManager can access branches
    if (userRole === 'SuperAdmin' || userRole === 'BranchManager') {
      const prefix = userRole === 'SuperAdmin' ? '/admin' : '/branch-manager';
      baseItems.push(
        { path: `${prefix}/branches`, icon: BuildingOfficeIcon, label: 'Branches' },
        { path: `${prefix}/students`, icon: UserGroupIcon, label: 'Students' },
        { path: `${prefix}/leads`, icon: UserPlusIcon, label: 'Leads' },
        { path: `${prefix}/employees`, icon: BriefcaseIcon, label: 'Employees' },
        { path: `${prefix}/jobs`, icon: ClipboardDocumentListIcon, label: 'Jobs' }
      );
    }
    
    // Counsellor access
    if (userRole === 'Counsellor') {
      baseItems.push(
        { path: '/counsellor/students', icon: UserGroupIcon, label: 'Students' },
        { path: '/counsellor/leads', icon: UserPlusIcon, label: 'Leads' },
        { path: '/counsellor/employees', icon: BriefcaseIcon, label: 'Employees' }
      );
    }
    
    // Receptionist access
    if (userRole === 'Receptionist') {
      baseItems.push(
        { path: '/receptionist/students', icon: UserGroupIcon, label: 'Students' },
        { path: '/receptionist/leads', icon: UserPlusIcon, label: 'Leads' },
        { path: '/receptionist/employees', icon: BriefcaseIcon, label: 'Employees' }
      );
    }
    
    // Student specific menu
    if (userRole === 'Student') {
      baseItems.push(
        { path: '/student/profile', icon: UserGroupIcon, label: 'My Profile' }
      );
    }
    
    // Add profile link for all users
    baseItems.push({ path: '/profile', icon: UserGroupIcon, label: 'Profile' });
    
    return baseItems;
  };

  const menuItems = getMenuItems();

  return (
    <div className="min-h-screen w-64 bg-gradient-to-br from-[#0A1A2F] via-[#0F2847] to-[#1A3A64] relative overflow-hidden">
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-white/5 opacity-40"></div>
      
      <div className="relative flex flex-col items-center justify-center p-6">
        <div className="group w-16 h-16 flex items-center justify-center rounded-xl p-3 relative">
          {/* Gradient border effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#2A4A7F] via-[#1A3A64] to-white/20 opacity-20 rounded-xl 
                        group-hover:opacity-30 transition-opacity duration-300"></div>
          <div className="absolute inset-[1px] bg-gradient-to-br from-[#0A1A2F] to-[#0F2847] rounded-[10px]"></div>
          {/* Use the logo from the public folder */}
          <img 
            src="/logo.png" 
            alt="Admin Bridge Logo" 
            className="relative w-full h-full object-contain brightness-0 invert 
                     group-hover:scale-105 transition-transform duration-300" 
          />
        </div>
        <div className="text-center mt-4">
          <h1 className="text-lg font-bold text-white tracking-wide 
                         bg-gradient-to-r from-white via-[#4A7FBF] to-white bg-clip-text text-transparent">
            Admin Bridge
          </h1>
          <p className="text-xs text-[#7AA1D2] mt-1">Employee Management System</p>
        </div>
      </div>
      
      <nav className="flex-1 px-4 pt-4">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center space-x-3 p-3 rounded-lg mb-2 transition-all duration-300 relative
              ${
                location.pathname === item.path || location.pathname.startsWith(item.path + '/')
                  ? 'text-white shadow-lg shadow-[#0A1A2F]/40'
                  : 'text-[#7AA1D2] hover:text-white'
              }`}
          >
            {/* Active/Hover background with gradient */}
            {(location.pathname === item.path || location.pathname.startsWith(item.path + '/')) && (
              <div className="absolute inset-0 bg-gradient-to-r from-[#1A3A64]/90 via-[#2A4A7F]/90 to-[#1A3A64]/90 
                            rounded-lg opacity-90"></div>
            )}
            <div className={`absolute inset-0 bg-gradient-to-r from-[#1A3A64]/0 via-[#2A4A7F]/0 to-[#1A3A64]/0 
                          rounded-lg opacity-0 transition-opacity duration-300 hover:opacity-50 
                          ${location.pathname !== item.path ? 'group-hover:opacity-50' : ''}`}></div>
            
            {/* Icon and label */}
            <div className="relative flex items-center space-x-3">
              <item.icon className={`h-5 w-5 transition-all duration-300 ${
                location.pathname === item.path || location.pathname.startsWith(item.path + '/') ? 'transform scale-110' : ''
              }`} />
              <span className="font-medium">{item.label}</span>
            </div>
          </Link>
        ))}
      </nav>
    </div>
  );
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="fixed left-0 top-0 h-screen z-20">
        <Sidebar />
      </div>
      <div className="flex-1 ml-64 flex flex-col h-screen">
        <Header />
        <main className="flex-1 p-8 overflow-auto">{children}</main>
      </div>
    </div>
  );
};

export default Layout; 