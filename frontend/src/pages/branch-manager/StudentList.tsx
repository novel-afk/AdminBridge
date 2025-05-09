import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  MagnifyingGlassIcon, 
  PlusIcon, 
  TrashIcon, 
  EyeIcon, 
  PencilIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { DataTable } from '../../components/DataTable';
import AddStudentModal from '../../components/AddStudentModal';
import EditStudentModal from '../../components/EditStudentModal';
import ViewStudentModal from '../../components/ViewStudentModal';
import ConfirmationModal from '../../components/ConfirmationModal';
import type { ReactElement } from 'react';
import type { Student } from '../../components/types';
import { toast } from 'react-toastify';

// Column interface for DataTable
interface Column {
  header: string;
  accessor: string;
  render?: (student: Student) => ReactElement;
}

const API_BASE_URL = 'http://localhost:8000/api';

const StudentList = (): ReactElement => {
  const [students, setStudents] = useState<FormattedStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [branchId, setBranchId] = useState<number | null>(null);
  const navigate = useNavigate();
  
  // UI state variables
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  
  // Get branch manager's branch ID
  useEffect(() => {
    const fetchBranchManagerDetails = async () => {
      try {
        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) {
          navigate('/login');
          return;
        }

        const response = await axios.get(`${API_BASE_URL}/users/me/`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });

        if (response.data.branch) {
          setBranchId(response.data.branch);
        }
      } catch (err) {
        console.error('Error fetching branch manager details:', err);
      }
    };

    fetchBranchManagerDetails();
  }, [navigate]);
  
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
  
  interface FormattedStudent extends Student {
    fullName: string;
    email: string;
    name: string;
    phone: string;
    emergencyContact: string;
    fatherName: string;
    motherName: string;
    parentNumber: string;
    institute: string;
    language: string;
    profilePicture: string | null;
    cv: string | null;
  }

  // Format student data for UI
  const formatStudentData = (student: Student): FormattedStudent => {
    return {
      ...student,
      fullName: `${student.user?.first_name || ''} ${student.user?.last_name || ''}`.trim(),
      email: student.user?.email || '',
      contact_number: student.contact_number || '',
      gender: student.gender || '',
      nationality: student.nationality || '',
      institution_name: student.institution_name || '',
      language_test: student.language_test || '',
      // Add these mappings to match the ViewStudentModal component's expected props
      name: `${student.user?.first_name || ''} ${student.user?.last_name || ''}`.trim(),
      phone: student.contact_number || '',
      emergencyContact: student.emergency_contact || '',
      fatherName: student.father_name || '',
      motherName: student.mother_name || '',
      parentNumber: student.parent_number || '',
      institute: student.institution_name || '',
      language: student.language_test || '',
      profilePicture: student.profile_image || null,
      cv: student.resume || null
    };
  };

  // Fetch students data
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

      const response = await axios.get(`${API_BASE_URL}/students/`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      const formattedData = response.data.map(formatStudentData);
      setStudents(formattedData);
      setError('');
    } catch (err) {
      setError('Failed to fetch students');
      console.error('Error fetching students:', err);
    } finally {
      setLoading(false);
      if (showRefreshing) setRefreshing(false);
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

  const handleView = (student: Student) => {
    setSelectedStudent(formatStudentData(student));
    setIsViewModalOpen(true);
    setIsEditModalOpen(false);
  };

  const handleEdit = (student: Student) => {
    setSelectedStudent(student);
    setIsEditModalOpen(true);
    setIsViewModalOpen(false);
  };

  const handleEditSuccess = () => {
    setIsEditModalOpen(false);
    setSelectedStudent(null);
    // Refresh the student list immediately
    fetchStudents(true);
    toast.success('Student updated successfully');
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
          fetchStudents(true);
          toast.success('Student deleted successfully');
        } catch (err) {
          console.error('Error deleting student:', err);
          setError('Failed to delete student. Please try again.');
        }
      },
    });
  };

  const handleAdd = () => {
    // Pre-set the branch ID when adding a new student
    if (branchId) {
      setSelectedStudent({ branch: branchId } as Student);
    }
    setIsAddModalOpen(true);
  };

  const handleAddSuccess = () => {
    setIsAddModalOpen(false);
    // Fetch students immediately to refresh the list
    fetchStudents(true);
    showConfirmation({
      title: 'Student Added Successfully',
      message: 'The new student has been added to the system.',
      type: 'success',
      confirmText: 'OK',
      onConfirm: () => {
        // No need to fetch again
      }
    });
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
      setSelectedStudents(students.map((student) => student.id));
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
        const exportData = selectedStudents.length > 0
          ? students.filter(student => selectedStudents.includes(student.id))
          : students;

        let csvContent = "data:text/csv;charset=utf-8,";
        const headers = [
          "Student ID", "Name", "Email", "Phone", "Gender", 
          "Nationality", "Institution", "Language Test", "Branch"
        ];
        csvContent += headers.join(",") + "\n";
        exportData.forEach(student => {
          const row = [
            `"${student.student_id || ''}"`,
            `"${student.fullName || ''}"`,
            `"${student.email || ''}"`,
            `"${student.contact_number || ''}"`,
            `"${student.gender || ''}"`,
            `"${student.nationality || ''}"`,
            `"${student.institution_name || ''}"`,
            `"${student.language_test || ''}"`,
            `"${student.branch_name || ''}"`,
          ];
          csvContent += row.join(",") + "\n";
        });
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "students_export.csv");
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
          // Use the new bulk delete endpoint
          await axios.post(`${API_BASE_URL}/students/bulk-delete/`, 
            { ids: selectedStudents },
            { headers: { Authorization: `Bearer ${accessToken}` } }
          );
          // Clear selection and refresh data
          setSelectedStudents([]);
          fetchStudents(true);
          toast.success('Student(s) deleted successfully');
        } catch (err: any) {
          console.error('Error deleting students:', err);
          showConfirmation({
            title: 'Error',
            message: err.response?.data?.detail || 'Failed to delete students. Please try again.',
            type: 'danger',
            confirmText: 'OK',
            onConfirm: () => {},
          });
        }
      },
    });
  };

  const columns: Column[] = [
    { header: 'Student ID', accessor: 'student_id' },
    { header: 'Name', accessor: 'fullName' },
    { header: 'Email', accessor: 'email' },
    { header: 'Phone', accessor: 'contact_number' },
    { header: 'Gender', accessor: 'gender' },
    { header: 'Nationality', accessor: 'nationality' },
    { header: 'Institution', accessor: 'institution_name' },
    { header: 'Language Test', accessor: 'language_test' },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (student: Student) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleView(student)}
            className="p-0"
          >
            <EyeIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(student)}
            className="p-0"
          >
            <PencilIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDeleteSingle(student)}
            className="p-0 text-red-600 hover:text-red-800"
          >
            <TrashIcon className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

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
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Students</h1>
        <div className="flex gap-4">
          <Button
            onClick={handleAdd}
            className="flex items-center gap-2 bg-[#153147]"
          >
            <PlusIcon className="h-5 w-5" />
            Add Student
          </Button>
        </div>
      </div>

      <div className="mb-4 flex gap-4">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <Input
            type="text"
            placeholder="Search students..."
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button
          onClick={() => fetchStudents(true)}
          variant="outline"
          className="flex items-center gap-2"
          disabled={refreshing}
        >
          Refresh
        </Button>
        <Button 
          variant="outline" 
          onClick={handleExport} 
          disabled={students.length === 0 || refreshing}
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
      </div>

      <div className="bg-[#153147] rounded-lg shadow overflow-hidden">
        <DataTable
          columns={[
            {
              header: '',
              accessor: 'select',
              render: (student: Student) => (
                <input
                  type="checkbox"
                  checked={selectedStudents.includes(student.id)}
                  onChange={() => handleSelectStudent(student.id)}
                  className="h-4 w-4 text-[#153147] focus:ring-[#153147] border-gray-300 rounded"
                />
              )
            },
            ...columns
          ]}
          data={students.filter(student => {
            const searchTerms = searchQuery.toLowerCase().split(' ');
            const studentData = [
              student.fullName,
              student.email,
              student.contact_number,
              student.student_id,
              student.gender,
              student.nationality,
              student.institution_name,
              student.language_test
            ].map(field => (field || '').toLowerCase());

            return searchTerms.every(term =>
              studentData.some(field => field.includes(term))
            );
          })}
          isLoading={loading}
          error={error}
        />
      </div>

      <ViewStudentModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedStudent(null);
        }}
        student={selectedStudent}
      />
      {isEditModalOpen && (
        <EditStudentModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedStudent(null);
          }}
          student={selectedStudent}
          onSuccess={handleEditSuccess}
          hideBranch={true}
        />
      )}
      {/* Add Student Modal */}
      {isAddModalOpen && (
        <AddStudentModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={handleAddSuccess}
          hideBranch={true}
          initialData={selectedStudent}
        />
      )}
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