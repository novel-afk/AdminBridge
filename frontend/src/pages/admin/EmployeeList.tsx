import { useState, useEffect } from 'react';
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
  { key: "phoneNumber", label: "Phone Number" },
  { key: "email", label: "Email" },
  { key: "emergencyContact", label: "Emergency Contact" },
  { key: "salary", label: "Salary" },
  { key: "branch", label: "Branch" },
  { key: "actions", label: "Actions" },
];

const EmployeeList = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();
  
  // New state variables for the enhanced UI
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // API base URL - should match your backend configuration
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
  
  // Format employee data for component compatibility
  const formatEmployeeData = (employee: Employee): Employee => {
    return {
      ...employee,
      name: `${employee.user.first_name} ${employee.user.last_name}`,
      email: employee.user.email,
      phone: employee.contact_number,
      emergencyContact: employee.emergency_contact || '',
    };
  };

  // Function to fetch employees from API
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
      
      // Make API call to backend
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
      
      // Format the employee data to match our UI component structure
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

  // Filtered employees based on search query
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

  // Calculate pagination
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEmployees = filteredEmployees.slice(startIndex, startIndex + itemsPerPage);
  
  // Determine dynamic table height based on number of rows
  const getTableHeight = () => {
    if (paginatedEmployees.length === 0) return 'h-auto';
    if (paginatedEmployees.length === 1) return 'h-[120px]';
    if (paginatedEmployees.length === 2) return 'h-[180px]';
    if (paginatedEmployees.length === 3) return 'h-[240px]';
    if (paginatedEmployees.length === 4) return 'h-[300px]';
    if (paginatedEmployees.length === 5) return 'h-[360px]';
    if (paginatedEmployees.length <= 8) return 'h-[500px]';
    if (paginatedEmployees.length <= 10) return 'h-[620px]';
    return 'h-[680px]'; // Fixed height for 11-15 items
  };

  // Calculate container size based on content
  const getContainerClass = () => {
    if (employees.length === 0) return 'h-full';
    return 'flex-1';  // Always use flex-1 for non-empty lists for better layout
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
      setSelectedEmployees(paginatedEmployees.map((employee) => employee.id));
    } else {
      setSelectedEmployees([]);
    }
  };

  const handleExport = () => {
    showConfirmation({
      title: 'Export Employees Data',
      message: 'Are you sure you want to export the employees data?',
      type: 'warning',
      onConfirm: () => {
        // Create CSV content
        const headers = [
          "ID", 
          "Employee ID", 
          "First Name", 
          "Last Name", 
          "Email", 
          "Role",
          "Phone", 
          "Gender", 
          "Nationality", 
          "DOB", 
          "Address", 
          "Emergency Contact", 
          "Salary",
          "Joining Date",
          "Branch"
        ];
        
        const csvRows = [];
        csvRows.push(headers.join(','));
        
        for (const employee of filteredEmployees) {
          const row = [
            employee.id,
            `"${employee.employee_id || ''}"`,
            `"${employee.user.first_name || ''}"`,
            `"${employee.user.last_name || ''}"`,
            `"${employee.user.email || ''}"`,
            `"${employee.user.role || ''}"`,
            `"${employee.contact_number || ''}"`,
            `"${employee.gender || ''}"`,
            `"${employee.nationality || ''}"`,
            `"${employee.dob || ''}"`,
            `"${employee.address?.replace(/"/g, '""') || ''}"`,
            `"${employee.emergency_contact || ''}"`,
            typeof employee.salary === 'number' ? employee.salary.toString() : (employee.salary || ''),
            `"${employee.joining_date || ''}"`,
            `"${employee.branch_name || ''}"`,
          ];
          csvRows.push(row.join(','));
        }
        
        const csvContent = csvRows.join('\n');
        
        // Create download link
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `employees_export_${new Date().toISOString().slice(0,10)}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      },
    });
  };

  const handleDeleteSelected = () => {
    // Filter out SuperAdmin users from selected employees
    const nonSuperAdminSelectedIds = selectedEmployees.filter(id => {
      const employee = employees.find(emp => emp.id === id);
      return employee && employee.user.role !== 'SuperAdmin';
    });
    
    if (nonSuperAdminSelectedIds.length === 0) {
      showConfirmation({
        title: 'Cannot Delete Selected Employees',
        message: 'No employees can be deleted. SuperAdmin users cannot be deleted.',
        type: 'warning',
        confirmText: 'OK',
        onConfirm: () => {},
      });
      return;
    }

    showConfirmation({
      title: 'Delete Selected Employees',
      message: `Are you sure you want to delete ${nonSuperAdminSelectedIds.length} selected employee(s)? This action cannot be undone.`,
      type: 'danger',
      confirmText: 'Delete',
      onConfirm: async () => {
        try {
          setRefreshing(true);
          
          const accessToken = localStorage.getItem('access_token');
          if (!accessToken) return;
          
          const deletePromises = nonSuperAdminSelectedIds.map(id => 
            axios.delete(`${API_BASE_URL}/employees/${id}/`, {
              headers: { Authorization: `Bearer ${accessToken}` }
            })
          );
          
          await Promise.all(deletePromises);
          
          setSelectedEmployees([]);
          fetchEmployees();
          
          showConfirmation({
            title: 'Employees Deleted Successfully',
            message: `${nonSuperAdminSelectedIds.length} employee(s) have been deleted.`,
            type: 'success',
            confirmText: 'OK',
            onConfirm: () => {},
          });
          
        } catch (err) {
          console.error('Error deleting employees:', err);
          setError('Failed to delete employees. Please try again.');
          setRefreshing(false);
        }
      },
    });
  };

  const handleDeleteSingle = (employee: Employee) => {
    // Check if user is SuperAdmin
    if (employee.user.role === 'SuperAdmin') {
      showConfirmation({
        title: 'Cannot Delete SuperAdmin',
        message: 'SuperAdmin users cannot be deleted.',
        type: 'warning',
        confirmText: 'OK',
        onConfirm: () => {},
      });
      return;
    }
    
    showConfirmation({
      title: 'Delete Employee',
      message: `Are you sure you want to delete ${employee.user.first_name} ${employee.user.last_name}? This action cannot be undone.`,
      type: 'danger',
      confirmText: 'Delete',
      onConfirm: async () => {
        try {
          setRefreshing(true);
          
          const accessToken = localStorage.getItem('access_token');
          
          await axios.delete(`${API_BASE_URL}/employees/${employee.id}/`, {
            headers: { Authorization: `Bearer ${accessToken}` }
          });
          
          // Remove from selected if in selected
          if (selectedEmployees.includes(employee.id)) {
            setSelectedEmployees(prev => prev.filter(id => id !== employee.id));
          }
          
          // Refresh employee data
          fetchEmployees();
          
        } catch (err) {
          console.error('Error deleting employee:', err);
          setError('Failed to delete employee. Please try again.');
          setRefreshing(false);
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
    console.log("Employee added successfully!");
    // Close modal first
    setIsAddModalOpen(false);
    // Refresh the employee list immediately
    fetchEmployees(true);
    showConfirmation({
      title: 'Employee Added Successfully',
      message: 'The new employee has been added to the system.',
      type: 'success',
      confirmText: 'OK',
      onConfirm: () => {
        // No need to fetch again
      },
    });
  };

  const handleEditSuccess = () => {
    // Close modal first
    setIsEditModalOpen(false);
    setSelectedEmployee(null);
    // Refresh the employee list immediately
    fetchEmployees();
    showConfirmation({
      title: 'Employee Updated Successfully',
      message: 'The employee information has been updated.',
      type: 'success',
      confirmText: 'OK',
      onConfirm: () => {
        // No need to fetch again
      },
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-none pb-6">
          <h1 className="text-2xl font-bold text-gray-800">Employees</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your employees information</p>
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
    <div className="flex flex-col h-full">
      <div className="flex-none pb-6">
        <h1 className="text-2xl font-bold mb-6 text-[#153147] px-4 py-2 rounded-md">Employees</h1>

        <div className="flex justify-between items-center mt-8">
          <Button 
            onClick={() => setIsAddModalOpen(true)} 
            className="bg-[#153147] hover:bg-[#1e1b4b]/90 text-white px-4 py-2 rounded-md flex items-center gap-2"
            disabled={refreshing}
          >
            <PlusIcon className="h-5 w-5" />
            Add
          </Button>

          <div className="flex items-center gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search employees..."
                className="w-60 rounded-md border border-gray-300 py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1); // Reset to first page on search
                }}
              />
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            </div>

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
          </div>
        </div>

        {selectedEmployees.length > 0 && (
          <div className="mt-4 bg-blue-50 p-4 rounded-md flex justify-between items-center">
            <span className="text-blue-800 font-medium">{selectedEmployees.length} {selectedEmployees.length === 1 ? 'employee' : 'employees'} selected</span>
            <Button 
              variant="destructive"
              size="sm"
              onClick={handleDeleteSelected}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              <TrashIcon className="h-4 w-4 mr-1" />
              Delete Selected
            </Button>
          </div>
        )}

        <div className="mt-6">
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
              <p>{error}</p>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-24 bg-white">
              <div className="flex flex-col items-center space-y-4">
                <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                <p className="text-gray-500">Loading employees...</p>
              </div>
            </div>
          ) : employees.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 bg-white">
              <div className="text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <h3 className="mt-2 text-lg font-medium text-gray-900">No employees found</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by adding a new employee.</p>
                <div className="mt-6">
                  <Button 
                    onClick={() => setIsAddModalOpen(true)} 
                    className="bg-[#153147] hover:bg-[#1e1b4b]/90 text-white"
                  >
                    <PlusIcon className="mr-2 h-5 w-5" />
                    Add Employee
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead className="bg-[#153147]">
                  <tr>
                    <th scope="col" className="px-2 py-4 text-left text-xs font-medium text-white whitespace-nowrap">
                      <Checkbox
                        checked={selectedEmployees.length === paginatedEmployees.length && paginatedEmployees.length > 0}
                        onCheckedChange={handleSelectAll}
                        className="ml-2"
                      />
                    </th>
                    <th scope="col" className="px-3 py-4 text-left text-xs font-medium text-white whitespace-nowrap">
                      S.No
                    </th>
                    <th scope="col" className="px-3 py-4 text-left text-xs font-medium text-white whitespace-nowrap">
                      Name
                    </th>
                    <th scope="col" className="px-3 py-4 text-left text-xs font-medium text-white whitespace-nowrap">
                      Role
                    </th>
                    <th scope="col" className="px-3 py-4 text-left text-xs font-medium text-white whitespace-nowrap">
                      Gender
                    </th>
                    <th scope="col" className="px-3 py-4 text-left text-xs font-medium text-white whitespace-nowrap">
                      Nationality
                    </th>
                    <th scope="col" className="px-3 py-4 text-left text-xs font-medium text-white whitespace-nowrap">
                      Phone Number
                    </th>
                    <th scope="col" className="px-3 py-4 text-left text-xs font-medium text-white whitespace-nowrap">
                      Email
                    </th>
                    <th scope="col" className="px-3 py-4 text-left text-xs font-medium text-white whitespace-nowrap">
                      Emergency Contact
                    </th>
                    <th scope="col" className="px-3 py-4 text-left text-xs font-medium text-white whitespace-nowrap">
                      Salary
                    </th>
                    <th scope="col" className="px-3 py-4 text-left text-xs font-medium text-white whitespace-nowrap">
                      Branch
                    </th>
                    <th scope="col" className="px-3 py-4 text-center text-xs font-medium text-white whitespace-nowrap">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedEmployees.map((employee, index) => (
                    <tr 
                      key={employee.id} 
                      className={selectedEmployees.includes(employee.id) ? 'bg-indigo-50' : 'hover:bg-gray-50'}
                    >
                      <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-500">
                        <Checkbox 
                          checked={selectedEmployees.includes(employee.id)} 
                          onCheckedChange={() => handleSelectEmployee(employee.id)}
                          className="ml-2"
                        />
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                        {startIndex + index + 1}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          employee.user.role === 'SuperAdmin' ? 'bg-purple-100 text-purple-800' :
                          employee.user.role === 'BranchManager' ? 'bg-blue-100 text-blue-800' :
                          employee.user.role === 'Counsellor' ? 'bg-green-100 text-green-800' :
                          employee.user.role === 'Receptionist' ? 'bg-amber-100 text-amber-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {employee.user.role}
                        </span>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                        {employee.gender || '-'}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                        {employee.nationality || '-'}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                        {employee.contact_number || '-'}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {employee.user.email || '-'}
                        </div>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                        {employee.emergency_contact || '-'}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                        {employee.salary 
                          ? typeof employee.salary === 'number' 
                            ? `$${employee.salary.toFixed(2)}` 
                            : `$${employee.salary}`
                          : '-'}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                        {employee.branch_name || '-'}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-center space-x-2">
                          <Button 
                            onClick={() => handleView(employee)} 
                            variant="ghost" 
                            size="sm" 
                            className="text-xs px-2 py-1 text-gray-600 hover:text-blue-700"
                          >
                            <EyeIcon className="h-4 w-4 mr-1" /> View
                          </Button>
                          <Button 
                            onClick={() => handleEdit(employee)} 
                            variant="ghost" 
                            size="sm" 
                            className="text-xs px-2 py-1 text-gray-600 hover:text-indigo-700"
                          >
                            <PencilIcon className="h-4 w-4 mr-1" /> Edit
                          </Button>
                          {employee.user.role !== 'SuperAdmin' && (
                            <Button 
                              onClick={() => handleDeleteSingle(employee)} 
                              variant="ghost" 
                              size="sm" 
                              className="text-xs px-2 py-1 text-gray-600 hover:text-red-700"
                            >
                              <TrashIcon className="h-4 w-4 mr-1" /> Delete
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination - only show if we have data and multiple pages */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                    <span className="font-medium">{Math.min(startIndex + itemsPerPage, filteredEmployees.length)}</span> of{' '}
                    <span className="font-medium">{filteredEmployees.length}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                        currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <span className="sr-only">Previous</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
                      <button
                        key={pageNumber}
                        onClick={() => setCurrentPage(pageNumber)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === pageNumber
                            ? 'z-10 bg-[#153147] border-[#153147] text-white'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                        currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <span className="sr-only">Next</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <AddEmployeeModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSuccess={handleAddSuccess}
      />

      {selectedEmployee && (
        <>
          <EditEmployeeModal 
            isOpen={isEditModalOpen} 
            onClose={() => setIsEditModalOpen(false)} 
            employee={selectedEmployee}
            onSuccess={handleEditSuccess}
          />
          <ViewEmployeeModal 
            isOpen={isViewModalOpen} 
            onClose={() => setIsViewModalOpen(false)} 
            employee={selectedEmployee}
          />
        </>
      )}

      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={() => setConfirmationModal(prev => ({ ...prev, isOpen: false }))}
        title={confirmationModal.title}
        message={confirmationModal.message}
        onConfirm={() => {
          confirmationModal.onConfirm();
          setConfirmationModal(prev => ({ ...prev, isOpen: false }));
        }}
        type={confirmationModal.type}
        confirmText={confirmationModal.confirmText}
      />
    </div>
  );
};

export default EmployeeList;