import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';

interface Branch {
  id: number;
  name: string;
  city: string;
  country: string;
}

interface Lead {
  id: number;
  name: string;
  email: string;
  phone: string;
  nationality: string;
  branch: Branch;
  interested_country: string;
  interested_degree: string;
  language_test: string;
  language_score: number | null;
  lead_source: string;
  created_at: string;
  notes: string;
}

const LeadList = () => {
  const navigate = useNavigate();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  
  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) {
          navigate('/login');
          return;
        }
        
        const response = await axios.get('http://localhost:8000/api/leads/', {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        
        setLeads(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching leads:', err);
        setError('Failed to load leads. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchLeads();
  }, [navigate]);
  
  // Get unique lead sources for filtering
  const uniqueSources = Array.from(new Set(leads.map(lead => lead.lead_source)))
    .filter(Boolean)
    .sort();
  
  // Filter leads based on search query and source filter
  const filteredLeads = leads.filter(lead => {
    // Search filter (case insensitive)
    const searchMatch = searchQuery === '' || 
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.phone.includes(searchQuery);
    
    // Source filter
    const sourceMatch = sourceFilter === '' || lead.lead_source === sourceFilter;
    
    return searchMatch && sourceMatch;
  });
  
  const viewLead = (id: number) => {
    navigate(`/admin/leads/${id}`);
  };
  
  const editLead = (id: number) => {
    navigate(`/admin/leads/edit/${id}`);
  };
  
  const deleteLead = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this lead?')) {
      return;
    }
    
    try {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        navigate('/login');
        return;
      }
      
      await axios.delete(`http://localhost:8000/api/leads/${id}/`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      
      // Remove from state
      setLeads(leads.filter(lead => lead.id !== id));
    } catch (err) {
      console.error('Error deleting lead:', err);
      setError('Failed to delete lead. Please try again.');
    }
  };
  
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (e) {
      return 'Invalid date';
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-6 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Loading leads...</h2>
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Leads Management</h1>
            <p className="text-gray-600 mt-1">View and manage all leads</p>
          </div>
          <Link
            to="/admin/leads/add"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition duration-300"
          >
            Add New Lead
          </Link>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 border-b flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <h2 className="text-lg font-semibold text-gray-800">
              Lead List ({filteredLeads.length} leads)
            </h2>
            
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
              <div>
                <select
                  value={sourceFilter}
                  onChange={(e) => setSourceFilter(e.target.value)}
                  className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Sources</option>
                  {uniqueSources.map(source => (
                    <option key={source} value={source}>{source}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <input
                  type="text"
                  placeholder="Search by name, email or phone"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Branch
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date Added
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Source
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                      No leads found
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map(lead => (
                    <tr key={lead.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                        <div className="text-sm text-gray-500">{lead.nationality}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{lead.email}</div>
                        <div className="text-sm text-gray-500">{lead.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{lead.branch.name}</div>
                        <div className="text-sm text-gray-500">{lead.branch.city}, {lead.branch.country}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(lead.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          lead.lead_source === 'Website' ? 'bg-blue-100 text-blue-800' :
                          lead.lead_source === 'Social Media' ? 'bg-purple-100 text-purple-800' :
                          lead.lead_source === 'Referral' ? 'bg-green-100 text-green-800' :
                          lead.lead_source === 'Walk-in' ? 'bg-yellow-100 text-yellow-800' :
                          lead.lead_source === 'Email' ? 'bg-indigo-100 text-indigo-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {lead.lead_source}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => viewLead(lead.id)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          View
                        </button>
                        <button
                          onClick={() => editLead(lead.id)}
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteLead(lead.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadList; 