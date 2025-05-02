import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface Employee {
  id: number;
  employee_id: string;
  branch: number;
  branch_name: string;
  profile_image: string | null;
  citizenship_document: string | null;
  dob: string | null;
  gender: string | null;
  user: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
  };
  contact_number: string;
  address: string;
  nationality?: string;
}

const EmployeeList = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      navigate('/login');
      return;
    }

    // Fetch employees from API
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        
        const response = await axios.get('http://localhost:8000/api/employees/', {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        
        setEmployees(response.data);
        setLoading(false);
      } catch (err: any) {
        setError('Failed to fetch employees');
        setLoading(false);
        console.error('Error fetching employees:', err);
      }
    };

    fetchEmployees();
  }, [navigate]);

  const handleAddEmployee = () => {
    navigate('/admin/employees/add');
  };

  const handleViewEmployee = (id: number) => {
    navigate(`/admin/employees/view/${id}`);
  };

  const handleEditEmployee = (id: number) => {
    navigate(`/admin/employees/edit/${id}`);
  };
  
  const handleDeleteEmployee = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) {
      return;
    }
    
    const accessToken = localStorage.getItem('access_token');
    
    try {
      await axios.delete(`http://localhost:8000/api/employees/${id}/`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      
      // Remove the deleted employee from state
      setEmployees(employees.filter(employee => employee.id !== id));
    } catch (err) {
      console.error('Error deleting employee:', err);
      setError('Failed to delete employee. Please try again.');
    }
  };

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-6 flex justify-center items-center">
        <div className="text-xl text-gray-600">Loading employees...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Employee Management</h1>
          <button
            onClick={handleAddEmployee}
            className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition-colors duration-300"
          >
            Add New Employee
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {employees.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-600">No employees found. Add your first employee!</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Branch
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      DOB
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Gender
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nationality
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Documents
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {employees.map((employee) => (
                    <tr key={employee.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{employee.employee_id}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {employee.profile_image ? (
                            <img
                              src={employee.profile_image}
                              alt={`${employee.user.first_name}'s profile`}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                              {employee.user.first_name.charAt(0)}
                            </div>
                          )}
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{employee.user.first_name} {employee.user.last_name}</div>
                            <div className="text-sm text-gray-500">{employee.user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{employee.user.role}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{employee.branch_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{employee.contact_number}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDate(employee.dob)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{employee.gender || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{employee.nationality || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {employee.citizenship_document ? (
                          <a 
                            href={employee.citizenship_document} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-700 flex items-center"
                            title="View citizenship document"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span>View</span>
                          </a>
                        ) : (
                          <span className="text-gray-400 flex items-center" title="No citizenship document">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>None</span>
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleViewEmployee(employee.id)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleEditEmployee(employee.id)}
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteEmployee(employee.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeList; 