import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  HomeIcon,
  UserGroupIcon,
  UserPlusIcon,
  BriefcaseIcon,
  BuildingOfficeIcon,
  ClipboardDocumentListIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import Header from './Header';
import StudentHeader from './student/StudentHeader';
import { useAuth } from '../lib/AuthContext';
import { User } from '../lib/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
  showHeader?: boolean;
}

// Student-specific layout that always shows StudentHeader
export const StudentLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-white flex flex-col w-full">
      {/* <StudentHeader /> */}
      <main className="w-full flex-1 overflow-auto px-4 pb-6">{children}</main>
    </div>
  );
};

const Sidebar = () => {
  const location = useLocation();
  const { user } = useAuth();
  const userRole = user?.role || '';

  // Explicit dashboard path for each role
  let dashboardPath = '';
  if (userRole === 'SuperAdmin') dashboardPath = '/admin/dashboard';
  else if (userRole === 'BranchManager') dashboardPath = '/branch-manager/dashboard';
  else if (userRole === 'Counsellor') dashboardPath = '/counsellor/dashboard';
  else if (userRole === 'Receptionist') dashboardPath = '/receptionist/dashboard';
  else if (userRole === 'BankManager') dashboardPath = '/bank-manager/dashboard';
  else if (userRole === 'Student') dashboardPath = '/student/dashboard';

  // Define menu items based on user role
  const getMenuItems = () => {
    const baseItems = [
      { 
        path: dashboardPath, 
        icon: HomeIcon, 
        label: 'Dashboard'
      }
    ];
    
    // SuperAdmin gets access to branches
    if (userRole === 'SuperAdmin') {
      baseItems.push(
        { path: '/admin/branches', icon: BuildingOfficeIcon, label: 'Branches' },
        { path: '/admin/students', icon: UserGroupIcon, label: 'Students' },
        { path: '/admin/leads', icon: UserPlusIcon, label: 'Leads' },
        { path: '/admin/employees', icon: BriefcaseIcon, label: 'Employees' },
        { path: '/admin/jobs', icon: ClipboardDocumentListIcon, label: 'Jobs' },
        { path: '/admin/job-responses', icon: ClipboardDocumentListIcon, label: 'Job Responses' },
        { path: '/admin/blogs', icon: DocumentTextIcon, label: 'Blogs' },
        { path: '/admin/attendance', icon: ClipboardDocumentListIcon, label: 'Attendance' }
      );
    }
    
    // BranchManager access without branches
    if (userRole === 'BranchManager') {
      baseItems.push(
        { path: '/branch-manager/students', icon: UserGroupIcon, label: 'Students' },
        { path: '/branch-manager/leads', icon: UserPlusIcon, label: 'Leads' },
        { path: '/branch-manager/employees', icon: BriefcaseIcon, label: 'Employees' },
        { path: '/branch-manager/jobs', icon: ClipboardDocumentListIcon, label: 'Jobs' },
        { path: '/branch-manager/job-responses', icon: ClipboardDocumentListIcon, label: 'Job Responses' },
        { path: '/branch-manager/blogs', icon: DocumentTextIcon, label: 'Blogs' }
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

  // Only render sidebar if user is loaded
  if (!user) return null;

  return (
    <div className="min-h-screen w-64 bg-[#153147] relative overflow-hidden">
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 bg-[#153147] from-black/20 to-white/5 opacity-40"></div>
      
      <div className="relative flex flex-col items-center justify-center p-6">
        <div className="group w-16 h-16 flex items-center justify-center rounded-xl p-3 relative">
          {/* Gradient border effect */}
          <div className="absolute inset-0 bg-[#153147] from-[#2A4A7F] via-[#1A3A64] to-white/20 opacity-20 rounded-xl 
                        group-hover:opacity-30 transition-opacity duration-300"></div>
          <div className="absolute inset-[1px] bg-[#153147] from-[#0A1A2F] to-[#0F2847] rounded-[10px]"></div>
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

const PublicHeader = () => {
  const navigate = useNavigate();
  
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
      <div className="container mx-auto flex justify-between items-center px-6 py-3 h-16">
        <div className="flex items-center">
          <Link to="/" className="flex items-center space-x-2">
            <div className="group w-10 h-10 flex items-center justify-center rounded-lg p-2 relative bg-gradient-to-br from-[#0A1A2F] via-[#0F2847] to-[#1A3A64]">
              <img 
                src="/logo.png" 
                alt="Admin Bridge Logo" 
                className="w-full h-full object-contain brightness-0 invert" 
              />
            </div>
            <span className="font-bold text-gray-900">Admin Bridge</span>
          </Link>
        </div>
        
        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/" className="text-gray-700 hover:text-gray-900 text-sm font-medium">Home</Link>
          <Link to="/blog" className="text-gray-700 hover:text-gray-900 text-sm font-medium">Blog</Link>
          <button 
            onClick={() => navigate('/login')}
            className="bg-[#1A3A64] hover:bg-[#2A4A7F] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Login
          </button>
        </nav>
      </div>
    </header>
  );
};

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  showSidebar = true, 
  showHeader = true
}) => {
  const { user } = useAuth();
  const userRole = user?.role || '';
  const isStudent = userRole === 'Student';
  
  // Hide sidebar for Student role
  const shouldShowSidebar = showSidebar && !isStudent;
  
  // Simple layout with just the content (no headers)
  if (!shouldShowSidebar && !showHeader) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <main className="w-full flex-1">{children}</main>
      </div>
    );
  }

  // Public layout with just the header
  if (!shouldShowSidebar && showHeader && !isStudent) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <PublicHeader />
        <main className="flex-1">{children}</main>
      </div>
    );
  }
  
  // Student layout with student header
  if (isStudent && showHeader) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <StudentHeader />
        <main className="w-full flex-1 overflow-auto pt-16 px-4 pb-6">{children}</main>
      </div>
    );
  }

  // Full layout with sidebar and header for non-student roles
  return (
    <div className="flex min-h-screen bg-gray-50">
      {shouldShowSidebar && (
        <div className="fixed left-0 top-0 h-screen z-20 ">
          <Sidebar />
        </div>
      )}
      <div className={`flex-1 ${shouldShowSidebar ? 'ml-64' : ''} flex flex-col h-screen`}>
        {showHeader && !isStudent && <Header />}
        <main className={`flex-1 ${showHeader && !isStudent ? 'pt-16 px-4 pb-6' : ''} overflow-auto`}>{children}</main>
      </div>
    </div>
  );
};

export default Layout; 