import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../lib/AuthContext';

interface Branch {
  id: number;
  name: string;
  country: string;
  city: string;
}

const ReceptionistAddLead = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    nationality: '',
    branch: '',
    interested_country: '',
    interested_degree: '',
    language_test: 'None',
    language_score: '',
    referred_by: '',
    courses_studied: '',
    interested_course: '',
    gpa: '',
    lead_source: 'Walk-in',
    notes: '',
  });
  
  const [showLanguageScore, setShowLanguageScore] = useState(false);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({});
  const navigate = useNavigate();

  // Country options
  const countryOptions = [
    { value: '', label: 'Select Country' },
    { value: 'USA', label: 'USA' },
    { value: 'UK', label: 'UK' },
    { value: 'Canada', label: 'Canada' },
    { value: 'Australia', label: 'Australia' },
    { value: 'New Zealand', label: 'New Zealand' },
    { value: 'Germany', label: 'Germany' },
    { value: 'France', label: 'France' },
    { value: 'Japan', label: 'Japan' },
    { value: 'Singapore', label: 'Singapore' },
    { value: 'South Korea', label: 'South Korea' },
  ];
  
  // Degree options
  const degreeOptions = [
    { value: '', label: 'Select Degree' },
    { value: 'Diploma', label: 'Diploma' },
    { value: 'Bachelor', label: 'Bachelor' },
    { value: 'Master', label: 'Master' },
    { value: 'PhD', label: 'PhD' },
  ];

  // Language test options
  const languageTestOptions = [
    { value: 'None', label: 'None' },
    { value: 'IELTS', label: 'IELTS' },
    { value: 'TOEFL', label: 'TOEFL' },
    { value: 'N1', label: 'N1' },
    { value: 'N2', label: 'N2' },
    { value: 'N3', label: 'N3' },
  ];

  // Lead source options - more relevant for receptionist
  const leadSourceOptions = [
    { value: 'Walk-in', label: 'Walk-in' },
    { value: 'Phone Inquiry', label: 'Phone Inquiry' },
    { value: 'Email', label: 'Email' },
    { value: 'Referral', label: 'Referral' },
    { value: 'Website', label: 'Website' },
    { value: 'Social Media', label: 'Social Media' },
    { value: 'Event', label: 'Event' },
    { value: 'Other', label: 'Other' },
  ];

  useEffect(() => {
    // Fetch branches for the dropdown
    const fetchBranches = async () => {
      try {
        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) {
          navigate('/login');
          return;
        }
        
        const response = await axios.get('http://localhost:8000/api/branches/', {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        
        // Store all branches but only show the receptionist's branch
        setBranches(response.data);
        
        // Set the branch to the receptionist's branch if it exists
        if (user?.branch) {
          setFormData(prev => ({
            ...prev,
            branch: user.branch.toString()
          }));
        }
        // Otherwise use the first branch as fallback
        else if (response.data.length > 0) {
          setFormData(prev => ({
            ...prev,
            branch: response.data[0].id.toString()
          }));
        }
      } catch (err) {
        console.error('Error fetching branches:', err);
        setError('Failed to load branches. Please try again later.');
      }
    };

    fetchBranches();
  }, [navigate, user]);

  // Watch for language test changes to show/hide score input
  useEffect(() => {
    setShowLanguageScore(formData.language_test !== 'None');
  }, [formData.language_test]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field when user starts typing again
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const errors: {[key: string]: string} = {};
    let isValid = true;

    // Required fields
    if (!formData.name.trim()) {
      errors.name = 'Full name is required';
      isValid = false;
    }

    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
      isValid = false;
    } else if (!/^\+?[0-9]{8,15}$/.test(formData.phone.trim())) {
      errors.phone = 'Please enter a valid phone number (8-15 digits)';
      isValid = false;
    }

    if (formData.email.trim() && !/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
      isValid = false;
    }

    if (!formData.branch) {
      errors.branch = 'Branch is required';
      isValid = false;
    }

    // Update field errors
    setFieldErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setFieldErrors({});

    // Validate form
    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        navigate('/login');
        return;
      }
      
      // Prepare data for API
      const leadData = {
        name: formData.name,
        email: formData.email || null,
        phone: formData.phone,
        nationality: formData.nationality || null,
        branch: parseInt(formData.branch),
        lead_source: formData.lead_source,
        notes: formData.notes || null,
        interested_country: formData.interested_country || null,
        interested_degree: formData.interested_degree || null,
        language_test: formData.language_test,
        language_score: formData.language_score ? parseFloat(formData.language_score) : null,
        referred_by: formData.referred_by || null,
        courses_studied: formData.courses_studied || null,
        interested_course: formData.interested_course || null,
        gpa: formData.gpa ? parseFloat(formData.gpa) : null,
      };
      
      // Send to API
      await axios.post('http://localhost:8000/api/leads/', leadData, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      
      // Redirect to leads list
      navigate('/receptionist/leads');
    } catch (err: any) {
      console.error('Error adding lead:', err);
      
      // Handle different types of error responses
      if (err.response?.data) {
        console.log('Error details:', err.response.data);
        
        // Handle structured error responses
        if (typeof err.response.data === 'object') {
          const newFieldErrors: {[key: string]: string} = {};
          
          Object.entries(err.response.data).forEach(([key, value]) => {
            const errorMsg = Array.isArray(value) ? value[0] : value;
            
            // Special handling for common errors
            if (key === 'email' && errorMsg.includes('already exists')) {
              newFieldErrors.email = 'This email is already registered';
            } else if (key === 'phone' && errorMsg.includes('already exists')) {
              newFieldErrors.phone = 'This phone number is already registered';
            } else {
              newFieldErrors[key] = errorMsg as string;
            }
          });
          
          if (Object.keys(newFieldErrors).length > 0) {
            setFieldErrors(newFieldErrors);
            setError('Please correct the errors below');
          } else {
            setError('Failed to add lead. Please try again.');
          }
        } else {
          setError(
            err.response.data.detail || 
            err.response.data.message || 
            'Failed to add lead. Please try again.'
          );
        }
      } else {
        setError('Failed to add lead. Please check your network connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Find the branch name based on the branch ID
  const selectedBranchName = branches.find(b => b.id.toString() === formData.branch)?.name || '';

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Add New Lead</h1>
          <p className="text-gray-600 mt-1">Fill in the form below to add a new lead</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit}>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label htmlFor="name" className="block text-gray-700 text-sm font-medium mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border ${fieldErrors.name ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  required
                />
                {fieldErrors.name && (
                  <p className="mt-1 text-xs text-red-500">{fieldErrors.name}</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-gray-700 text-sm font-medium mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border ${fieldErrors.email ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                {fieldErrors.email && (
                  <p className="mt-1 text-xs text-red-500">{fieldErrors.email}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label htmlFor="phone" className="block text-gray-700 text-sm font-medium mb-2">
                  Contact Number *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border ${fieldErrors.phone ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  required
                />
                {fieldErrors.phone && (
                  <p className="mt-1 text-xs text-red-500">{fieldErrors.phone}</p>
                )}
              </div>

              <div>
                <label htmlFor="nationality" className="block text-gray-700 text-sm font-medium mb-2">
                  Nationality
                </label>
                <input
                  type="text"
                  id="nationality"
                  name="nationality"
                  value={formData.nationality}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <hr className="my-6" />

            <h2 className="text-lg font-semibold text-gray-800 mb-4">Education & Interests</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label htmlFor="interested_country" className="block text-gray-700 text-sm font-medium mb-2">
                  Interested Country
                </label>
                <select
                  id="interested_country"
                  name="interested_country"
                  value={formData.interested_country}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {countryOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="interested_degree" className="block text-gray-700 text-sm font-medium mb-2">
                  Interested Degree
                </label>
                <select
                  id="interested_degree"
                  name="interested_degree"
                  value={formData.interested_degree}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {degreeOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label htmlFor="interested_course" className="block text-gray-700 text-sm font-medium mb-2">
                  Interested Course
                </label>
                <input
                  type="text"
                  id="interested_course"
                  name="interested_course"
                  value={formData.interested_course}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="courses_studied" className="block text-gray-700 text-sm font-medium mb-2">
                  Previously Studied Courses
                </label>
                <input
                  type="text"
                  id="courses_studied"
                  name="courses_studied"
                  value={formData.courses_studied}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
                  {languageTestOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              {showLanguageScore && (
                <div>
                  <label htmlFor="language_score" className="block text-gray-700 text-sm font-medium mb-2">
                    Language Score
                  </label>
                  <input
                    type="number"
                    id="language_score"
                    name="language_score"
                    value={formData.language_score}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    step="0.1"
                    min="0"
                    max="9.9"
                  />
                </div>
              )}

              <div>
                <label htmlFor="gpa" className="block text-gray-700 text-sm font-medium mb-2">
                  GPA
                </label>
                <input
                  type="number"
                  id="gpa"
                  name="gpa"
                  value={formData.gpa}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  step="0.01"
                  min="0"
                  max="4.0"
                />
              </div>
            </div>

            <div className="mb-6">
              <label htmlFor="referred_by" className="block text-gray-700 text-sm font-medium mb-2">
                Referred By
              </label>
              <input
                type="text"
                id="referred_by"
                name="referred_by"
                value={formData.referred_by}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <hr className="my-6" />

            <h2 className="text-lg font-semibold text-gray-800 mb-4">Additional Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label htmlFor="branch" className="block text-gray-700 text-sm font-medium mb-2">
                  Branch *
                </label>
                {user?.branch ? (
                  // If receptionist has a branch, display it as read-only
                  <input
                    type="text"
                    id="branch_display"
                    value={selectedBranchName}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                    disabled
                  />
                ) : (
                  // Otherwise show dropdown with all branches
                  <select
                    id="branch"
                    name="branch"
                    value={formData.branch}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border ${fieldErrors.branch ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    required
                  >
                    <option value="">Select Branch</option>
                    {branches.map(branch => (
                      <option key={branch.id} value={branch.id}>
                        {branch.name} ({branch.city}, {branch.country})
                      </option>
                    ))}
                  </select>
                )}
                {/* Keep hidden input to retain value for form submission */}
                <input type="hidden" name="branch" value={formData.branch} />
                {fieldErrors.branch && (
                  <p className="mt-1 text-xs text-red-500">{fieldErrors.branch}</p>
                )}
              </div>

              <div>
                <label htmlFor="lead_source" className="block text-gray-700 text-sm font-medium mb-2">
                  Lead Source
                </label>
                <select
                  id="lead_source"
                  name="lead_source"
                  value={formData.lead_source}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {leadSourceOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mb-6">
              <label htmlFor="notes" className="block text-gray-700 text-sm font-medium mb-2">
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Any additional notes about the lead..."
              ></textarea>
            </div>

            <div className="flex justify-end space-x-4 mt-6">
              <button
                type="button"
                onClick={() => navigate('/receptionist/leads')}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 transition-colors duration-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition-colors duration-300 disabled:opacity-50"
              >
                {loading ? 'Adding...' : 'Add Lead'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReceptionistAddLead; 