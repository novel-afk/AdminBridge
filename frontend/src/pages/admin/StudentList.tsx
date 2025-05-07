import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
import { Checkbox } from '@radix-ui/react-checkbox';
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
    name: string;
  };
  contact_number: string;
  address: string;
  emergency_contact: string | undefined;
  mother_name: string | undefined;
  father_name: string | undefined;
  parent_number: string | undefined;
  comments: string | undefined;
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
  const location = useLocation();
  
  // New state variables for the enhanced UI
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
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

  useEffect(() => {
    setIsAddModalOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (isAddModalOpen) {
      console.log('DEBUG: isAddModalOpen set to true');
    }
  }, [isAddModalOpen]);

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
        // Create CSV content
        const headers = [
          "ID", 
          "Student ID", 
          "First Name", 
          "Last Name", 
          "Email", 
          "Phone", 
          "Gender", 
          "Nationality", 
          "DOB", 
          "Age",
          "Address", 
          "Emergency Contact", 
          "Father's Name", 
          "Mother's Name", 
          "Parent Number", 
          "Institution", 
          "Language Test", 
          "Branch", 
          "Comments"
        ];
        const csvRows = [];
        csvRows.push(headers.join(','));
        for (const student of filteredStudents) {
          const row = [
            student.id,
            `"${student.student_id || ''}"`,
            `"${student.user.first_name || ''}"`,
            `"${student.user.last_name || ''}"`,
            `"${student.user.email || ''}"`,
            `"${student.contact_number || ''}"`,
            `"${student.gender || ''}"`,
            `"${student.nationality || ''}"`,
            `"${student.dob || ''}"`,
            student.age || '',
            `"${student.address?.replace(/"/g, '""') || ''}"`,
            `"${student.emergency_contact || ''}"`,
            `"${student.father_name || ''}"`,
            `"${student.mother_name || ''}"`,
            `"${student.parent_number || ''}"`,
            `"${student.institution_name || ''}"`,
            `"${student.language_test || ''}"`,
            `"${student.branch_name || ''}"`,
            `"${student.comments?.replace(/"/g, '""') || ''}"`,
          ];
          csvRows.push(row.join(','));
        }
        const csvContent = csvRows.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `students_export_${new Date().toISOString().slice(0,10)}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
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
    // Close modal first
    setIsAddModalOpen(false);
    // Refresh the student list immediately
    fetchStudents(true);
    showConfirmation({
      title: 'Student Added Successfully',
      message: 'The new student has been added to the system.',
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
    setSelectedStudent(null);
    // Refresh the student list immediately
    fetchStudents();
    showConfirmation({
      title: 'Student Updated Successfully',
      message: 'The student information has been updated.',
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
          <h1 className="text-2xl font-bold text-[#153147]">Students</h1>
          <p className="text-sm text-[#ADB8BB] mt-1">Manage your students information</p>
        </div>
        
        <div className="flex-1 flex justify-center items-center">
          <div className="border-white hover:border-white/80 rounded-lg shadow-md p-8 flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1e1b4b] mb-4"></div>
            <div className="text-xl text-[#153147]">Loading students...</div>
            <p className="text-sm text-[#ADB8BB] mt-2">Please wait while we fetch the data</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-none pb-6">
        <h1 className="text-2xl font-bold mb-6 text-[#153147]  px-4 py-2 rounded-md">Students</h1>

        <div className="flex justify-between items-center mt-8">
          <Button 
            onClick={() => setIsAddModalOpen(true)} 
            className="bg-[#153147] hover:bg-[#153147]/90 text-white px-4 py-2 rounded-md flex items-center gap-2"
            disabled={refreshing}
          >
            <PlusIcon className="h-5 w-5" />
            Add Students
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
                className="pl-10 w-[300px] bg-white rounded-md border-[#EDEAE4] focus:border-[#153147] focus:ring-1 focus:ring-[#153147] transition-all duration-200"
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
          <div className="h-full bg-white rounded-lg border border-[#EDEAE4] flex items-center justify-center">
            <div className="text-center p-8 max-w-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292V15M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <p className="text-[#232A2F] mb-4 text-lg">No students found.</p>
              <p className="text-[#ADB8BB] mb-6">Start by adding your first student to the system.</p>
              <Button 
                onClick={() => setIsAddModalOpen(true)} 
                className="bg-[#153147] hover:bg-[#153147]/90"
              >
                Add Your First Student
              </Button>
            </div>
          </div>
        ) : (
          <div className="h-full bg-white rounded-lg border border-[#EDEAE4] shadow-lg hover:shadow-xl transition-shadow duration-200 flex flex-col overflow-hidden">
            <div className={`relative flex-1 overflow-hidden ${getTableHeight()}`}>
              <div className="absolute inset-0 overflow-auto">
                <div className="inline-block min-w-full max-w-full">
                  <table className="w-full border-collapse table-auto">
                    <thead className="bg-[#153147] sticky top-0 z-10 shadow-sm">
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
                                className="text-[#153147] hover:text-[#153147]/80 transition-colors p-1 hover:bg-green-50 rounded-full"
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
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                      <span className="font-medium">{Math.min(startIndex + itemsPerPage, filteredStudents.length)}</span> of{' '}
                      <span className="font-medium">{filteredStudents.length}</span> results
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
        )}
      </div>
      
      {isAddModalOpen && (console.log('DEBUG: Rendering AddStudentModal'),
        <AddStudentModal 
          isOpen={isAddModalOpen} 
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={handleAddSuccess}
        />
      )}
      
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