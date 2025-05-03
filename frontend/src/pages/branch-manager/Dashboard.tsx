import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DefaultPasswordAlert from '../../components/DefaultPasswordAlert';

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
}

const BranchManagerDashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in with access token
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      navigate('/login');
      return;
    }

    // Get user info from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        
        // Make sure this dashboard is only accessible to branch managers
        if (parsedUser.role !== 'BranchManager') {
          navigate('/login');
          return;
        }
        
        setUser(parsedUser);
        setLoading(false);
      } catch (e) {
        console.error('Error parsing user from localStorage:', e);
        navigate('/login');
      }
    } else {
      // Try to fetch user info if not in localStorage
      const fetchUserInfo = async () => {
        try {
          const response = await axios.get('http://localhost:8000/api/users/me/', {
            headers: { Authorization: `Bearer ${accessToken}` }
          });
          
          if (response.data.role !== 'BranchManager') {
            navigate('/login');
            return;
          }
          
          setUser(response.data);
          localStorage.setItem('user', JSON.stringify(response.data));
          setLoading(false);
        } catch (err) {
          console.error('Error fetching user details:', err);
          navigate('/login');
        }
      };
      fetchUserInfo();
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    localStorage.removeItem('user_email');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="flex flex-col h-screen">
        <div className="flex-1 flex justify-center items-center">
          <div className="bg-white rounded-lg shadow-md p-8 flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1e1b4b] mb-4"></div>
            <div className="text-xl text-gray-600">Loading dashboard...</div>
            <p className="text-sm text-gray-500 mt-2">Please wait while we prepare your dashboard</p>
          </div>
        </div>
      </div>
    );
  }

  // User display name
  const displayName = user ? 
    `${user.first_name} ${user.last_name}` : 
    'Branch Manager';

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <a href="/branch-manager/dashboard" className="text-xl font-bold text-gray-800">AdminBridge</a>
              </div>
              <nav className="ml-6 flex space-x-8">
                <a href="/branch-manager/students" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Students
                </a>
                <a href="/branch-manager/employees" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Employees
                </a>
                <a href="/branch-manager/leads" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Leads
                </a>
                <a href="/branch-manager/jobs" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Jobs
                </a>
              </nav>
            </div>
            <div className="flex items-center">
              <span className="text-gray-700 mr-4">Welcome, {displayName}</span>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition-colors duration-300"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow-lg rounded-lg p-6">
            <h1 className="text-2xl font-bold text-gray-800">Branch Manager Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1 mb-6">Access and manage your branch operations</p>
            
            <DefaultPasswordAlert />
            
            <div className="bg-blue-50 p-4 rounded-md mb-6 border border-blue-100">
              <p className="text-blue-800">
                <span className="font-medium">Role:</span> Branch Manager
              </p>
              {user && (
                <>
                  <p className="text-blue-800 mt-2">
                    <span className="font-medium">Name:</span> {user.first_name} {user.last_name}
                  </p>
                  <p className="text-blue-800 mt-2">
                    <span className="font-medium">Email:</span> {user.email}
                  </p>
                </>
              )}
            </div>

            {/* Branch management sections */}
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="bg-white overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 rounded-lg border border-gray-200">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-indigo-100 rounded-md p-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <div className="ml-5">
                      <h3 className="text-lg font-medium text-gray-900">Students</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        View and manage students at your branch
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-4 sm:px-6 border-t border-gray-200">
                  <div className="text-sm">
                    <a href="/branch-manager/students" className="font-medium text-indigo-600 hover:text-indigo-500 flex justify-between items-center">
                      View students
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 rounded-lg border border-gray-200">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="ml-5">
                      <h3 className="text-lg font-medium text-gray-900">Employees</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Manage employees at your branch
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-4 sm:px-6 border-t border-gray-200">
                  <div className="text-sm">
                    <a href="/branch-manager/employees" className="font-medium text-green-600 hover:text-green-500 flex justify-between items-center">
                      View staff
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 rounded-lg border border-gray-200">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                    </div>
                    <div className="ml-5">
                      <h3 className="text-lg font-medium text-gray-900">Leads</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        View and manage leads for your branch
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-4 sm:px-6 border-t border-gray-200">
                  <div className="text-sm">
                    <a href="/branch-manager/leads" className="font-medium text-blue-600 hover:text-blue-500 flex justify-between items-center">
                      View leads
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
              
              <div className="bg-white overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 rounded-lg border border-gray-200">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-purple-100 rounded-md p-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="ml-5">
                      <h3 className="text-lg font-medium text-gray-900">Jobs</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Manage job listings for your branch
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-4 sm:px-6 border-t border-gray-200">
                  <div className="text-sm">
                    <a href="/branch-manager/jobs" className="font-medium text-purple-600 hover:text-purple-500 flex justify-between items-center">
                      View jobs
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BranchManagerDashboard; 