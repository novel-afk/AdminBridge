import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

interface Branch {
  id: number;
  name: string;
  country: string;
  city: string;
}

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

const EditStudent = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    user: {
      first_name: '',
      last_name: '',
      email: '',
      role: 'Student',
    },
    branch: '',
    contact_number: '',
    address: '',
    emergency_contact: '',
    nationality: '',
    gender: 'Other',
    age: '',
    institution_name: '',
    language_test: 'None',
    father_name: '',
    mother_name: '',
    parent_number: '',
    comments: '',
    profile_image: null as string | null,
    resume: null as string | null
  });
  
  const [newProfileImage, setNewProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const [newResume, setNewResume] = useState<File | null>(null);
  const [resumeName, setResumeName] = useState<string | null>(null);
  const [dob, setDob] = useState('');
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setFetchingData(true);
        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) {
          navigate('/login');
          return;
        }
        
        // Fetch student data
        const studentResponse = await axios.get(`http://localhost:8000/api/students/${id}/`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        
        const student: Student = studentResponse.data;
        
        // Fetch branches for dropdown
        const branchesResponse = await axios.get('http://localhost:8000/api/branches/', {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        
        setBranches(branchesResponse.data);
        
        // Set form data
        setFormData({
          user: {
            first_name: student.user.first_name,
            last_name: student.user.last_name,
            email: student.user.email,
            role: student.user.role,
          },
          branch: student.branch.toString(),
          contact_number: student.contact_number,
          address: student.address,
          emergency_contact: student.emergency_contact || '',
          nationality: student.nationality || '',
          gender: student.gender || 'Other',
          age: student.age ? student.age.toString() : '',
          institution_name: student.institution_name || '',
          language_test: student.language_test || 'None',
          father_name: student.father_name || '',
          mother_name: student.mother_name || '',
          parent_number: student.parent_number || '',
          comments: student.comments || '',
          profile_image: student.profile_image,
          resume: student.resume
        });
        
        // Set the profile image preview if available
        if (student.profile_image) {
          setProfileImagePreview(student.profile_image);
        }
        
        // Set resume name if available
        if (student.resume) {
          const resumeNameParts = student.resume.split('/');
          setResumeName(resumeNameParts[resumeNameParts.length - 1]);
        }
        
        // Set dob if available
        if (student.dob) {
          setDob(student.dob);
        }
      } catch (err) {
        console.error('Error fetching student data:', err);
        setError('Failed to load student data. Please try again.');
      } finally {
        setFetchingData(false);
      }
    };
    
    fetchData();
  }, [id, navigate]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Handle nested user fields
    if (name.startsWith('user.')) {
      const userField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        user: {
          ...prev.user,
          [userField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      if (e.target.name === 'profile_image') {
        setNewProfileImage(file);
        // Create a preview URL for the image
        const imageUrl = URL.createObjectURL(file);
        setProfileImagePreview(imageUrl);
      } else if (e.target.name === 'resume') {
        // Check if the file is a PDF
        if (file.type !== 'application/pdf') {
          setError('Please upload resume in PDF format only');
          e.target.value = ''; // Clear the input
          return;
        }
        setNewResume(file);
        setResumeName(file.name);
      }
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      navigate('/login');
      return;
    }
    
    try {
      const formDataObj = new FormData();
      
      // Add user data
      formDataObj.append('user.first_name', formData.user.first_name);
      formDataObj.append('user.last_name', formData.user.last_name);
      formDataObj.append('user.email', formData.user.email);
      formDataObj.append('user.role', formData.user.role);
      
      // Add student data
      formDataObj.append('branch', formData.branch);
      formDataObj.append('contact_number', formData.contact_number);
      formDataObj.append('address', formData.address);
      formDataObj.append('emergency_contact', formData.emergency_contact || '');
      formDataObj.append('nationality', formData.nationality || '');
      formDataObj.append('gender', formData.gender || '');
      formDataObj.append('age', formData.age || '');
      formDataObj.append('institution_name', formData.institution_name || '');
      formDataObj.append('language_test', formData.language_test || '');
      formDataObj.append('father_name', formData.father_name || '');
      formDataObj.append('mother_name', formData.mother_name || '');
      formDataObj.append('parent_number', formData.parent_number || '');
      formDataObj.append('comments', formData.comments || '');
      
      // Add files if new ones are selected
      if (newProfileImage) {
        formDataObj.append('profile_image', newProfileImage);
      }
      
      if (newResume) {
        formDataObj.append('resume', newResume);
      }
      
      // Add dob if set
      if (dob) {
        formDataObj.append('dob', dob);
      }
      
      // Make API request
      await axios.patch(
        `http://localhost:8000/api/students/${id}/`,
        formDataObj,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      navigate('/admin/students');
    } catch (error) {
      console.error('Error updating student:', error);
      setError('Failed to update student. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  if (fetchingData) {
    return (
      <div className="min-h-screen bg-gray-100 p-6 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Loading student data...</h2>
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Edit Student</h1>
          <p className="text-gray-600 mt-1">Update student information</p>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit}>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label htmlFor="user.first_name" className="block text-gray-700 text-sm font-medium mb-2">
                  CourseName
                </label>
                <input
                  type="text"
                  id="user.first_name"
                  name="user.first_name"
                  value={formData.user.first_name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"

                />
              </div>
              
              <div>
                <label htmlFor="user.last_name" className="block text-gray-700 text-sm font-medium mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  id="user.last_name"
                  name="user.last_name"
                  value={formData.user.last_name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"

                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label htmlFor="user.email" className="block text-gray-700 text-sm font-medium mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="user.email"
                  name="user.email"
                  value={formData.user.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"

                />
              </div>
              
              <div>
                <label htmlFor="contact_number" className="block text-gray-700 text-sm font-medium mb-2">
                  Contact Number
                </label>
                <input
                  type="text"
                  id="contact_number"
                  name="contact_number"
                  value={formData.contact_number}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"

                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label htmlFor="age" className="block text-gray-700 text-sm font-medium mb-2">
                  Age
                </label>
                <input
                  type="number"
                  id="age"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                  max="100"
                />
              </div>
              
              <div>
                <label htmlFor="nationality" className="block text-gray-700 text-sm font-medium mb-2">
                  Nationality
                </label>
                <input
                  type="text"
                  id="nationality"
                  name="nationality"
                  value={formData.nationality || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. British, American, Indian"
                />
              </div>
              
              <div>
                <label htmlFor="gender" className="block text-gray-700 text-sm font-medium mb-2">
                  Gender
                </label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            
            <div className="mb-6">
              <label htmlFor="dob" className="block text-gray-700 text-sm font-medium mb-2">
                Date of Birth
              </label>
              <input
                type="date"
                id="dob"
                name="dob"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label htmlFor="profile_image" className="block text-gray-700 text-sm font-medium mb-2">
                  Profile Image
                </label>
                <input
                  type="file"
                  id="profile_image"
                  name="profile_image"
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  accept="image/*"
                />
                <p className="text-xs text-gray-500 mt-1">Upload a new profile picture (optional)</p>
                
                {profileImagePreview && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-600 mb-2">Current profile image:</p>
                    <img 
                      src={profileImagePreview} 
                      alt="Profile preview" 
                      className="h-32 w-32 object-cover rounded-md border border-gray-300"
                    />
                  </div>
                )}
              </div>
              
              <div>
                <label htmlFor="resume" className="block text-gray-700 text-sm font-medium mb-2">
                  Rolesume/CV
                </label>
                <input
                  type="file"
                  id="resume"
                  name="resume"
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  accept="application/pdf"
                />
                <p className="text-xs text-gray-500 mt-1">Upload a new resume/CV (PDF only, optional)</p>
                
                {resumeName && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-600 mb-2">Current document:</p>
                    <div className="flex items-center p-3 bg-gray-50 rounded-md border border-gray-300">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm text-gray-700">{resumeName}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mb-6">
              <label htmlFor="address" className="block text-gray-700 text-sm font-medium mb-2">
                Address
              </label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              ></textarea>
            </div>
            
            <div className="mb-6">
              <label htmlFor="emergency_contact" className="block text-gray-700 text-sm font-medium mb-2">
                Emergency Contact
              </label>
              <input
                type="text"
                id="emergency_contact"
                name="emergency_contact"
                value={formData.emergency_contact || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <hr className="my-6" />
            
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Education Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label htmlFor="institution_name" className="block text-gray-700 text-sm font-medium mb-2">
                  Institution Name
                </label>
                <input
                  type="text"
                  id="institution_name"
                  name="institution_name"
                  value={formData.institution_name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="language_test" className="block text-gray-700 text-sm font-medium mb-2">
                  Language Test
                </label>
                <select
                  id="language_test"
                  name="language_test"
                  value={formData.language_test}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="None">None</option>
                  <option value="IELTS">IELTS</option>
                  <option value="TOEFL">TOEFL</option>
                  <option value="PTE">PTE</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            
            <hr className="my-6" />
            
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Family Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label htmlFor="father_name" className="block text-gray-700 text-sm font-medium mb-2">
                  Father's Name
                </label>
                <input
                  type="text"
                  id="father_name"
                  name="father_name"
                  value={formData.father_name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="mother_name" className="block text-gray-700 text-sm font-medium mb-2">
                  Mother's Name
                </label>
                <input
                  type="text"
                  id="mother_name"
                  name="mother_name"
                  value={formData.mother_name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="mb-6">
              <label htmlFor="parent_number" className="block text-gray-700 text-sm font-medium mb-2">
                Parent Contact Number
              </label>
              <input
                type="text"
                id="parent_number"
                name="parent_number"
                value={formData.parent_number}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <hr className="my-6" />
            
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Branch & Additional Notes</h2>
            
            <div className="mb-6">
              <label htmlFor="branch" className="block text-gray-700 text-sm font-medium mb-2">
                Branch
              </label>
              <select
                id="branch"
                name="branch"
                value={formData.branch}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Branch</option>
                {branches.map(branch => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name} ({branch.city}, {branch.country})
                  </option>
                ))}
              </select>
            </div>
            
            <div className="mb-6">
              <label htmlFor="comments" className="block text-gray-700 text-sm font-medium mb-2">
                Comments/Notes
              </label>
              <textarea
                id="comments"
                name="comments"
                value={formData.comments}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Any additional notes about the student..."
              ></textarea>
            </div>
            
            <div className="flex justify-end space-x-4 mt-6">
              <button
                type="button"
                onClick={() => navigate('/admin/students')}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 transition-colors duration-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors duration-300 disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update Student'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditStudent; 