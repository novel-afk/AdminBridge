import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  MagnifyingGlassIcon, 
  PlusIcon, 
  ArrowDownTrayIcon, 
  TrashIcon, 
  EyeIcon, 
  PencilIcon 
} from '@heroicons/react/24/outline';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Checkbox } from '../../components/ui/checkbox';
import { Badge } from '../../components/ui/badge';
import AddEmployeeModal from '../../components/AddEmployeeModal';
import EditEmployeeModal from '../../components/EditEmployeeModal';
import ViewEmployeeModal from '../../components/ViewEmployeeModal';
import ConfirmationModal from '../../components/ConfirmationModal';

interface Employee {
  id: number;
  employee_id: string;
  branch: number;
  branch_name: string;
  profile_image: string | null;
  citizenship_document: string | null;
  joining_date: string | null;
  salary: number | null;
  gender: string | null;
  nationality: string | null;
  dob: string | null;
  user: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
  };
  contact_number: string;
  address: string;
  emergency_contact?: string;
  // Adding fields for the UI component matching
  name?: string;
  email?: string;
  phone?: string;
  emergencyContact?: string;
}

const columns = [
  { key: "select", label: "" },
  { key: "sNo", label: "S.No" },
  { key: "name", label: "Name" },
  { key: "role", label: "Role" },
  { key: "gender", label: "Gender" },
  { key: "nationality", label: "Nationality" },
  { key: "phone", label: "Phone Number" },
  { key: "email", label: "Email" },
  { key: "emergencyContact", label: "Emergency Contact" },
  { key: "salary", label: "Salary" },
  { key: "actions", label: "Actions" },
];

const EmployeeList = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();
  
  // UI state variables
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  
  // API base URL
  const API_BASE_URL = 'http://localhost:8000/api';
  
  // Confirmation modal states
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'success' as 'success' | 'warning' | 'danger',
    confirmText: 'Confirm'
  });

  const showConfirmation = (config: Partial<typeof confirmationModal>) => {
    setConfirmationModal({
      ...confirmationModal,
      isOpen: true,
      ...config,
    });
  };
  
  // Format employee data
  const formatEmployeeData = (employee: Employee): Employee => {
    return {
      ...employee,
      name: `${employee.user.first_name} ${employee.user.last_name}`,
      email: employee.user.email,
      phone: employee.contact_number,
      emergencyContact: employee.emergency_contact || '',
    };
  };

  // Fetch employees from API
  const fetchEmployees = async (showRefreshing = false) => {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      navigate('/login');
      return;
    }
    
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError('');
      
      // API call - backend already filters by branch for branch managers
      const response = await axios.get(`${API_BASE_URL}/employees/`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      
      console.log('API Response:', response.data);
      
      // Handle different response formats
      let employeeData: any[] = [];
      if (Array.isArray(response.data)) {
        employeeData = response.data;
      } else if (response.data.results && Array.isArray(response.data.results)) {
        employeeData = response.data.results;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        employeeData = response.data.data;
      }
      
      // Format the employee data
      const formattedEmployees = employeeData.map(formatEmployeeData);
          
      setEmployees(formattedEmployees);
      setLoading(false);
      setRefreshing(false);
    } catch (err: any) {
      console.error('Error fetching employees:', err);
      setError(err.response?.data?.detail || 'Failed to fetch employees. Please try again.');
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    // Check if user is logged in
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      navigate('/login');
      return;
    }

    fetchEmployees();
  }, [navigate]);

  // Filtered employees based on search
  const filteredEmployees = employees.filter((employee) =>
    Object.values(employee).some((value) => 
      value && typeof value === 'string' && 
      value.toLowerCase().includes(searchQuery.toLowerCase())
    ) ||
    (employee.user && Object.values(employee.user).some((value) => 
      value && typeof value === 'string' && 
      value.toLowerCase().includes(searchQuery.toLowerCase())
    ))
  );

  // Pagination
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEmployees = filteredEmployees.slice(startIndex, startIndex + itemsPerPage);
  
  // Table height based on rows
  const getTableHeight = () => {
    if (paginatedEmployees.length === 0) return 'h-auto';
    if (paginatedEmployees.length === 1) return 'h-[120px]';
    if (paginatedEmployees.length === 2) return 'h-[180px]';
    if (paginatedEmployees.length === 3) return 'h-[240px]';
    if (paginatedEmployees.length === 4) return 'h-[300px]';
    if (paginatedEmployees.length === 5) return 'h-[360px]';
    if (paginatedEmployees.length <= 8) return 'h-[500px]';
    if (paginatedEmployees.length <= 12) return 'h-[620px]';
    return 'h-[680px]';
  };

  const getContainerClass = () => {
    if (employees.length === 0) return 'h-full';
    return 'flex-1';
  };

  const handleSelectEmployee = (id: number) => {
    setSelectedEmployees((prev) => {
      if (prev.includes(id)) {
        return prev.filter((employeeId) => employeeId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedEmployees(filteredEmployees.map((employee) => employee.id));
    } else {
      setSelectedEmployees([]);
    }
  };

  const handleExport = () => {
    const exportData = selectedEmployees.length > 0
      ? filteredEmployees.filter(employee => selectedEmployees.includes(employee.id))
      : filteredEmployees;

    // Create CSV content
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Headers
    const headers = [
      "Name", "Email", "Role", "Phone", "Gender", 
      "Nationality", "Emergency Contact", "Salary", "Branch"
    ];
    csvContent += headers.join(",") + "\n";
    
    // Data rows
    exportData.forEach(employee => {
      const row = [
        `"${employee.name || ''}"`,
        `"${employee.email || ''}"`,
        `"${employee.user.role || ''}"`,
        `"${employee.phone || ''}"`,
        `"${employee.gender || ''}"`,
        `"${employee.nationality || ''}"`,
        `"${employee.emergencyContact || ''}"`,
        `"${employee.salary || ''}"`,
        `"${employee.branch_name || ''}"`,
      ];
      csvContent += row.join(",") + "\n";
    });
    
    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "employees_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteSelected = () => {
    showConfirmation({
      title: 'Delete Selected Employees',
      message: `Are you sure you want to delete ${selectedEmployees.length} selected employee(s)? This action cannot be undone.`,
      type: 'danger',
      confirmText: 'Delete',
      onConfirm: async () => {
        const accessToken = localStorage.getItem('access_token');
        try {
          // Delete each selected employee
          for (const id of selectedEmployees) {
            await axios.delete(`${API_BASE_URL}/employees/${id}/`, {
              headers: { Authorization: `Bearer ${accessToken}` }
            });
          }
          
          // Clear selection and refresh
          setSelectedEmployees([]);
          fetchEmployees();
          
        } catch (err) {
          console.error('Error deleting employees:', err);
          setError('Failed to delete employees. Please try again.');
        }
      },
    });
  };

  const handleDeleteSingle = (employee: Employee) => {
    showConfirmation({
      title: 'Delete Employee',
      message: `Are you sure you want to delete ${employee.name}? This action cannot be undone.`,
      type: 'danger',
      confirmText: 'Delete',
      onConfirm: async () => {
        const accessToken = localStorage.getItem('access_token');
        try {
          await axios.delete(`${API_BASE_URL}/employees/${employee.id}/`, {
            headers: { Authorization: `Bearer ${accessToken}` }
          });
          
          fetchEmployees();
          
        } catch (err) {
          console.error('Error deleting employee:', err);
          setError('Failed to delete employee. Please try again.');
        }
      },
    });
  };

  const handleView = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsViewModalOpen(true);
  };

  const handleEdit = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsEditModalOpen(true);
  };

  const handleAddSuccess = () => {
    setIsAddModalOpen(false);
    showConfirmation({
      title: 'Employee Created',
      message: 'The employee has been created successfully.',
      type: 'success',
      confirmText: 'OK',
      onConfirm: () => {
        fetchEmployees(true);
      }
    });
  };

  const handleEditSuccess = () => {
    setIsEditModalOpen(false);
    showConfirmation({
      title: 'Employee Updated',
      message: 'The employee has been updated successfully.',
      type: 'success',
      confirmText: 'OK',
      onConfirm: () => {
        fetchEmployees(true);
      }
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-none pb-6">
          <h1 className="text-2xl font-bold text-gray-800">Employees</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your staff information</p>
        </div>
        
        <div className="flex-1 flex justify-center items-center">
          <div className="bg-white rounded-lg shadow-md p-8 flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1e1b4b] mb-4"></div>
            <div className="text-xl text-gray-600">Loading employees...</div>
            <p className="text-sm text-gray-500 mt-2">Please wait while we fetch the data</p>
          </div>
        </div>
      </div>
    );
  }

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
                <a href="/branch-manager/employees" className="border-indigo-500 text-indigo-600 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium" aria-current="page">
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
              <a href="/branch-manager/dashboard" className="text-gray-500 hover:text-gray-700 p-2">
                Dashboard
              </a>
              <a href="/profile" className="text-gray-500 hover:text-gray-700 p-2 ml-2">
                Profile
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Page title and controls */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex-none pb-6">
          <h1 className="text-2xl font-bold text-gray-800">Employees</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your staff information</p>

          <div className="flex justify-between items-center mt-8">
            <Button 
              onClick={() => setIsAddModalOpen(true)} 
              className="bg-[#1e1b4b] hover:bg-[#1e1b4b]/90 text-white px-4 py-2 rounded-md flex items-center gap-2"
              disabled={refreshing}
            >
              <PlusIcon className="h-5 w-5" />
              Add
            </Button>

            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => fetchEmployees(true)}
                disabled={refreshing}
                className="flex items-center gap-2 text-gray-700 hover:bg-gray-100"
              >
                {refreshing ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-[#1e1b4b] border-t-transparent rounded-full"></div>
                    Refreshing...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                onClick={handleExport} 
                disabled={filteredEmployees.length === 0 || refreshing}
                className="flex items-center gap-2 text-gray-700 hover:bg-gray-100"
              >
                <ArrowDownTrayIcon className="h-5 w-5" />
                Export
              </Button>
              <Button 
                onClick={handleDeleteSelected} 
                disabled={selectedEmployees.length === 0 || refreshing}
                className="bg-red-50 text-red-600 hover:bg-red-100 flex items-center gap-2"
                variant="ghost"
              >
                <TrashIcon className="h-5 w-5" />
                Delete
              </Button>
              <div className="relative ml-2">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                <Input
                  type="text"
                  placeholder="Search employees..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-[300px] bg-white rounded-md border-gray-300 focus:border-[#1e1b4b] focus:ring-1 focus:ring-[#1e1b4b] transition-all duration-200"
                  disabled={refreshing}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Error message if any */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
            <button 
              onClick={() => fetchEmployees()} 
              className="ml-auto text-sm text-red-700 hover:text-red-900 underline"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Employees table */}
        <div className={`bg-white shadow overflow-hidden rounded-lg mb-6 ${getContainerClass()}`}>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <Checkbox
                      checked={selectedEmployees.length === filteredEmployees.length && filteredEmployees.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    S.No
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nationality
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className={`bg-white divide-y divide-gray-200 ${getTableHeight()}`}>
                {paginatedEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                      No employees found.
                    </td>
                  </tr>
                ) : (
                  paginatedEmployees.map((employee, index) => (
                    <tr key={employee.id} className={selectedEmployees.includes(employee.id) ? 'bg-indigo-50' : 'hover:bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Checkbox 
                          checked={selectedEmployees.includes(employee.id)} 
                          onCheckedChange={() => handleSelectEmployee(employee.id)}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {startIndex + index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {employee.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <Badge className="capitalize">{employee.user.role.toLowerCase()}</Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>
                          {employee.email && <div><span className="font-medium">Email:</span> {employee.email}</div>}
                          {employee.phone && <div><span className="font-medium">Phone:</span> {employee.phone}</div>}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {employee.nationality || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <Button 
                          onClick={() => handleView(employee)} 
                          variant="ghost" 
                          size="sm" 
                          className="inline-flex items-center px-2 py-1 text-gray-700 hover:text-indigo-600"
                        >
                          <EyeIcon className="h-4 w-4 mr-1" /> View
                        </Button>
                        <Button 
                          onClick={() => handleEdit(employee)} 
                          variant="ghost" 
                          size="sm" 
                          className="inline-flex items-center px-2 py-1 text-gray-700 hover:text-indigo-600"
                        >
                          <PencilIcon className="h-4 w-4 mr-1" /> Edit
                        </Button>
                        <Button 
                          onClick={() => handleDeleteSingle(employee)} 
                          variant="ghost" 
                          size="sm" 
                          className="inline-flex items-center px-2 py-1 text-gray-700 hover:text-red-600"
                        >
                          <TrashIcon className="h-4 w-4 mr-1" /> Delete
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-lg">
            <div className="flex flex-1 justify-between sm:hidden">
              <Button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                variant="outline"
                className="relative inline-flex items-center rounded-md px-4 py-2 text-sm font-medium"
              >
                Previous
              </Button>
              <Button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                variant="outline"
                className="relative ml-3 inline-flex items-center rounded-md px-4 py-2 text-sm font-medium"
              >
                Next
              </Button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
                  <span className="font-medium">
                    {Math.min(startIndex + itemsPerPage, filteredEmployees.length)}
                  </span>{" "}
                  of <span className="font-medium">{filteredEmployees.length}</span> results
                </p>
              </div>
              <div>
                <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                  <Button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    variant="outline"
                    className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                  >
                    <span className="sr-only">Previous</span>
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                    </svg>
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      variant={currentPage === page ? "default" : "outline"}
                      className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold focus:z-20 ${
                        currentPage === page
                          ? "z-10 bg-indigo-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                          : "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0"
                      }`}
                    >
                      {page}
                    </Button>
                  ))}
                  <Button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    variant="outline"
                    className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                  >
                    <span className="sr-only">Next</span>
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                    </svg>
                  </Button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {isAddModalOpen && (
        <AddEmployeeModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={handleAddSuccess}
        />
      )}

      {isEditModalOpen && selectedEmployee && (
        <EditEmployeeModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={handleEditSuccess}
          employee={selectedEmployee}
        />
      )}

      {isViewModalOpen && selectedEmployee && (
        <ViewEmployeeModal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          employee={selectedEmployee}
        />
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={() => setConfirmationModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmationModal.onConfirm}
        title={confirmationModal.title}
        message={confirmationModal.message}
        type={confirmationModal.type}
        confirmText={confirmationModal.confirmText}
      />
    </div>
  );
};

export default EmployeeList; 