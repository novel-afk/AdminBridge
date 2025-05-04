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
    lead_source: 'Walk-in',
    notes: '',
  });
  
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Basic validation
    if (!formData.name || !formData.phone || !formData.branch) {
      setError('Please fill in all required fields');
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
      };
      
      // Send to API
      await axios.post('http://localhost:8000/api/leads/', leadData, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      
      // Redirect to leads list
      navigate('/receptionist/leads');
    } catch (err: any) {
      console.error('Error adding lead:', err);
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
        'Failed to add lead. Please try again.'
      );
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
          <h1 className="text-2xl font-bold text-gray-800">Register New Lead</h1>
          <p className="text-gray-600 mt-1">Fill in the information for the walk-in or phone inquiry lead</p>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-gray-700 text-sm font-medium mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  value={formData.nationality}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

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
                )}
                {/* Keep hidden input to retain value for form submission */}
                <input type="hidden" name="branch" value={formData.branch} />
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
                placeholder="Add any additional information here..."
              ></textarea>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => navigate('/receptionist/leads')}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 mr-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
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