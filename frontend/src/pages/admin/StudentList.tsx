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
import AddStudentModal from '../../components/AddStudentModal';
import EditStudentModal from '../../components/EditStudentModal';
import ViewStudentModal from '../../components/ViewStudentModal';
import ConfirmationModal from '../../components/ConfirmationModal';

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
  // Adding fields for the UI component matching
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

const columns = [
  { key: "select", label: "" },
  { key: "sNo", label: "S.No" },
  { key: "name", label: "Name" },
  { key: "age", label: "Age" },
  { key: "gender", label: "Gender" },
  { key: "nationality", label: "Nationality" },
  { key: "phone", label: "Phone Number" },
  { key: "email", label: "Email" },
  { key: "emergencyContact", label: "Emergency Contact" },
  { key: "fatherName", label: "Father Name" },
  { key: "motherName", label: "Mother Name" },
  { key: "parentNumber", label: "Parent Number" },
  { key: "actions", label: "Actions" },
];

const StudentList = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();
  
  // New state variables for the enhanced UI
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  
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
  
  // Format student data for component compatibility
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

  // Function to fetch students from API
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
      
      // Make API call to backend
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
      
      // Format the student data to match our UI component structure
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

  // Filtered students based on search query
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

  // Calculate pagination
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedStudents = filteredStudents.slice(startIndex, startIndex + itemsPerPage);
  
  // Determine dynamic table height based on number of rows
  const getTableHeight = () => {
    if (paginatedStudents.length === 0) return 'h-auto';
    if (paginatedStudents.length === 1) return 'h-[120px]';
    if (paginatedStudents.length === 2) return 'h-[180px]';
    if (paginatedStudents.length === 3) return 'h-[240px]';
    if (paginatedStudents.length === 4) return 'h-[300px]';
    if (paginatedStudents.length === 5) return 'h-[360px]';
    if (paginatedStudents.length <= 8) return 'h-[500px]';
    if (paginatedStudents.length <= 12) return 'h-[620px]';
    return 'h-[680px]'; // Fixed height for 13-15 items
  };

  // Calculate container size based on content
  const getContainerClass = () => {
    if (students.length === 0) return 'h-full';
    return 'flex-1';  // Always use flex-1 for non-empty lists for better layout
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
      setSelectedStudents(paginatedStudents.map((student) => student.id));
    } else {
      setSelectedStudents([]);
    }
  };

  const handleExport = () => {
    showConfirmation({
      title: 'Export Students Data',
      message: 'Are you sure you want to export the students data?',
      type: 'warning',
      onConfirm: () => {
        console.log("Exporting data...");
        // Add your export logic here
      },
    });
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
          
          // Clear selection and refresh data
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
      message: `Are you sure you want to delete ${student.name || student.user.first_name + ' ' + student.user.last_name}? This action cannot be undone.`,
      type: 'danger',
      confirmText: 'Delete',
      onConfirm: async () => {
        const accessToken = localStorage.getItem('access_token');
        try {
          await axios.delete(`${API_BASE_URL}/students/${student.id}/`, {
            headers: { Authorization: `Bearer ${accessToken}` }
          });
          
          // Refresh data after deletion
          fetchStudents();
          
        } catch (err) {
          console.error('Error deleting student:', err);
          setError('Failed to delete student. Please try again.');
        }
      },
    });
  };

  const handleView = (student: Student) => {
    setSelectedStudent(student);
    setIsViewModalOpen(true);
  };

  const handleEdit = (student: Student) => {
    setSelectedStudent(student);
    setIsEditModalOpen(true);
  };

  const handleAddSuccess = () => {
    console.log("Student added successfully!");
    showConfirmation({
      title: 'Student Added Successfully',
      message: 'The new student has been added to the system.',
      type: 'success',
      confirmText: 'OK',
      onConfirm: () => {
        setIsAddModalOpen(false);
        // Refresh the student list
        fetchStudents(true);
      },
    });
  };

  const handleEditSuccess = () => {
    showConfirmation({
      title: 'Student Updated Successfully',
      message: 'The student information has been updated.',
      type: 'success',
      confirmText: 'OK',
      onConfirm: () => {
        setIsEditModalOpen(false);
        setSelectedStudent(null);
        // Refresh the student list
        fetchStudents();
      },
    });
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
    <div className="flex flex-col h-full">
      <div className="flex-none pb-6">
        <h1 className="text-2xl font-bold text-gray-800">Students</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your students information</p>

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

      <div className={`flex-1 flex flex-col ${getContainerClass()}`}>
        {students.length === 0 ? (
          <div className="h-full bg-white rounded-lg border border-gray-200 flex items-center justify-center">
            <div className="text-center p-8 max-w-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292V15M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <p className="text-gray-600 mb-4 text-lg">No students found.</p>
              <p className="text-gray-500 mb-6">Start by adding your first student to the system.</p>
              <Button 
                onClick={() => setIsAddModalOpen(true)} 
                className="bg-[#1e1b4b] hover:bg-[#1e1b4b]/90"
              >
                Add Your First Student
              </Button>
            </div>
          </div>
        ) : (
          <div className={`h-full bg-white rounded-lg border border-gray-200 overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-200 flex flex-col`}>
            <div className={`relative flex-1 overflow-hidden ${getTableHeight()}`}>
              <div className="absolute inset-0 overflow-auto">
                <div className="inline-block min-w-full max-w-full">
                  <table className="w-full border-collapse table-auto">
                    <thead className="bg-[#1e1b4b] sticky top-0 z-10 shadow-sm">
                      <tr>
                        {columns.map((column) => (
                          <th
                            key={column.key}
                            scope="col"
                            className={`px-6 py-4 text-left text-sm font-medium text-white first:pl-4 last:pr-4 
                            ${column.key === "select" ? "min-w-[40px] w-10" : 
                              column.key === "sNo" ? "min-w-[60px] w-16" :
                              column.key === "name" ? "min-w-[160px]" :
                              column.key === "age" ? "min-w-[60px] w-16" :
                              column.key === "gender" ? "min-w-[100px]" :
                              column.key === "nationality" ? "min-w-[120px]" :
                              column.key === "phone" ? "min-w-[130px]" :
                              column.key === "email" ? "min-w-[180px]" :
                              column.key === "emergencyContact" ? "min-w-[160px]" :
                              column.key === "fatherName" ? "min-w-[150px]" :
                              column.key === "motherName" ? "min-w-[150px]" :
                              column.key === "parentNumber" ? "min-w-[130px]" :
                              column.key === "actions" ? "min-w-[100px] w-24" : ""
                            }`}
                            style={{ position: 'sticky', top: 0 }}
                          >
                            {column.key === "select" ? (
                              <Checkbox
                                checked={paginatedStudents.length > 0 && selectedStudents.length === paginatedStudents.length}
                                onCheckedChange={handleSelectAll}
                                aria-label="Select all"
                              />
                            ) : (
                              column.label
                            )}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className={`divide-y divide-gray-100`}>
                      {paginatedStudents.map((student, index) => (
                        <tr 
                          key={student.id} 
                          className="hover:bg-gray-50 transition-all duration-200 ease-in-out group relative even:bg-gray-50/30"
                        >
                          <td className="px-6 py-4 whitespace-nowrap first:pl-4 group-hover:bg-gray-50 transition-colors duration-200">
                            <Checkbox
                              checked={selectedStudents.includes(student.id)}
                              onCheckedChange={() => handleSelectStudent(student.id)}
                              aria-label={`Select ${student.user.first_name}`}
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 group-hover:bg-gray-50 transition-colors duration-200">
                            {startIndex + index + 1}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 font-medium group-hover:bg-gray-50 transition-colors duration-200 truncate max-w-[200px]" title={`${student.user.first_name} ${student.user.last_name}`}>
                            {student.user.first_name} {student.user.last_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 group-hover:bg-gray-50 transition-colors duration-200">
                            {student.age}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap group-hover:bg-gray-50 transition-colors duration-200">
                            <Badge 
                              variant={student.gender === "Male" ? "default" : "secondary"}
                              className={`${
                                student.gender === "Male" 
                                  ? "bg-blue-100 text-blue-800 group-hover:bg-blue-200" 
                                  : "bg-purple-100 text-purple-800 group-hover:bg-purple-200"
                              } px-3 py-1 rounded-full text-xs font-medium transition-colors duration-200`}
                            >
                              {student.gender}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 group-hover:bg-gray-50 transition-colors duration-200 truncate max-w-[150px]" title={student.nationality}>
                            {student.nationality}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 group-hover:bg-gray-50 transition-colors duration-200">
                            {student.contact_number}
                          </td>
                          <td className="px-6 py-4 text-sm group-hover:bg-gray-50 transition-colors duration-200 truncate max-w-[200px]" title={student.user.email}>
                            <a href={`mailto:${student.user.email}`} className="text-blue-600 hover:text-blue-800 transition-colors truncate inline-block max-w-full">
                              {student.user.email}
                            </a>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 group-hover:bg-gray-50 transition-colors duration-200 truncate max-w-[180px]" title={student.emergency_contact || "-"}>
                            {student.emergency_contact || "-"}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 group-hover:bg-gray-50 transition-colors duration-200 truncate max-w-[180px]" title={student.father_name || "-"}>
                            {student.father_name || "-"}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 group-hover:bg-gray-50 transition-colors duration-200 truncate max-w-[180px]" title={student.mother_name || "-"}>
                            {student.mother_name || "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 group-hover:bg-gray-50 transition-colors duration-200">
                            {student.parent_number || "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 last:pr-4 group-hover:bg-gray-50 transition-colors duration-200">
                            <div className="flex items-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity duration-200">
                              <button
                                onClick={() => handleView(student)}
                                className="text-blue-600 hover:text-blue-800 transition-colors p-1 hover:bg-blue-50 rounded-full"
                                title="View"
                                disabled={refreshing}
                              >
                                <EyeIcon className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => handleEdit(student)}
                                className="text-green-600 hover:text-green-800 transition-colors p-1 hover:bg-green-50 rounded-full"
                                title="Edit"
                                disabled={refreshing}
                              >
                                <PencilIcon className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => handleDeleteSingle(student)}
                                className="text-red-600 hover:text-red-800 transition-colors p-1 hover:bg-red-50 rounded-full"
                                title="Delete"
                                disabled={refreshing}
                              >
                                <TrashIcon className="h-5 w-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            {totalPages > 1 && (
              <div className="flex-shrink-0 border-t border-gray-200 px-6 py-4 flex items-center justify-between shadow-md bg-white">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed rounded border border-gray-200 hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  {totalPages > 5 && currentPage > 3 && (
                    <>
                      <button
                        onClick={() => setCurrentPage(1)}
                        className="px-3 py-1.5 rounded-md text-sm font-medium text-gray-600 hover:text-gray-800 border border-gray-200 hover:bg-gray-50"
                      >
                        1
                      </button>
                      <span className="text-gray-500">...</span>
                    </>
                  )}
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return pageNum;
                  }).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium border ${
                        currentPage === page
                          ? 'bg-[#1e1b4b] text-white border-[#1e1b4b]'
                          : 'text-gray-600 hover:text-gray-800 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <>
                      <span className="text-gray-500">...</span>
                      <button
                        onClick={() => setCurrentPage(totalPages)}
                        className="px-3 py-1.5 rounded-md text-sm font-medium text-gray-600 hover:text-gray-800 border border-gray-200 hover:bg-gray-50"
                      >
                        {totalPages}
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed rounded border border-gray-200 hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
                <div className="text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-md border border-gray-200">
                  Showing {Math.min(filteredStudents.length, startIndex + 1)}-
                  {Math.min(startIndex + itemsPerPage, filteredStudents.length)} of {filteredStudents.length} students
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      <AddStudentModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleAddSuccess}
      />
      
      <EditStudentModal 
        isOpen={isEditModalOpen} 
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedStudent(null);
        }}
        onSuccess={handleEditSuccess}
        student={selectedStudent}
      />
      
      <ViewStudentModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedStudent(null);
        }}
        student={selectedStudent}
      />
      
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={() => setConfirmationModal({ ...confirmationModal, isOpen: false })}
        title={confirmationModal.title}
        message={confirmationModal.message}
        onConfirm={confirmationModal.onConfirm}
        type={confirmationModal.type}
        confirmText={confirmationModal.confirmText}
      />
    </div>
  );
};

export default StudentList; 