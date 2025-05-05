import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Bar, Pie, Doughnut, Line } from 'react-chartjs-2';
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
import { API_URL } from '../../lib/api';

// Register ChartJS components
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

interface DashboardStats {
  counsellorName: string;
  branchName: string;
  assignedStudentCount: number;
  assignedLeadCount: number;
  upcomingAppointmentCount: number;
  studentStatusDistribution?: Record<string, number>;
  leadStatusDistribution?: Record<string, number>;
  performanceMetrics?: Record<string, number>;
  weeklySchedule?: Record<string, number>;
}

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  branch?: string;
}

const CounsellorDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    counsellorName: '',
    branchName: '',
    assignedStudentCount: 0,
    assignedLeadCount: 0,
    upcomingAppointmentCount: 0,
    studentStatusDistribution: {},
    leadStatusDistribution: {},
    performanceMetrics: {},
    weeklySchedule: {}
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userEmail, setUserEmail] = useState<string>('');
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
        const response = await axios.get(`${API_URL}/counsellor/stats`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        
        if (response.data) {
          console.log('Received counsellor stats:', response.data);
          setStats(response.data);
        } else {
          setError('No data received from server');
          console.error('No data received from stats API');
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        setError('Failed to fetch data from server');
      } finally {
        setLoading(false);
      }
    };
    
    // Call the fetch function
    fetchStats();

    // Set up interval to refresh data every 5 minutes (300000 ms)
    const intervalId = setInterval(fetchStats, 300000);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
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

  // User display name logic - if we have full user data, use first_name + last_name
  // otherwise use the email or a default
  const displayName = user ? 
    `${user.first_name} ${user.last_name}` : 
    (userEmail || 'Counsellor');

  // Extract branch name from user data if available, otherwise use from stats
  const branchName = (user && user.branch) ? user.branch : stats.branchName;

  // Chart data for student status distribution
  const studentStatusChartData = {
    labels: Object.keys(stats.studentStatusDistribution || {}),
    datasets: [
      {
        label: 'Students by Status',
        data: Object.values(stats.studentStatusDistribution || {}),
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

  // Chart data for lead status distribution
  const leadStatusChartData = {
    labels: Object.keys(stats.leadStatusDistribution || {}),
    datasets: [
      {
        label: 'Leads by Status',
        data: Object.values(stats.leadStatusDistribution || {}),
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

  // Chart data for performance metrics
  const performanceChartData = {
    labels: Object.keys(stats.performanceMetrics || {}),
    datasets: [
      {
        label: 'Performance Metrics',
        data: Object.values(stats.performanceMetrics || {}),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Chart data for weekly schedule
  const scheduleChartData = {
    labels: Object.keys(stats.weeklySchedule || {}),
    datasets: [
      {
        label: 'Weekly Appointments',
        data: Object.values(stats.weeklySchedule || {}),
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-100">
     

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          
          <DefaultPasswordAlert />
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {/* Assigned Students Card */}
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
                      <dt className="text-sm font-medium text-gray-500 truncate">Assigned Students</dt>
                      <dd className="text-3xl font-semibold text-gray-900">{stats.assignedStudentCount}</dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-4 sm:px-6">
                <div className="text-sm">
                  <a href="/counsellor/students" className="font-medium text-blue-600 hover:text-blue-500">View all students</a>
                </div>
              </div>
            </div>

            {/* Assigned Leads Card */}
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
                      <dt className="text-sm font-medium text-gray-500 truncate">Assigned Leads</dt>
                      <dd className="text-3xl font-semibold text-gray-900">{stats.assignedLeadCount}</dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-4 sm:px-6">
                <div className="text-sm">
                  <a href="/counsellor/leads" className="font-medium text-yellow-600 hover:text-yellow-500">View all leads</a>
                </div>
              </div>
            </div>

            {/* Upcoming Appointments Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Upcoming Appointments</dt>
                      <dd className="text-3xl font-semibold text-gray-900">{stats.upcomingAppointmentCount}</dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-4 sm:px-6">
                <div className="text-sm">
                  <a href="/counsellor/appointments" className="font-medium text-green-600 hover:text-green-500">View calendar</a>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Student Status Distribution Pie Chart */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Student Status Distribution</h3>
                <div className="h-64">
                  <Pie data={studentStatusChartData} options={{ maintainAspectRatio: false }} />
                </div>
              </div>
            </div>

            {/* Lead Status Distribution Doughnut Chart */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Lead Status Distribution</h3>
                <div className="h-64">
                  <Doughnut data={leadStatusChartData} options={{ maintainAspectRatio: false }} />
                </div>
              </div>
            </div>

            {/* Performance Metrics Bar Chart */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Metrics</h3>
                <div className="h-64">
                  <Bar data={performanceChartData} options={{ maintainAspectRatio: false }} />
                </div>
              </div>
            </div>

            {/* Weekly Schedule Bar Chart */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Weekly Schedule</h3>
                <div className="h-64">
                  <Bar data={scheduleChartData} options={{ maintainAspectRatio: false }} />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions Section */}
          <div className="mt-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="bg-white overflow-hidden shadow rounded-lg hover:bg-gray-50 transition-colors duration-300">
                <a href="/counsellor/students/add" className="block p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                      <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">Add New Student</h3>
                      <p className="text-sm text-gray-500">Register a new student</p>
                    </div>
                  </div>
                </a>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg hover:bg-gray-50 transition-colors duration-300">
                <a href="/counsellor/leads/add" className="block p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3">
                      <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">Add New Lead</h3>
                      <p className="text-sm text-gray-500">Register a new prospect</p>
                    </div>
                  </div>
                </a>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg hover:bg-gray-50 transition-colors duration-300">
                <a href="/counsellor/appointments/add" className="block p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                      <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">Schedule Appointment</h3>
                      <p className="text-sm text-gray-500">Create a new appointment</p>
                    </div>
                  </div>
                </a>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg hover:bg-gray-50 transition-colors duration-300">
                <a href="/counsellor/reports" className="block p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-purple-100 rounded-md p-3">
                      <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">View Reports</h3>
                      <p className="text-sm text-gray-500">See student progress reports</p>
                    </div>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CounsellorDashboard; 