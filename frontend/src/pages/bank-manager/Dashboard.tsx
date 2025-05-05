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
  bankManagerName: string;
  totalLoans: number;
  pendingLoans: number;
  approvedLoans: number;
  rejectedLoans: number;
  loanTypeDistribution?: Record<string, number>;
  loanStatusDistribution?: Record<string, number>;
  monthlyLoanAmount?: Record<string, number>;
  branchDistribution?: Record<string, number>;
}

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
}

const BankManagerDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    bankManagerName: '',
    totalLoans: 0,
    pendingLoans: 0,
    approvedLoans: 0,
    rejectedLoans: 0,
    loanTypeDistribution: {},
    loanStatusDistribution: {},
    monthlyLoanAmount: {},
    branchDistribution: {}
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
        const response = await axios.get(`${API_URL}/bank-manager/stats`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        
        if (response.data) {
          console.log('Received bank manager stats:', response.data);
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
    (userEmail || 'Bank Manager');

  // Chart data for loan types
  const loanTypeChartData = {
    labels: Object.keys(stats.loanTypeDistribution || {}),
    datasets: [
      {
        label: 'Loan Types',
        data: Object.values(stats.loanTypeDistribution || {}),
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

  // Chart data for loan status distribution
  const loanStatusChartData = {
    labels: Object.keys(stats.loanStatusDistribution || {}),
    datasets: [
      {
        label: 'Loan Status',
        data: Object.values(stats.loanStatusDistribution || {}),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Chart data for monthly loan amounts
  const monthlyLoanChartData = {
    labels: Object.keys(stats.monthlyLoanAmount || {}),
    datasets: [
      {
        label: 'Monthly Loan Amounts',
        data: Object.values(stats.monthlyLoanAmount || {}),
        fill: false,
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        tension: 0.1
      },
    ],
  };

  // Chart data for branch distribution
  const branchDistributionChartData = {
    labels: Object.keys(stats.branchDistribution || {}),
    datasets: [
      {
        label: 'Loans by Branch',
        data: Object.values(stats.branchDistribution || {}),
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

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">
            Bank Manager Dashboard
          </h1>
          <div className="flex items-center">
            <span className="mr-4 text-gray-700">Welcome, {displayName}</span>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          
          <DefaultPasswordAlert />
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {/* Total Loans Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Loans</dt>
                      <dd className="text-3xl font-semibold text-gray-900">{stats.totalLoans}</dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-4 sm:px-6">
                <div className="text-sm">
                  <a href="/bank-manager/loans" className="font-medium text-blue-600 hover:text-blue-500">View all loans</a>
                </div>
              </div>
            </div>

            {/* Pending Loans Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Pending Loans</dt>
                      <dd className="text-3xl font-semibold text-gray-900">{stats.pendingLoans}</dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-4 sm:px-6">
                <div className="text-sm">
                  <a href="/bank-manager/loans?status=pending" className="font-medium text-yellow-600 hover:text-yellow-500">View pending loans</a>
                </div>
              </div>
            </div>

            {/* Approved Loans Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Approved Loans</dt>
                      <dd className="text-3xl font-semibold text-gray-900">{stats.approvedLoans}</dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-4 sm:px-6">
                <div className="text-sm">
                  <a href="/bank-manager/loans?status=approved" className="font-medium text-green-600 hover:text-green-500">View approved loans</a>
                </div>
              </div>
            </div>

            {/* Rejected Loans Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-red-500 rounded-md p-3">
                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Rejected Loans</dt>
                      <dd className="text-3xl font-semibold text-gray-900">{stats.rejectedLoans}</dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-4 sm:px-6">
                <div className="text-sm">
                  <a href="/bank-manager/loans?status=rejected" className="font-medium text-red-600 hover:text-red-500">View rejected loans</a>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Loan Types Pie Chart */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Loan Types</h3>
                <div className="h-64">
                  <Doughnut data={loanTypeChartData} options={{ maintainAspectRatio: false }} />
                </div>
              </div>
            </div>

            {/* Loan Status Distribution Pie Chart */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Loan Status Distribution</h3>
                <div className="h-64">
                  <Pie data={loanStatusChartData} options={{ maintainAspectRatio: false }} />
                </div>
              </div>
            </div>

            {/* Monthly Loan Amount Line Chart */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Loan Amounts</h3>
                <div className="h-64">
                  <Line data={monthlyLoanChartData} options={{ maintainAspectRatio: false }} />
                </div>
              </div>
            </div>

            {/* Branch Distribution Bar Chart */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Loans by Branch</h3>
                <div className="h-64">
                  <Bar data={branchDistributionChartData} options={{ maintainAspectRatio: false }} />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions Section */}
          <div className="mt-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="bg-white overflow-hidden shadow rounded-lg hover:bg-gray-50 transition-colors duration-300">
                <a href="/bank-manager/loans/new" className="block p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                      <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">Create New Loan</h3>
                      <p className="text-sm text-gray-500">Register a new loan application</p>
                    </div>
                  </div>
                </a>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg hover:bg-gray-50 transition-colors duration-300">
                <a href="/bank-manager/loans/pending" className="block p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3">
                      <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">Review Pending Loans</h3>
                      <p className="text-sm text-gray-500">Check loans awaiting approval</p>
                    </div>
                  </div>
                </a>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg hover:bg-gray-50 transition-colors duration-300">
                <a href="/bank-manager/reports" className="block p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                      <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">Generate Reports</h3>
                      <p className="text-sm text-gray-500">Create loan performance reports</p>
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

export default BankManagerDashboard; 