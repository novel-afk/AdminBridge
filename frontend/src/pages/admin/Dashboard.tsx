import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Bar, Pie, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';
import DefaultPasswordAlert from '../../components/DefaultPasswordAlert';
import { API_BASE_URL } from '../../lib/apiConfig';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

interface User {
  id: number;
  email: string;
  role: string;
  first_name: string;
  last_name: string;
}

interface ActivityLogType {
  id: number;
  user_name: string;
  action_details: string;
  created_at: string;
}

interface DashboardStats {
  branchCount: number;
  managerCount: number;
  counsellorCount: number;
  receptionistCount: number;
  studentCount: number;
  monthlyStudentRegistrations?: Record<string, number>;
  studentsByBranch?: Record<string, number>;
  leadsStatusCount?: Record<string, number>;
  leadCount: number;
  jobCount: number;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    branchCount: 0,
    managerCount: 0,
    counsellorCount: 0,
    receptionistCount: 0,
    studentCount: 0,
    monthlyStudentRegistrations: {},
    studentsByBranch: {},
    leadsStatusCount: {},
    leadCount: 0,
    jobCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userEmail, setUserEmail] = useState<string>('');
  const [activityLogs, setActivityLogs] = useState<ActivityLogType[]>([]);
  const [allLogs, setAllLogs] = useState<ActivityLogType[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const logsPerPage = 10;
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in with access token
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      navigate('/login');
      return;
    }

    // Try to get user info from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (e) {
        console.error('Error parsing user from localStorage:', e);
      }
    }

    // Get user email as fallback
    const email = localStorage.getItem('user_email');
    if (email) {
      setUserEmail(email);
    }

    // Fetch real-time dashboard statistics from API
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await axios.get(`${API_BASE_URL}/admin/stats/`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        
        if (response.data) {
          console.log('Received admin stats:', response.data);
          setStats(response.data);
        } else {
          setError('No data received from server');
          console.error('No data received from stats API');
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        setError('Failed to fetch data from server');
        
        // Don't use fallback data immediately - show the error to admin
      } finally {
        setLoading(false);
      }
    };
    
    // Call the fetch functions
    fetchStats();
    fetchAllActivityLogs();

    // Set up interval to refresh data every 5 minutes (300000 ms)
    const intervalId = setInterval(() => {
      fetchStats();
      fetchAllActivityLogs();
    }, 300000);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, [navigate, currentPage]);

  const fetchAllActivityLogs = async () => {
    try {
      setIsLoadingLogs(true);
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        navigate('/login');
        return;
      }
      const response = await axios.get(`${API_BASE_URL}/activity-logs/all/`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const logs = response.data;
      setAllLogs(logs);
      
      // Calculate total pages
      setTotalPages(Math.ceil(logs.length / logsPerPage));
      
      // Update current page logs
      const startIndex = (currentPage - 1) * logsPerPage;
      const endIndex = startIndex + logsPerPage;
      setActivityLogs(logs.slice(startIndex, endIndex));
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      setAllLogs([]);
      setActivityLogs([]);
      setTotalPages(1);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    const startIndex = (newPage - 1) * logsPerPage;
    const endIndex = startIndex + logsPerPage;
    setActivityLogs(allLogs.slice(startIndex, endIndex));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          <p className="mt-4 text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="flex items-center justify-center text-red-500 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-center text-gray-800 mb-2">Data Error</h2>
          <p className="text-gray-600 text-center mb-6">{error}</p>
          <div className="flex justify-center">
            <button 
              onClick={() => window.location.reload()}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const displayName = user ? 
    `${user.first_name} ${user.last_name}` : 
    (userEmail || 'Admin User');

  const branchBarChartData = {
    labels: Object.keys(stats.studentsByBranch || {}),
    datasets: [
      {
        label: 'Number of Students',
        data: Object.values(stats.studentsByBranch || {}),
        backgroundColor: [
          'rgba(54, 162, 235, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 159, 64, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 99, 132, 0.6)',
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const leadsPieChartData = {
    labels: Object.keys(stats.leadsStatusCount || {}),
    datasets: [
      {
        label: 'Lead Status',
        data: Object.values(stats.leadsStatusCount || {}),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const registrationsLineChartData = {
    labels: Object.keys(stats.monthlyStudentRegistrations || {}),
    datasets: [
      {
        label: 'Monthly Student Registrations',
        data: Object.values(stats.monthlyStudentRegistrations || {}),
        fill: false,
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        tension: 0.1
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="flex-1 overflow-y-auto focus:outline-none">
        <div className="py-6">
          <div className="px-4 sm:px-6 md:px-8">
            <div className="px-4 py-6 sm:px-0">
              <h1 className="text-2xl font-semibold text-gray-900 mb-4">Admin Dashboard</h1>
              
              <DefaultPasswordAlert />
              
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                        <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                        </svg>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Total Branches</dt>
                          <dd className="text-3xl font-semibold text-gray-900">{stats.branchCount}</dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-4 py-4 sm:px-6">
                    <div className="text-sm">
                      <a href="/admin/branches" className="font-medium text-indigo-600 hover:text-indigo-500">View all branches</a>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                        <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                        </svg>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Total Employees</dt>
                          <dd className="text-3xl font-semibold text-gray-900">{stats.managerCount + stats.counsellorCount + stats.receptionistCount}</dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-4 py-4 sm:px-6">
                    <div className="text-sm">
                      <a href="/admin/employees" className="font-medium text-green-600 hover:text-green-500">View all employees</a>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                        <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 14l9-5-9-5-9 5 9 5z"></path>
                          <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"></path>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"></path>
                        </svg>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Total Students</dt>
                          <dd className="text-3xl font-semibold text-gray-900">{stats.studentCount}</dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-4 py-4 sm:px-6">
                    <div className="text-sm">
                      <a href="/admin/students" className="font-medium text-blue-600 hover:text-blue-500">View all students</a>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                        <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"></path>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"></path>
                        </svg>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">New Leads</dt>
                          <dd className="text-3xl font-semibold text-gray-900">{stats.leadCount}</dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-4 py-4 sm:px-6">
                    <div className="text-sm">
                      <a href="/admin/leads" className="font-medium text-yellow-600 hover:text-yellow-500">View all leads</a>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                        <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                        </svg>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Active Jobs</dt>
                          <dd className="text-3xl font-semibold text-gray-900">{stats.jobCount}</dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-4 py-4 sm:px-6">
                    <div className="text-sm">
                      <a href="/admin/jobs" className="font-medium text-purple-600 hover:text-purple-500">View all jobs</a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Students by Branch</h3>
                    <div className="h-64">
                      <Bar data={branchBarChartData} options={{ maintainAspectRatio: false }} />
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Lead Status Distribution</h3>
                    <div className="h-64">
                      <Pie data={leadsPieChartData} options={{ maintainAspectRatio: false }} />
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg lg:col-span-2">
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Student Registrations</h3>
                    <div className="h-80">
                      <Line data={registrationsLineChartData} options={{ maintainAspectRatio: false }} />
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg mt-8 lg:col-span-2">
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity Logs</h3>
                    <div className="overflow-x-auto">
                      <div className="bg-white shadow rounded-lg p-4 mt-4">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Activity Logs</h3>
                        {isLoadingLogs ? (
                          <div className="flex justify-center py-4">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                          </div>
                        ) : (
                          <>
                            <div className="overflow-x-auto">
                              <table className="min-w-full divide-y divide-gray-200">
                                <thead>
                                  <tr>
                                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                  {activityLogs.map((log) => (
                                    <tr key={log.id}>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.user_name}</td>
                                      <td className="px-6 py-4 text-sm text-gray-900">{log.action_details}</td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(log.created_at).toLocaleString()}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                            <div className="flex items-center justify-between mt-4 text-sm">
                              <div className="text-gray-500">
                                Showing {((currentPage - 1) * logsPerPage) + 1} to {Math.min(currentPage * logsPerPage, allLogs.length)} of {allLogs.length} entries
                              </div>
                              <div className="flex space-x-2">
                                <button
                                  type="button"
                                  className={`px-3 py-1 rounded ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                                  onClick={() => handlePageChange(currentPage - 1)}
                                  disabled={currentPage === 1}
                                >
                                  Previous
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                  <button
                                    type="button"
                                    key={page}
                                    className={`px-3 py-1 rounded ${page === currentPage ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                                    onClick={() => handlePageChange(page)}
                                  >
                                    {page}
                                  </button>
                                ))}
                                <button
                                  type="button"
                                  className={`px-3 py-1 rounded ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                                  onClick={() => handlePageChange(currentPage + 1)}
                                  disabled={currentPage === totalPages}
                                >
                                  Next
                                </button>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
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

export default AdminDashboard; 