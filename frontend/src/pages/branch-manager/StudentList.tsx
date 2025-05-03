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
import AddStudentModal from '../../components/AddStudentModal';
import EditStudentModal from '../../components/EditStudentModal';
import ViewStudentModal from '../../components/ViewStudentModal';
import ConfirmationModal from '../../components/ConfirmationModal';

// Student interface based on the API
interface Student {
  id: number;
  student_id: string;
  branch: number;
  branch_name: string;
  profile_image: string | null;
  resume: string | null;
  age: number;
  gender: string;
  nationality: string;
  language_test: string;
  institution_name: string;
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
  mother_name?: string;
  father_name?: string;
  parent_number?: string;
  comments?: string;
  // Added fields for UI
  name?: string;
  email?: string;
  phone?: string;
  emergencyContact?: string;
  fatherName?: string;
  motherName?: string;
  parentNumber?: string;
  institute?: string;
  language?: string;
  profilePicture?: string | null;
  cv?: string | null;
  degree?: string | null;
}

const StudentList = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();
  
  // UI state variables
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
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
  
  // Format student data for UI
  const formatStudentData = (student: Student): Student => {
    return {
      ...student,
      name: `${student.user.first_name} ${student.user.last_name}`,
      email: student.user.email,
      phone: student.contact_number,
      emergencyContact: student.emergency_contact || '',
      fatherName: student.father_name || '',
      motherName: student.mother_name || '',
      parentNumber: student.parent_number || '',
      institute: student.institution_name,
      language: student.language_test,
      profilePicture: student.profile_image,
      cv: student.resume,
    };
  };

  // Fetch students from API
  const fetchStudents = async (showRefreshing = false) => {
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
      const response = await axios.get(`${API_BASE_URL}/students/`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      
      console.log('API Response:', response.data);
      
      // Handle different response formats
      let studentData: any[] = [];
      if (Array.isArray(response.data)) {
        studentData = response.data;
      } else if (response.data.results && Array.isArray(response.data.results)) {
        studentData = response.data.results;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        studentData = response.data.data;
      }
      
      // Format the student data
      const formattedStudents = studentData.map(formatStudentData);
          
      setStudents(formattedStudents);
      setLoading(false);
      setRefreshing(false);
    } catch (err: any) {
      console.error('Error fetching students:', err);
      setError(err.response?.data?.detail || 'Failed to fetch students. Please try again.');
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

    fetchStudents();
  }, [navigate]);

  // Filtered students based on search
  const filteredStudents = students.filter((student) =>
    Object.values(student).some((value) => 
      value && typeof value === 'string' && 
      value.toLowerCase().includes(searchQuery.toLowerCase())
    ) ||
    (student.user && Object.values(student.user).some((value) => 
      value && typeof value === 'string' && 
      value.toLowerCase().includes(searchQuery.toLowerCase())
    ))
  );

  // Pagination
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedStudents = filteredStudents.slice(startIndex, startIndex + itemsPerPage);
  
  // Table height based on rows
  const getTableHeight = () => {
    if (paginatedStudents.length === 0) return 'h-auto';
    if (paginatedStudents.length === 1) return 'h-[120px]';
    if (paginatedStudents.length === 2) return 'h-[180px]';
    if (paginatedStudents.length === 3) return 'h-[240px]';
    if (paginatedStudents.length === 4) return 'h-[300px]';
    if (paginatedStudents.length === 5) return 'h-[360px]';
    if (paginatedStudents.length <= 8) return 'h-[500px]';
    if (paginatedStudents.length <= 12) return 'h-[620px]';
    return 'h-[680px]';
  };

  const getContainerClass = () => {
    if (students.length === 0) return 'h-full';
    return 'flex-1';
  };

  const handleSelectStudent = (id: number) => {
    setSelectedStudents((prev) => {
      if (prev.includes(id)) {
        return prev.filter((studentId) => studentId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedStudents(filteredStudents.map((student) => student.id));
    } else {
      setSelectedStudents([]);
    }
  };

  const handleExport = () => {
    const exportData = selectedStudents.length > 0
      ? filteredStudents.filter(student => selectedStudents.includes(student.id))
      : filteredStudents;

    // Create CSV content
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Headers
    const headers = [
      "Name", "Email", "Age", "Gender", "Nationality", 
      "Phone", "Emergency Contact", "Father Name", "Mother Name", "Parent Number",
      "Institute", "Language Test"
    ];
    csvContent += headers.join(",") + "\n";
    
    // Data rows
    exportData.forEach(student => {
      const row = [
        `"${student.name || ''}"`,
        `"${student.email || ''}"`,
        `"${student.age || ''}"`,
        `"${student.gender || ''}"`,
        `"${student.nationality || ''}"`,
        `"${student.phone || ''}"`,
        `"${student.emergencyContact || ''}"`,
        `"${student.fatherName || ''}"`,
        `"${student.motherName || ''}"`,
        `"${student.parentNumber || ''}"`,
        `"${student.institute || ''}"`,
        `"${student.language || ''}"`,
      ];
      csvContent += row.join(",") + "\n";
    });
    
    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "students_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteSelected = () => {
    showConfirmation({
      title: 'Delete Selected Students',
      message: `Are you sure you want to delete ${selectedStudents.length} selected student(s)? This action cannot be undone.`,
      type: 'danger',
      confirmText: 'Delete',
      onConfirm: async () => {
        const accessToken = localStorage.getItem('access_token');
        try {
          // Delete each selected student
          for (const id of selectedStudents) {
            await axios.delete(`${API_BASE_URL}/students/${id}/`, {
              headers: { Authorization: `Bearer ${accessToken}` }
            });
          }
          
          // Clear selection and refresh
          setSelectedStudents([]);
          fetchStudents();
          
        } catch (err) {
          console.error('Error deleting students:', err);
          setError('Failed to delete students. Please try again.');
        }
      },
    });
  };

  const handleDeleteSingle = (student: Student) => {
    showConfirmation({
      title: 'Delete Student',
      message: `Are you sure you want to delete ${student.name}? This action cannot be undone.`,
      type: 'danger',
      confirmText: 'Delete',
      onConfirm: async () => {
        const accessToken = localStorage.getItem('access_token');
        try {
          await axios.delete(`${API_BASE_URL}/students/${student.id}/`, {
            headers: { Authorization: `Bearer ${accessToken}` }
          });
          
          fetchStudents();
          
        } catch (err) {
          console.error('Error deleting student:', err);
          setError('Failed to delete student. Please try again.');
        }
      },
    });
  };

  const handleView = (student: Student) => {
    navigate(`/branch-manager/students/view/${student.id}`);
  };

  const handleEdit = (student: Student) => {
    navigate(`/branch-manager/students/edit/${student.id}`);
  };

  const handleAddButton = () => {
    navigate('/branch-manager/students/add');
  };

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-none pb-6">
          <h1 className="text-2xl font-bold text-gray-800">Students</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your students information</p>
        </div>
        
        <div className="flex-1 flex justify-center items-center">
          <div className="bg-white rounded-lg shadow-md p-8 flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1e1b4b] mb-4"></div>
            <div className="text-xl text-gray-600">Loading students...</div>
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
                <a href="/branch-manager/students" className="border-indigo-500 text-indigo-600 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium" aria-current="page">
                  Students
                </a>
                <a href="/branch-manager/employees" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
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
          <h1 className="text-2xl font-bold text-gray-800">Students</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your students information</p>

          <div className="flex justify-between items-center mt-8">
            <Button 
              onClick={handleAddButton} 
              className="bg-[#1e1b4b] hover:bg-[#1e1b4b]/90 text-white px-4 py-2 rounded-md flex items-center gap-2"
              disabled={refreshing}
            >
              <PlusIcon className="h-5 w-5" />
              Add
            </Button>

            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => fetchStudents(true)}
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
                disabled={filteredStudents.length === 0 || refreshing}
                className="flex items-center gap-2 text-gray-700 hover:bg-gray-100"
              >
                <ArrowDownTrayIcon className="h-5 w-5" />
                Export
              </Button>
              <Button 
                onClick={handleDeleteSelected} 
                disabled={selectedStudents.length === 0 || refreshing}
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
                  placeholder="Search students..."
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
              onClick={() => fetchStudents()} 
              className="ml-auto text-sm text-red-700 hover:text-red-900 underline"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Students table */}
        <div className={`h-full bg-white rounded-lg border border-gray-200 overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-200 flex flex-col ${getContainerClass()}`}>
          {students.length === 0 ? (
            <div className="h-full bg-white rounded-lg border border-gray-200 flex items-center justify-center">
              <div className="text-center p-8 max-w-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292V15M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <p className="text-gray-600 mb-4 text-lg">No students found.</p>
                <p className="text-gray-500 mb-6">Start by adding your first student to the system.</p>
                <Button 
                  onClick={handleAddButton} 
                  className="bg-[#1e1b4b] hover:bg-[#1e1b4b]/90"
                >
                  Add Your First Student
                </Button>
              </div>
            </div>
          ) : (
            <div className={`relative flex-1 overflow-hidden ${getTableHeight()}`}>
              <div className="absolute inset-0 overflow-auto">
                <div className="inline-block min-w-full max-w-full">
                  <table className="w-full border-collapse table-auto">
                    <thead className="bg-[#1e1b4b] sticky top-0 z-10 shadow-sm">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-medium text-white first:pl-4 last:pr-4 min-w-[40px] w-10">
                          <Checkbox
                            checked={selectedStudents.length === filteredStudents.length && filteredStudents.length > 0}
                            onCheckedChange={handleSelectAll}
                            aria-label="Select all"
                          />
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-white first:pl-4 last:pr-4 min-w-[60px] w-16">
                          S.No
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-white first:pl-4 last:pr-4 min-w-[160px]">
                          Name
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-white first:pl-4 last:pr-4 min-w-[100px]">
                          Age/Gender
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-white first:pl-4 last:pr-4 min-w-[130px]">
                          Contact
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-white first:pl-4 last:pr-4 min-w-[120px]">
                          Nationality
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-white first:pl-4 last:pr-4 min-w-[150px]">
                          Parents
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-white first:pl-4 last:pr-4 min-w-[120px]">
                          Institute
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-white first:pl-4 last:pr-4 min-w-[100px] w-24">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {paginatedStudents.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="px-6 py-4 text-center text-gray-500">
                            No students found.
                          </td>
                        </tr>
                      ) : (
                        paginatedStudents.map((student, index) => (
                          <tr 
                            key={student.id} 
                            className="hover:bg-gray-50 transition-all duration-200 ease-in-out group relative even:bg-gray-50/30"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Checkbox 
                                checked={selectedStudents.includes(student.id)} 
                                onCheckedChange={() => handleSelectStudent(student.id)}
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {startIndex + index + 1}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {student.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div>
                                <div><span className="font-medium">Age:</span> {student.age}</div>
                                <div><span className="font-medium">Gender:</span> {student.gender}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div>
                                {student.email && <div><span className="font-medium">Email:</span> {student.email}</div>}
                                {student.phone && <div><span className="font-medium">Phone:</span> {student.phone}</div>}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {student.nationality || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div>
                                {student.fatherName && <div><span className="font-medium">Father:</span> {student.fatherName}</div>}
                                {student.motherName && <div><span className="font-medium">Mother:</span> {student.motherName}</div>}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {student.institute || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                              <Button 
                                onClick={() => handleView(student)} 
                                variant="ghost" 
                                size="sm" 
                                className="inline-flex items-center px-2 py-1 text-gray-700 hover:text-indigo-600"
                              >
                                <EyeIcon className="h-4 w-4 mr-1" /> View
                              </Button>
                              <Button 
                                onClick={() => handleEdit(student)} 
                                variant="ghost" 
                                size="sm" 
                                className="inline-flex items-center px-2 py-1 text-gray-700 hover:text-indigo-600"
                              >
                                <PencilIcon className="h-4 w-4 mr-1" /> Edit
                              </Button>
                              <Button 
                                onClick={() => handleDeleteSingle(student)} 
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
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white shadow rounded-lg p-3 border border-gray-200 mt-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
                <span className="font-medium">
                  {Math.min(startIndex + itemsPerPage, filteredStudents.length)}
                </span>{" "}
                of <span className="font-medium">{filteredStudents.length}</span> results
              </div>
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
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(page => {
                    // Show pages around current page and first/last pages
                    return page === 1 || 
                           page === totalPages || 
                           Math.abs(page - currentPage) <= 1 ||
                           (page === 2 && currentPage === 1) ||
                           (page === totalPages - 1 && currentPage === totalPages);
                  })
                  .map((page, index, array) => {
                    // Add ellipsis if there are gaps
                    const prevPage = array[index - 1];
                    const showEllipsisBefore = prevPage && page - prevPage > 1;
                    
                    return (
                      <React.Fragment key={page}>
                        {showEllipsisBefore && (
                          <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 focus:outline-offset-0">
                            ...
                          </span>
                        )}
                        <Button
                          onClick={() => setCurrentPage(page)}
                          variant={currentPage === page ? "default" : "outline"}
                          className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold focus:z-20 
                            ${currentPage === page
                              ? "z-10 bg-indigo-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                              : "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0"
                            }`}
                        >
                          {page}
                        </Button>
                      </React.Fragment>
                    );
                  })}
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
        )}
      </div>

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

export default StudentList; 