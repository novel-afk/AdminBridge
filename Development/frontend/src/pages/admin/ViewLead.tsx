import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  interested_country: string | null;
  interested_degree: string | null;
  language_test: string;
  language_score: number | null;
  referred_by: string | null;
  courses_studied: string | null;
  interested_course: string | null;
  gpa: number | null;
  lead_source: string;
  notes: string | null;
  created_by: {
    id: number;
    name: string;
  };
  assigned_to: {
    id: number;
    name: string;
  } | null;
  created_at: string;
  updated_at: string;
}

const ViewLead = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchLead = async () => {
      try {
        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) {
          navigate('/login');
          return;
        }
        
        const response = await axios.get(`http://localhost:8000/api/leads/${id}/`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        
        setLead(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching lead:', err);
        setError('Failed to load lead data. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchLead();
  }, [id, navigate]);
  
  const handleEditLead = () => {
    navigate(`/admin/leads/edit/${id}`);
  };
  
  const handleBack = () => {
    navigate('/admin/leads');
  };
  
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy h:mm a');
    } catch (e) {
      return 'Invalid date';
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
  
  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
          <div className="flex justify-center">
            <button
              onClick={handleBack}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 transition-colors duration-300"
            >
              Back to Leads
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  if (!lead) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
          <div className="text-center text-gray-600">
            Lead not found
          </div>
          <div className="flex justify-center mt-4">
            <button
              onClick={handleBack}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 transition-colors duration-300"
            >
              Back to Leads
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">View Lead</h1>
            <p className="text-gray-600 mt-1">Detailed information about this lead</p>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={handleBack}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 transition-colors duration-300"
            >
              Back
            </button>
            <button
              onClick={handleEditLead}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors duration-300"
            >
              Edit Lead
            </button>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-800">
              {lead.name}
            </h2>
            <div className="mt-1 flex items-center">
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
              <span className="ml-2 text-sm text-gray-500">
                Added on {formatDate(lead.created_at)}
              </span>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-md font-medium text-gray-800 mb-3">Personal Information</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-gray-500 text-sm">Email:</span>
                    <p className="text-gray-800">{lead.email}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-sm">Phone:</span>
                    <p className="text-gray-800">{lead.phone}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-sm">Nationality:</span>
                    <p className="text-gray-800">{lead.nationality}</p>
                  </div>
                  {lead.referred_by && (
                    <div>
                      <span className="text-gray-500 text-sm">Referred By:</span>
                      <p className="text-gray-800">{lead.referred_by}</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="text-md font-medium text-gray-800 mb-3">Education & Interests</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-gray-500 text-sm">Interested Country:</span>
                    <p className="text-gray-800">{lead.interested_country || 'Not specified'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-sm">Interested Degree:</span>
                    <p className="text-gray-800">{lead.interested_degree || 'Not specified'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-sm">Interested Course:</span>
                    <p className="text-gray-800">{lead.interested_course || 'Not specified'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-sm">Previous Courses:</span>
                    <p className="text-gray-800">{lead.courses_studied || 'Not specified'}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <h3 className="text-md font-medium text-gray-800 mb-3">Academic Qualifications</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-gray-500 text-sm">Language Test:</span>
                    <p className="text-gray-800">{lead.language_test}</p>
                  </div>
                  {lead.language_test !== 'None' && (
                    <div>
                      <span className="text-gray-500 text-sm">Language Score:</span>
                      <p className="text-gray-800">{lead.language_score || 'Not provided'}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-500 text-sm">GPA:</span>
                    <p className="text-gray-800">{lead.gpa || 'Not provided'}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-md font-medium text-gray-800 mb-3">Branch Information</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-gray-500 text-sm">Branch:</span>
                    <p className="text-gray-800">{lead.branch.name}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-sm">Location:</span>
                    <p className="text-gray-800">{lead.branch.city}, {lead.branch.country}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-sm">Lead Source:</span>
                    <p className="text-gray-800">{lead.lead_source}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {lead.notes && (
              <div className="mt-6">
                <h3 className="text-md font-medium text-gray-800 mb-3">Notes</h3>
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="text-gray-800 whitespace-pre-line">{lead.notes}</p>
                </div>
              </div>
            )}
            
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-md font-medium text-gray-800 mb-3">System Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-500 text-sm">Created By:</span>
                  <p className="text-gray-800">{lead.created_by?.name || 'Unknown'}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-sm">Created At:</span>
                  <p className="text-gray-800">{formatDate(lead.created_at)}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-sm">Assigned To:</span>
                  <p className="text-gray-800">{lead.assigned_to?.name || 'Unassigned'}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-sm">Last Updated:</span>
                  <p className="text-gray-800">{formatDate(lead.updated_at)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewLead; 