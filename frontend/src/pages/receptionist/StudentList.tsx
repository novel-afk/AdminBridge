import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { EyeIcon, PlusIcon } from '@heroicons/react/24/outline';
import AddStudentModal from '../../components/AddStudentModal';
import ViewStudentModal from '../../components/ViewStudentModal';
import { toast } from 'react-toastify';

interface Student {
  id: number;
  user: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
  student_id: string;
  institution_name: string;
  contact_number: string;
  nationality: string;
  enrollment_date: string;
}

const ReceptionistStudentList = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const location = useLocation();

  const fetchStudents = async () => {
    try {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        setError('You are not authenticated');
        setLoading(false);
        return;
      }

      const response = await axios.get('http://localhost:8000/api/students/', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      setStudents(response.data);
      setLoading(false);
    } catch (err: any) {
      console.error('Error fetching students:', err);
      setError(err.response?.data?.detail || 'Failed to fetch students');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Ensure modal is always closed on navigation to this page
  useEffect(() => {
    setIsAddModalOpen(false);
  }, [location]);

  const handleAddSuccess = () => {
    setIsAddModalOpen(false);
    fetchStudents();
    toast.success('Student added successfully');
  };

  const handleViewStudent = async (id: number) => {
    try {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        setError('You are not authenticated');
        return;
      }
      const response = await axios.get(`http://localhost:8000/api/students/${id}/`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const s = response.data;
      setSelectedStudent({
        name: `${s.user.first_name} ${s.user.last_name}`,
        profilePicture: s.profile_image,
        age: s.age,
        gender: s.gender,
        nationality: s.nationality,
        phone: s.contact_number,
        email: s.user.email,
        emergencyContact: s.emergency_contact,
        fatherName: s.father_name,
        motherName: s.mother_name,
        parentNumber: s.parent_number,
        institute: s.institution_name,
        language: s.language_test,
        cv: s.resume,
      });
      setIsViewModalOpen(true);
    } catch (err) {
      setError('Failed to load student details');
    }
  };

  const handleAddClick = () => {
    setIsAddModalOpen(true);
  };

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

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="p-6 border-b flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Branch Students</h1>
          <p className="text-gray-500 mt-1">View students enrolled in your branch</p>
        </div>
        <button
          onClick={handleAddClick}
          className="flex items-center px-4 py-2 bg-[#153147] text-white rounded-md hover:bg-[#153147]/90 transition-colors duration-300"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Add Student
        </button>
      </div>

      {students.length === 0 ? (
        <div className="p-6 text-center text-gray-500">
          No students found in your branch
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-[#153147]">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white  uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Email
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Institution
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Contact
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {student.student_id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.user.first_name} {student.user.last_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.institution_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.contact_number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2 flex">
                    <button
                      onClick={() => handleViewStudent(student.id)}
                      className="text-blue-600 hover:text-blue-900 focus:outline-none focus:underline"
                      title="View"
                    >
                      <EyeIcon className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Student Modal */}
      {isAddModalOpen && (
        <AddStudentModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={handleAddSuccess}
          hideBranch={true}
        />
      )}
      <ViewStudentModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedStudent(null);
        }}
        student={selectedStudent}
      />
    </div>
  );
};

export default ReceptionistStudentList; 