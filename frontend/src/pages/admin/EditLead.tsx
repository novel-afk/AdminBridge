import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

interface Branch {
  id: number;
  name: string;
  country: string;
  city: string;
}

const EditLead = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
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
    lead_source: 'Website',
    notes: '',
  });
  
  const [showLanguageScore, setShowLanguageScore] = useState(false);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

  // Lead source options
  const leadSourceOptions = [
    { value: 'Website', label: 'Website' },
    { value: 'Social Media', label: 'Social Media' },
    { value: 'Referral', label: 'Referral' },
    { value: 'Walk-in', label: 'Walk-in' },
    { value: 'Phone Inquiry', label: 'Phone Inquiry' },
    { value: 'Email', label: 'Email' },
    { value: 'Event', label: 'Event' },
    { value: 'Other', label: 'Other' },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) {
          navigate('/login');
          return;
        }
        
        // Fetch branches for dropdown
        const branchesResponse = await axios.get('http://localhost:8000/api/branches/', {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        
        setBranches(branchesResponse.data);
        
        // Fetch lead data
        const leadResponse = await axios.get(`http://localhost:8000/api/leads/${id}/`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        
        const lead = leadResponse.data;
        
        // Set form data
        setFormData({
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          nationality: lead.nationality,
          branch: lead.branch.toString(),
          interested_country: lead.interested_country || '',
          interested_degree: lead.interested_degree || '',
          language_test: lead.language_test || 'None',
          language_score: lead.language_score ? lead.language_score.toString() : '',
          referred_by: lead.referred_by || '',
          courses_studied: lead.courses_studied || '',
          interested_course: lead.interested_course || '',
          gpa: lead.gpa ? lead.gpa.toString() : '',
          lead_source: lead.lead_source || 'Website',
          notes: lead.notes || '',
        });
        
        // Set language score visibility based on language test
        setShowLanguageScore(lead.language_test !== 'None');
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load lead data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, navigate]);

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
      // Prepare data for API
      const leadData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        nationality: formData.nationality,
        branch: formData.branch,
        interested_country: formData.interested_country || '',
        interested_degree: formData.interested_degree || '',
        language_test: formData.language_test || '',
        language_score: formData.language_score ? parseFloat(formData.language_score) : null,
        referred_by: formData.referred_by || '',
        courses_studied: formData.courses_studied || '',
        interested_course: formData.interested_course || '',
        gpa: formData.gpa ? parseFloat(formData.gpa) : null,
        lead_source: formData.lead_source || 'Website',
        notes: formData.notes || '',
      };
      
      // Send to API
      await axios.patch(
        `http://localhost:8000/api/leads/${id}/`, 
        leadData,
        {
          headers: { Authorization: `Bearer ${accessToken}` }
        }
      );
      
      navigate('/admin/leads');
    } catch (error) {
      console.error('Error updating lead:', error);
      setError('Failed to update lead. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-6 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Loading lead data...</h2>
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Edit Lead</h1>
          <p className="text-gray-600 mt-1">Update lead information</p>
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
                  RoleName
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"

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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label htmlFor="phone" className="block text-gray-700 text-sm font-medium mb-2">
                  Contact Number
                </label>
                <input
                  type="text"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"

                />
              </div>

              <div>
                <label htmlFor="nationality" className="block text-gray-700 text-sm font-medium mb-2">
                  Nationality *
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
                  Branch
                </label>
                <select
                  id="branch"
                  name="branch"
                  value={formData.branch}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"

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
                    <option key={option.value} value={option.value}>{option.label}</option>
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
                onClick={() => navigate('/admin/leads')}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 transition-colors duration-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors duration-300 disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update Lead'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditLead; 