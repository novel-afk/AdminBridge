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
  receptionistName: string;
  branchName: string;
  todayLeadCount: number;
  todayVisitorCount: number;
  upcomingAppointmentCount: number;
  leadSourceDistribution?: Record<string, number>;
  studentCourseDistribution?: Record<string, number>;
  visitorTraffic?: Record<string, number>;
}

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  branch?: string;
}

const ReceptionistDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    receptionistName: '',
    branchName: '',
    todayLeadCount: 0,
    todayVisitorCount: 0,
    upcomingAppointmentCount: 0,
    leadSourceDistribution: {},
    studentCourseDistribution: {},
    visitorTraffic: {}
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
        const response = await axios.get(`${API_URL}/receptionist/stats`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        
        if (response.data) {
          console.log('Received receptionist stats:', response.data);
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
    (userEmail || 'Receptionist');

  // Extract branch name from user data if available, otherwise use from stats
  const branchName = (user && user.branch) ? user.branch : stats.branchName;

  // Chart data for lead sources
  const leadSourceChartData = {
    labels: Object.keys(stats.leadSourceDistribution || {}),
    datasets: [
      {
        label: 'Lead Sources',
        data: Object.values(stats.leadSourceDistribution || {}),
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

  // Chart data for student course distribution
  const courseDistributionChartData = {
    labels: Object.keys(stats.studentCourseDistribution || {}),
    datasets: [
      {
        label: 'Student Course Distribution',
        data: Object.values(stats.studentCourseDistribution || {}),
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

  // Chart data for visitor traffic
  const visitorTrafficChartData = {
    labels: Object.keys(stats.visitorTraffic || {}),
    datasets: [
      {
        label: 'Daily Visitor Traffic',
        data: Object.values(stats.visitorTraffic || {}),
        fill: false,
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        tension: 0.1
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
            {/* Today's Leads Card */}
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
                      <dt className="text-sm font-medium text-gray-500 truncate">Today's Leads</dt>
                      <dd className="text-3xl font-semibold text-gray-900">{stats.todayLeadCount}</dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-4 sm:px-6">
                <div className="text-sm">
                  <a href="/receptionist/leads" className="font-medium text-yellow-600 hover:text-yellow-500">View all leads</a>
                </div>
              </div>
            </div>

            {/* Today's Visitors Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Today's Visitors</dt>
                      <dd className="text-3xl font-semibold text-gray-900">{stats.todayVisitorCount}</dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-4 sm:px-6">
                <div className="text-sm">
                  <a href="/receptionist/visitors" className="font-medium text-blue-600 hover:text-blue-500">View visitor log</a>
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
                  <a href="/receptionist/appointments" className="font-medium text-green-600 hover:text-green-500">View calendar</a>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Lead Sources Pie Chart */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Lead Sources</h3>
                <div className="h-64">
                  <Pie data={leadSourceChartData} options={{ maintainAspectRatio: false }} />
                </div>
              </div>
            </div>

            {/* Student Course Distribution Doughnut Chart */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Student Course Distribution</h3>
                <div className="h-64">
                  <Doughnut data={courseDistributionChartData} options={{ maintainAspectRatio: false }} />
                </div>
              </div>
            </div>

            {/* Visitor Traffic Line Chart */}
            <div className="bg-white overflow-hidden shadow rounded-lg md:col-span-2">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Daily Visitor Traffic</h3>
                <div className="h-80">
                  <Line data={visitorTrafficChartData} options={{ maintainAspectRatio: false }} />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions Section */}
          <div className="mt-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="bg-white overflow-hidden shadow rounded-lg hover:bg-gray-50 transition-colors duration-300">
                <a href="/receptionist/leads/add" className="block p-6">
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
                <a href="/receptionist/visitors/add" className="block p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                      <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">Add New Visitor</h3>
                      <p className="text-sm text-gray-500">Log a visitor entry</p>
                    </div>
                  </div>
                </a>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg hover:bg-gray-50 transition-colors duration-300">
                <a href="/receptionist/appointments/add" className="block p-6">
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
                <a href="/receptionist/checkin" className="block p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-purple-100 rounded-md p-3">
                      <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">Student Check-in</h3>
                      <p className="text-sm text-gray-500">Record student attendance</p>
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

export default ReceptionistDashboard; 