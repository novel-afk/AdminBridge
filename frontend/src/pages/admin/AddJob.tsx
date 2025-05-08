import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

interface Branch {
  id: number;
  name: string;
  country: string;
  city: string;
}

const AddJob = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    branch: '',
    job_type: 'Full-Time',
    is_active: true,
    location: '',
    required_experience: '',
    salary_range: '',
  });
  
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Job type options
  const jobTypeOptions = [
    { value: 'Full-Time', label: 'Full-Time' },
    { value: 'Part-Time', label: 'Part-Time' },
    { value: 'Contract', label: 'Contract' },
    { value: 'Internship', label: 'Internship' },
    { value: 'Remote', label: 'Remote' },
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
        
        setBranches(response.data);
        
        // If there's at least one branch, select it by default
        if (response.data.length > 0) {
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
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      setFormData(prev => ({
        ...prev,
        [name]: target.checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Basic validation
    let validationError = '';
    if (!formData.title || !formData.description || !formData.requirements || !formData.branch || !formData.location || !formData.required_experience) {
      validationError = 'Please fill in all required fields';
    } else if (isNaN(formData.required_experience)) {
      validationError = 'Required experience must be a number';
    } else if (formData.salary_range !== undefined && formData.salary_range !== '' && isNaN(formData.salary_range as any)) {
      validationError = 'Salary range must be a number';
    }
    if (validationError) {
      setError(validationError);
      toast.error(validationError);
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
      const jobData = {
        title: formData.title,
        description: formData.description,
        requirements: formData.requirements,
        branch: parseInt(formData.branch),
        job_type: formData.job_type,
        is_active: formData.is_active,
        location: formData.location,
        required_experience: formData.required_experience,
        salary_range: formData.salary_range,
      };
      
      // Send to API
      await axios.post('http://localhost:8000/api/jobs/', jobData, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      
      // Redirect to jobs list
      navigate('/admin/jobs');
    } catch (err: any) {
      console.error('Error adding job:', err);
      if (err.response?.data) {
        console.log('Error details:', err.response.data);
        
        // Handle structured error responses
        if (typeof err.response.data === 'object') {
          const errorMessages: string[] = [];
          
          Object.entries(err.response.data).forEach(([key, value]) => {
            errorMessages.push(`${key}: ${value}`);
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
        'Failed to add job. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Post New Job</h1>
          <p className="text-gray-600 mt-1">Fill in the form below to post a new job</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit}>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Job Details</h2>
            
            <div className="mb-6">
              <label htmlFor="title" className="block text-gray-700 text-sm font-medium mb-2">
                Job Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                <label htmlFor="job_type" className="block text-gray-700 text-sm font-medium mb-2">
                  Job Type *
                </label>
                <select
                  id="job_type"
                  name="job_type"
                  value={formData.job_type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                >
                  {jobTypeOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mb-6">
              <label htmlFor="description" className="block text-gray-700 text-sm font-medium mb-2">
                Job Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              ></textarea>
            </div>

            <div className="mb-6">
              <label htmlFor="requirements" className="block text-gray-700 text-sm font-medium mb-2">
                Job Requirements *
              </label>
              <textarea
                id="requirements"
                name="requirements"
                value={formData.requirements}
                onChange={handleChange}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              ></textarea>
            </div>

            <div className="mb-6">
              <label htmlFor="location" className="block text-gray-700 text-sm font-medium mb-2">
                Location *
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            <div className="mb-6">
              <label htmlFor="required_experience" className="block text-gray-700 text-sm font-medium mb-2">
                Required Experience *
              </label>
              <input
                type="text"
                id="required_experience"
                name="required_experience"
                value={formData.required_experience}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            <div className="mb-6">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData(prev => ({...prev, is_active: e.target.checked}))}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
                  Make this job posting active (immediately visible to applicants)
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-4 mt-6">
              <button
                type="button"
                onClick={() => navigate('/admin/jobs')}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 transition-colors duration-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 transition-colors duration-300 disabled:opacity-50"
              >
                {loading ? 'Posting...' : 'Post Job'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddJob; 