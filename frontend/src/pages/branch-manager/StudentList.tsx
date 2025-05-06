import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  MagnifyingGlassIcon, 
  PlusIcon, 
  TrashIcon, 
  EyeIcon, 
  PencilIcon 
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
    // Format student data to match the ViewStudentModal component's expected props
    const formattedStudent = formatStudentData(student);
    setSelectedStudent(formattedStudent);
    setIsViewModalOpen(true);
  };

  const handleEdit = (student: Student) => {
    setSelectedStudent(student);
    setIsEditModalOpen(true);
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

  const handleDeleteSingle = (student: Student) => {
    showConfirmation({
      title: 'Delete Student',
      message: `Are you sure you want to delete this student? This action cannot be undone.`,
      type: 'danger',
      confirmText: 'Delete',
      onConfirm: async () => {
        const accessToken = localStorage.getItem('access_token');
        try {
          await axios.delete(`${API_BASE_URL}/students/${student.id}/`, {
            headers: { Authorization: `Bearer ${accessToken}` }
          });
          
          showConfirmation({
            title: 'Student Deleted Successfully',
            message: 'The student has been deleted.',
            type: 'success',
            confirmText: 'OK',
            onConfirm: () => {
              fetchStudents();
            },
          });
          
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

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Students</h1>
        <div className="flex gap-4">
          <Button
            onClick={handleAdd}
            className="flex items-center gap-2"
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
      </div>

      <div className="bg-[#153147]  rounded-lg shadow overflow-hidden">
        <DataTable
          columns={columns}
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
      <AddStudentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          setIsAddModalOpen(false);
          fetchStudents(true);
        }}
        hideBranch={true}
        initialData={selectedStudent}
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