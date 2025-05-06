import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import { useAuth } from '../../lib/AuthContext';

interface Branch {
  id: number;
  name: string;
  city: string;
  country: string;
}

interface Employee {
  id: number;
  user: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    role: string;
  };
  employee_id: string;
  branch: Branch;
  contact_number: string;
  address: string;
  emergency_contact: string | null;
  nationality: string;
  gender: string;
  dob: string | null;
  joining_date: string;
  profile_image: string | null;
  citizenship_document: string | null;
}

const ViewEmployee = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) {
          navigate('/login');
          return;
        }
        
        const response = await axios.get(`http://localhost:8000/api/employees/${id}/`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        
        // Check if attempting to view a SuperAdmin and current user is not a SuperAdmin
        if (response.data.user.role === 'SuperAdmin' && user?.role !== 'SuperAdmin') {
          setError('You do not have permission to view this employee.');
          setLoading(false);
          return;
        }
        
        setEmployee(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching employee:', err);
        setError('Failed to load employee data. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchEmployee();
  }, [id, navigate, user]);
  
  const handleBack = () => {
    navigate(-1); // Go back to previous page
  };
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not specified';
    
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (e) {
      return 'Invalid date';
    }
  };
  
  // Get color for role badge
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'BranchManager':
        return 'bg-blue-100 text-blue-800';
      case 'Counsellor':
        return 'bg-green-100 text-green-800';
      case 'Receptionist':
        return 'bg-purple-100 text-purple-800';
      case 'BankManager':
        return 'bg-yellow-100 text-yellow-800';
      case 'SuperAdmin':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-6 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Loading employee data...</h2>
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
          <div className="flex justify-center">
            <button
              onClick={handleBack}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 transition-colors duration-300"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  if (!employee) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
          <div className="text-center text-gray-600">
            Employee not found
          </div>
          <div className="flex justify-center mt-4">
            <button
              onClick={handleBack}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 transition-colors duration-300"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Employee Details</h1>
            <p className="text-gray-600 mt-1">Viewing employee information</p>
          </div>
          <div>
            <button
              onClick={handleBack}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 transition-colors duration-300"
            >
              Back
            </button>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="border-b border-gray-200 bg-gray-50 px-6 py-4 flex items-center">
            {employee.profile_image && (
              <div className="mr-4">
                <img 
                  src={`http://localhost:8000${employee.profile_image}`} 
                  alt={`${employee.user.first_name} ${employee.user.last_name}`}
                  className="h-16 w-16 rounded-full object-cover" 
                />
              </div>
            )}
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                {employee.user.first_name} {employee.user.last_name}
              </h2>
              <div className="mt-1 flex items-center">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(employee.user.role)}`}>
                  {employee.user.role}
                </span>
                <span className="ml-2 text-sm text-gray-500">
                  ID: {employee.employee_id}
                </span>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-md font-medium text-gray-800 mb-3">Basic Information</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-gray-500 text-sm">Email:</span>
                    <p className="text-gray-800">{employee.user.email}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-sm">Phone:</span>
                    <p className="text-gray-800">{employee.contact_number}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-sm">Branch:</span>
                    <p className="text-gray-800">{employee.branch?.name || 'Not assigned'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-sm">Joining Date:</span>
                    <p className="text-gray-800">{formatDate(employee.joining_date)}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-md font-medium text-gray-800 mb-3">Personal Information</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-gray-500 text-sm">Gender:</span>
                    <p className="text-gray-800">{employee.gender}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-sm">Nationality:</span>
                    <p className="text-gray-800">{employee.nationality}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-sm">Date of Birth:</span>
                    <p className="text-gray-800">{formatDate(employee.dob)}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-sm">Address:</span>
                    <p className="text-gray-800">{employee.address || 'Not specified'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-sm">Emergency Contact:</span>
                    <p className="text-gray-800">{employee.emergency_contact || 'Not specified'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewEmployee; 