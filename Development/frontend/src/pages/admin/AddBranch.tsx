import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AddBranch = () => {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    country: '',
    city: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

    // Validate form
    if (!formData.name || !formData.country || !formData.city || !formData.address) {
      setError('All fields are required');
      setLoading(false);
      return;
    }

    try {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        navigate('/login');
        return;
      }
      
      // Prepare data for API - exclude the ID field for new branch creation
      const apiData = {
        name: formData.name,
        country: formData.country,
        city: formData.city,
        address: formData.address
      };
      
      // Send data to API
      await axios.post('http://localhost:8000/api/branches/', apiData, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      
      // Redirect to branches list
      navigate('/admin/branches');
    } catch (err: any) {
      console.error('Error adding branch:', err);
      setError(
        err.response?.data?.detail || 
        err.response?.data?.message || 
        'Failed to add branch. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Add New Branch</h1>
          <p className="text-gray-600 mt-1">Create a new branch location</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit}>
            {/* Hidden field for branch ID */}
            <input type="hidden" name="id" value={formData.id} />
            
            <div className="mb-4">
              <label htmlFor="name" className="block text-gray-700 text-sm font-medium mb-2">
                Branch Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Downtown Office"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="country" className="block text-gray-700 text-sm font-medium mb-2">
                  Country *
                </label>
                <input
                  type="text"
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. United States"
                  required
                />
              </div>

              <div>
                <label htmlFor="city" className="block text-gray-700 text-sm font-medium mb-2">
                  City *
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. New York"
                  required
                />
              </div>
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
                placeholder="Full street address"
                required
              ></textarea>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/admin/branches')}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 transition-colors duration-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors duration-300 disabled:opacity-50"
              >
                {loading ? 'Adding...' : 'Add Branch'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddBranch; 