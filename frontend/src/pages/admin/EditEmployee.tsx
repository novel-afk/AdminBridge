import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

interface Branch {
  id: number;
  name: string;
  country: string;
  city: string;
}

interface Employee {
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
  employee_id: string;
  joining_date: string;
  salary: number;
  contact_number: string;
  address: string;
  emergency_contact: string | null;
  nationality: string | null;
  profile_image: string | null;
  citizenship_document: string | null;
  dob: string | null;
  gender: string | null;
}

const EditEmployee = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    user: {
      first_name: '',
      last_name: '',
      email: '',
      role: '',
    },
    branch: '',
    salary: '',
    contact_number: '',
    address: '',
    emergency_contact: '',
    nationality: '',
    gender: 'Other',
    profile_image: null as string | null,
    citizenship_document: null as string | null
  });
  
  const [newProfileImage, setNewProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const [newCitizenshipDoc, setNewCitizenshipDoc] = useState<File | null>(null);
  const [citizenshipDocName, setCitizenshipDocName] = useState<string | null>(null);
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
        
        // Fetch employee data
        const employeeResponse = await axios.get(`http://localhost:8000/api/employees/${id}/`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        
        const employee: Employee = employeeResponse.data;
        
        // Fetch branches for dropdown
        const branchesResponse = await axios.get('http://localhost:8000/api/branches/', {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        
        setBranches(branchesResponse.data);
        
        // Set form data
        setFormData({
          user: {
            first_name: employee.user.first_name,
            last_name: employee.user.last_name,
            email: employee.user.email,
            role: employee.user.role,
          },
          branch: employee.branch.toString(),
          salary: employee.salary ? employee.salary.toString() : '',
          contact_number: employee.contact_number,
          address: employee.address,
          emergency_contact: employee.emergency_contact || '',
          nationality: employee.nationality || '',
          gender: employee.gender || 'Other',
          profile_image: employee.profile_image,
          citizenship_document: employee.citizenship_document
        });
        
        // Set the profile image preview if available
        if (employee.profile_image) {
          setProfileImagePreview(employee.profile_image);
        }
        
        // Set citizenship document name if available
        if (employee.citizenship_document) {
          const docNameParts = employee.citizenship_document.split('/');
          setCitizenshipDocName(docNameParts[docNameParts.length - 1]);
        }
        
        // Set dob if available
        if (employee.dob) {
          setDob(employee.dob);
        }
      } catch (err) {
        console.error('Error fetching employee data:', err);
        setError('Failed to load employee data. Please try again.');
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
      } else if (e.target.name === 'citizenship_document') {
        // Check if the file is a PDF
        if (file.type !== 'application/pdf') {
          setError('Please upload citizenship document in PDF format only');
          e.target.value = ''; // Clear the input
          return;
        }
        setNewCitizenshipDoc(file);
        setCitizenshipDocName(file.name);
      }
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Basic validation
    if (!formData.user.first_name || !formData.user.last_name || !formData.user.email) {
      setError('Please fill in all required user fields');
      setLoading(false);
      return;
    }
    
    if (!formData.branch || !formData.contact_number) {
      setError('Please fill in all required employee fields');
      setLoading(false);
      return;
    }
    
    try {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        navigate('/login');
        return;
      }
      
      // Create form data for multipart file upload
      const formDataToSend = new FormData();
      
      // Add user data
      formDataToSend.append('user.first_name', formData.user.first_name);
      formDataToSend.append('user.last_name', formData.user.last_name);
      formDataToSend.append('user.email', formData.user.email);
      formDataToSend.append('user.role', formData.user.role);
      
      // Add employee data as JSON - this fixes the serialization issue
      const employeeData = {
        branch: parseInt(formData.branch),
        salary: formData.salary ? parseFloat(formData.salary) : 0,
        contact_number: formData.contact_number,
        address: formData.address,
        emergency_contact: formData.emergency_contact || '',
        nationality: formData.nationality || '',
        gender: formData.gender,
        dob: dob || null
      };
      
      formDataToSend.append('employee_data', JSON.stringify(employeeData));
      
      // Add profile image if selected
      if (newProfileImage) {
        formDataToSend.append('profile_image', newProfileImage);
      }
      
      // Add citizenship document if selected
      if (newCitizenshipDoc) {
        formDataToSend.append('citizenship_document', newCitizenshipDoc);
      }
      
      // Log the form data to debug
      console.log('Submitting data:', {
        employee_data: employeeData,
        user_data: {
          first_name: formData.user.first_name,
          last_name: formData.user.last_name,
          email: formData.user.email,
          role: formData.user.role
        },
        has_new_profile_image: !!newProfileImage,
        has_new_citizenship_doc: !!newCitizenshipDoc
      });
      
      // Send to API
      await axios.patch(`http://localhost:8000/api/employees/${id}/`, formDataToSend, {
        headers: { 
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Redirect to employees list
      navigate('/admin/employees');
    } catch (err: any) {
      console.error('Error updating employee:', err);
      if (err.response?.data) {
        console.log('Error details:', err.response.data);
        
        // Handle structured error responses
        if (typeof err.response.data === 'object') {
          const errorMessages = [];
          
          // Process nested errors (like user.email)
          Object.entries(err.response.data).forEach(([key, value]) => {
            if (typeof value === 'object') {
              Object.entries(value as any).forEach(([nestedKey, nestedValue]) => {
                errorMessages.push(`${key}.${nestedKey}: ${nestedValue}`);
              });
            } else {
              errorMessages.push(`${key}: ${value}`);
            }
          });
          
          if (errorMessages.length > 0) {
            setError(`Validation errors: ${errorMessages.join(', ')}`);
            setLoading(false);
            return;
          }
        }
      }
      
      setError(
        err.response?.data?.detail || 
        err.response?.data?.message || 
        'Failed to update employee. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };
  
  if (fetchingData) {
    return (
      <div className="min-h-screen bg-gray-100 p-6 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Loading employee data...</h2>
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Edit Employee</h1>
          <p className="text-gray-600 mt-1">Update employee information</p>
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
                  First Name *
                </label>
                <input
                  type="text"
                  id="user.first_name"
                  name="user.first_name"
                  value={formData.user.first_name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="user.last_name" className="block text-gray-700 text-sm font-medium mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  id="user.last_name"
                  name="user.last_name"
                  value={formData.user.last_name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label htmlFor="user.email" className="block text-gray-700 text-sm font-medium mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="user.email"
                  name="user.email"
                  value={formData.user.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="contact_number" className="block text-gray-700 text-sm font-medium mb-2">
                  Contact Number *
                </label>
                <input
                  type="text"
                  id="contact_number"
                  name="contact_number"
                  value={formData.contact_number}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
            
            <div className="mb-6">
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
            
            <div className="mb-6">
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
              <p className="text-xs text-gray-500 mt-1">Format: YYYY-MM-DD</p>
            </div>
            
            <div className="mb-6">
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
            
            <div className="mb-6">
              <label htmlFor="citizenship_document" className="block text-gray-700 text-sm font-medium mb-2">
                Citizenship Document
              </label>
              <input
                type="file"
                id="citizenship_document"
                name="citizenship_document"
                onChange={handleFileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                accept="application/pdf"
              />
              <p className="text-xs text-gray-500 mt-1">Upload a new citizenship document (PDF only, optional)</p>
              
              {citizenshipDocName && (
                <div className="mt-3">
                  <p className="text-sm text-gray-600 mb-2">Current document:</p>
                  <div className="flex items-center p-3 bg-gray-50 rounded-md border border-gray-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm text-gray-700">{citizenshipDocName}</span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="mb-6">
              <label htmlFor="address" className="block text-gray-700 text-sm font-medium mb-2">
                Address *
              </label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
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
            
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Employment Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label htmlFor="branch" className="block text-gray-700 text-sm font-medium mb-2">
                  Branch *
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
              
              <div>
                <label htmlFor="salary" className="block text-gray-700 text-sm font-medium mb-2">
                  Salary *
                </label>
                <input
                  type="number"
                  id="salary"
                  name="salary"
                  value={formData.salary}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mb-6">
              <div>
                <label htmlFor="user.role" className="block text-gray-700 text-sm font-medium mb-2">
                  Role *
                </label>
                <select
                  id="user.role"
                  name="user.role"
                  value={formData.user.role}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Role</option>
                  <option value="BranchManager">Branch Manager</option>
                  <option value="Counsellor">Counsellor</option>
                  <option value="Receptionist">Receptionist</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-4 mt-6">
              <button
                type="button"
                onClick={() => navigate('/admin/employees')}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 transition-colors duration-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors duration-300 disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update Employee'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditEmployee; 