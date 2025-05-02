import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

interface Student {
  id: number;
  user: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    role: string;
  };
  branch: number;
  branch_name: string;
  student_id: string;
  enrollment_date: string;
  age: number;
  gender: string;
  nationality: string;
  dob: string | null;
  contact_number: string;
  address: string;
  emergency_contact: string | null;
  institution_name: string;
  language_test: string;
  father_name: string | null;
  mother_name: string | null;
  parent_number: string | null;
  comments: string | null;
  profile_image: string | null;
  resume: string | null;
}

const ViewStudent = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) {
          navigate('/login');
          return;
        }
        
        const response = await axios.get(`http://localhost:8000/api/students/${id}/`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        
        setStudent(response.data);
      } catch (err) {
        console.error('Error fetching student data:', err);
        setError('Failed to load student details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchStudentData();
  }, [id, navigate]);
  
  const handleEdit = () => {
    navigate(`/admin/students/edit/${id}`);
  };
  
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this student?')) {
      return;
    }
    
    try {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        navigate('/login');
        return;
      }
      
      await axios.delete(`http://localhost:8000/api/students/${id}/`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      
      navigate('/admin/students');
    } catch (err) {
      console.error('Error deleting student:', err);
      setError('Failed to delete student. Please try again later.');
    }
  };
  
  const handleBack = () => {
    navigate('/admin/students');
  };
  
  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-6 flex justify-center items-center">
        <div className="text-xl text-gray-600">Loading student details...</div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Back to Students
          </button>
        </div>
      </div>
    );
  }
  
  if (!student) {
    return (
      <div className="min-h-screen bg-gray-100 p-6 flex justify-center items-center">
        <div className="text-xl text-gray-600">Student not found</div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Student Details</h1>
          <div className="flex space-x-4">
            <button
              onClick={handleEdit}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Delete
            </button>
            <button
              onClick={handleBack}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Back
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6">
            <div className="flex flex-col md:flex-row">
              <div className="md:w-1/3 mb-6 md:mb-0 flex flex-col items-center justify-start">
                {student.profile_image ? (
                  <img
                    src={student.profile_image}
                    alt={`${student.user.first_name}'s profile`}
                    className="w-48 h-48 object-cover rounded-lg shadow-md"
                  />
                ) : (
                  <div className="w-48 h-48 flex-shrink-0 rounded-lg bg-gray-200 flex items-center justify-center text-gray-500 text-6xl font-semibold">
                    {student.user.first_name.charAt(0)}
                  </div>
                )}
                
                <div className="mt-4 text-center">
                  <h2 className="text-xl font-semibold text-gray-800">
                    {student.user.first_name} {student.user.last_name}
                  </h2>
                  <p className="text-gray-600">{student.student_id}</p>
                </div>
                
                {student.resume && (
                  <div className="mt-4">
                    <a
                      href={student.resume}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      View Resume
                    </a>
                  </div>
                )}
              </div>
              
              <div className="md:w-2/3 md:pl-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 pb-2 border-b">
                  Personal Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="text-gray-900">{student.user.email}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-500">Contact Number</p>
                    <p className="text-gray-900">{student.contact_number}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-500">Age/Gender</p>
                    <p className="text-gray-900">{student.age} / {student.gender}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-500">Nationality</p>
                    <p className="text-gray-900">{student.nationality || '-'}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-500">Date of Birth</p>
                    <p className="text-gray-900">{formatDate(student.dob)}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-500">Enrollment Date</p>
                    <p className="text-gray-900">{formatDate(student.enrollment_date)}</p>
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-800 mb-3 pb-2 border-b">
                  Education Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-sm font-medium text-gray-500">School/College Name</p>
                    <p className="text-gray-900">{student.institution_name || '-'}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-500">Language Test</p>
                    <p className="text-gray-900">{student.language_test || '-'}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-500">Branch</p>
                    <p className="text-gray-900">{student.branch_name || '-'}</p>
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-800 mb-3 pb-2 border-b">
                  Family Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Father's Name</p>
                    <p className="text-gray-900">{student.father_name || '-'}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-500">Mother's Name</p>
                    <p className="text-gray-900">{student.mother_name || '-'}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-500">Parent Contact Number</p>
                    <p className="text-gray-900">{student.parent_number || '-'}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Address
              </h3>
              <p className="text-gray-900 whitespace-pre-line">{student.address}</p>
            </div>
            
            {student.emergency_contact && (
              <div className="mt-6 pt-4 border-t">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Emergency Contact
                </h3>
                <p className="text-gray-900">{student.emergency_contact}</p>
              </div>
            )}
            
            {student.comments && (
              <div className="mt-6 pt-4 border-t">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Comments/Notes
                </h3>
                <p className="text-gray-900 whitespace-pre-line">{student.comments}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewStudent; 