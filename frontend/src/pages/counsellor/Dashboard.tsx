import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { UserGroupIcon, UserPlusIcon, BriefcaseIcon, CalendarIcon } from '@heroicons/react/24/outline';
import DefaultPasswordAlert from '../../components/DefaultPasswordAlert';

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
}

const CounsellorDashboard = () => {
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
        
        // Make sure this dashboard is only accessible to counsellors
        if (parsedUser.role !== 'Counsellor') {
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
          
          if (response.data.role !== 'Counsellor') {
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
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-2xl text-gray-600">Loading...</div>
      </div>
    );
  }

  // User display name
  const displayName = user ? 
    `${user.first_name} ${user.last_name}` : 
    'Counsellor';

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-gray-800">AdminBridge</h1>
              </div>
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
          <div className="bg-white overflow-hidden shadow rounded-lg p-6">
            <h1 className="text-2xl font-semibold text-gray-900 mb-4">Counsellor Dashboard</h1>
            
            <DefaultPasswordAlert />
            
            <div className="bg-green-50 p-4 rounded-md mb-6">
              <p className="text-green-800">
                <span className="font-medium">Role:</span> Counsellor
              </p>
              {user && (
                <>
                  <p className="text-green-800 mt-2">
                    <span className="font-medium">Name:</span> {user.first_name} {user.last_name}
                  </p>
                  <p className="text-green-800 mt-2">
                    <span className="font-medium">Email:</span> {user.email}
                  </p>
                </>
              )}
            </div>
            
            <p className="text-gray-600">
              Welcome to your Counsellor dashboard. From here, you can manage your student consultations and leads.
            </p>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <div className="bg-white overflow-hidden shadow rounded-lg transition-all duration-300 hover:shadow-lg border border-gray-200">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                      <UserGroupIcon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-5">
                      <h3 className="text-lg font-medium text-gray-900">My Students</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        View and manage your assigned students
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-4 sm:px-6">
                  <div className="text-sm">
                    <Link to="/counsellor/students" className="font-medium text-blue-600 hover:text-blue-500">
                      View students <span aria-hidden="true">&rarr;</span>
                    </Link>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg transition-all duration-300 hover:shadow-lg border border-gray-200">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                      <UserPlusIcon className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-5">
                      <h3 className="text-lg font-medium text-gray-900">My Leads</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        View and manage your assigned leads
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-4 sm:px-6">
                  <div className="text-sm">
                    <Link to="/counsellor/leads" className="font-medium text-green-600 hover:text-green-500">
                      View leads <span aria-hidden="true">&rarr;</span>
                    </Link>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg transition-all duration-300 hover:shadow-lg border border-gray-200">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-purple-100 rounded-md p-3">
                      <BriefcaseIcon className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="ml-5">
                      <h3 className="text-lg font-medium text-gray-900">Branch Employees</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        View employees in your branch
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-4 sm:px-6">
                  <div className="text-sm">
                    <Link to="/counsellor/employees" className="font-medium text-purple-600 hover:text-purple-500">
                      View employees <span aria-hidden="true">&rarr;</span>
                    </Link>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg transition-all duration-300 hover:shadow-lg border border-gray-200">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3">
                      <CalendarIcon className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div className="ml-5">
                      <h3 className="text-lg font-medium text-gray-900">My Profile</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        View and update your personal information
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-4 sm:px-6">
                  <div className="text-sm">
                    <Link to="/profile" className="font-medium text-yellow-600 hover:text-yellow-500">
                      View profile <span aria-hidden="true">&rarr;</span>
                    </Link>
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

export default CounsellorDashboard; 