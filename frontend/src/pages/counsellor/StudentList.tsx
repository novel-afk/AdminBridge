import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { UserIcon, PencilSquareIcon, EyeIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../lib/AuthContext';
import AddStudentModal from '../../components/counsellor/AddStudentModal';
import ViewStudentModal from '../../components/ViewStudentModal';
import EditStudentModal from '../../components/EditStudentModal';
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
  branch: number;
  age: number;
  gender: string;
  emergency_contact: string;
  father_name: string;
  mother_name: string;
  parent_number: string;
  language_test: string;
  profile_image: string | null;
  resume: string | null;
}

const CounsellorStudentList = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editStudent, setEditStudent] = useState<Student | null>(null);

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

      // Filter students by branch if the counsellor has a branch
      const filteredStudents = user?.branch 
        ? response.data.filter((student: Student) => student.branch === user.branch)
        : response.data;

      setStudents(filteredStudents);
      setLoading(false);
    } catch (err: any) {
      console.error('Error fetching students:', err);
      setError(err.response?.data?.detail || 'Failed to fetch students');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [user]);

  const handleAddSuccess = () => {
    // Refresh the student list after adding a new student
    fetchStudents();
    toast.success('Student added successfully');
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
      <div className="flex justify-between items-center p-6 border-b">
        <h1 className="text-2xl font-semibold text-gray-800">Student Management</h1>
        <button 
          onClick={() => setIsAddModalOpen(true)} 
          className="bg-[#153147] hover:bg-[#153147]/90 text-white py-2 px-4 rounded-md transition-colors duration-300 flex items-center"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Add Student
        </button>
      </div>

      {students.length === 0 ? (
        <div className="p-6 text-center text-gray-500">
          <div className="py-8">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <UserIcon className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No students found</h3>
            <p className="text-gray-500 mb-6">No students have been added to your branch yet.</p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#153147] hover:bg-[#153147]/90"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              Add Your First Student
            </button>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-[#153147]">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
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
                      onClick={() => {
                        // Map the student object to the shape expected by ViewStudentModal
                        const mappedStudent = {
                          name: student.user.first_name + ' ' + student.user.last_name,
                          age: student.age,
                          gender: student.gender,
                          nationality: student.nationality,
                          phone: student.contact_number,
                          email: student.user.email,
                          emergencyContact: student.emergency_contact || '',
                          fatherName: student.father_name || '',
                          motherName: student.mother_name || '',
                          parentNumber: student.parent_number || '',
                          institute: student.institution_name || '',
                          language: student.language_test || '',
                          profilePicture: student.profile_image || '',
                          cv: student.resume || '',
                        };
                        setSelectedStudent(mappedStudent);
                        setIsViewModalOpen(true);
                      }}
                      className="text-blue-600 hover:text-blue-900"
                      title="View"
                    >
                      <EyeIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => {
                        setEditStudent(student);
                        setIsEditModalOpen(true);
                      }}
                      className="text-indigo-600 hover:text-indigo-900"
                      title="Edit"
                    >
                      <PencilSquareIcon className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Student Modal */}
      <AddStudentModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleAddSuccess}
      />

      {/* View Student Modal */}
      {isViewModalOpen && selectedStudent && (
        <ViewStudentModal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          student={selectedStudent}
        />
      )}

      {/* Edit Student Modal */}
      {isEditModalOpen && editStudent && (
        <EditStudentModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={() => {
            setIsEditModalOpen(false);
            toast.success('Student updated successfully');
            fetchStudents();
          }}
          student={editStudent}
        />
      )}
    </div>
  );
};

export default CounsellorStudentList; 