import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { UserIcon, PencilSquareIcon, EyeIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../lib/AuthContext';

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
}

const CounsellorStudentList = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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

    fetchStudents();
  }, [user]);

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
        <Link 
          to="/counsellor/add-student" 
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors duration-300 flex items-center"
        >
          <UserIcon className="w-5 h-5 mr-2" />
          Add Student
        </Link>
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
                    <Link 
                      to={`/counsellor/students/view/${student.id}`} 
                      className="text-blue-600 hover:text-blue-900"
                      title="View"
                    >
                      <EyeIcon className="w-5 h-5" />
                    </Link>
                    <Link 
                      to={`/counsellor/edit-student/${student.id}`} 
                      className="text-indigo-600 hover:text-indigo-900"
                      title="Edit"
                    >
                      <PencilSquareIcon className="w-5 h-5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CounsellorStudentList; 