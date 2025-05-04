import { useState, useEffect } from 'react';
import axios from 'axios';
import { PhoneIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

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
  branch: {
    id: number;
    name: string;
  };
  contact_number: string;
  joining_date: string;
}

const ReceptionistEmployeeList = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) {
          setError('You are not authenticated');
          setLoading(false);
          return;
        }

        const response = await axios.get('http://localhost:8000/api/employees/', {
          headers: { Authorization: `Bearer ${accessToken}` }
        });

        setEmployees(response.data);
        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching employees:', err);
        setError(err.response?.data?.detail || 'Failed to fetch employees');
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  // Format date to a readable format
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not specified';
    
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get badge color based on role
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

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="p-6 border-b">
        <h1 className="text-2xl font-semibold text-gray-800">Branch Employees</h1>
        <p className="text-gray-500 mt-1">View employees in your branch</p>
      </div>

      {employees.length === 0 ? (
        <div className="p-6 text-center text-gray-500">
          No employees found in your branch
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joining Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {employees.map((employee) => (
                <tr key={employee.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="ml-0">
                        <div className="text-sm font-medium text-gray-900">
                          {employee.user.first_name} {employee.user.last_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {employee.employee_id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(employee.user.role)}`}>
                      {employee.user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {employee.user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {employee.contact_number || 'Not available'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(employee.joining_date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3 flex">
                    <a
                      href={`tel:${employee.contact_number}`}
                      className="text-blue-600 hover:text-blue-900"
                      title="Call"
                    >
                      <PhoneIcon className="w-5 h-5" />
                    </a>
                    <a
                      href={`mailto:${employee.user.email}`}
                      className="text-green-600 hover:text-green-900"
                      title="Email"
                    >
                      <EnvelopeIcon className="w-5 h-5" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ReceptionistEmployeeList; 