import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { UserPlusIcon, PencilSquareIcon, EyeIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../lib/AuthContext';
import { leadAPI } from '../../lib/api';
import AddLeadModal from '../../components/counsellor/AddLeadModal';
import { format } from 'date-fns';
import { API_BASE_URL } from '../../lib/apiConfig';
import { toast } from 'react-hot-toast';

interface Lead {
  id: number;
  name: string;
  email: string;
  phone: string;
  interested_country: string;
  interested_course: string;
  nationality: string;
  created_at: string;
  lead_source: string;
  branch: number;
  branch_name?: string;
  interested_degree?: string;
  language_test: string;
  language_score?: number | null;
  notes?: string;
  referred_by?: string;
  courses_studied?: string;
  gpa?: number | null;
  created_by?: number;
  assigned_to?: number;
  assigned_to_name?: string;
  created_by_name?: string;
}

const ViewLeadModal = ({ isOpen, onClose, lead }: { isOpen: boolean; onClose: () => void; lead: Lead | null }) => {
  if (!isOpen || !lead) return null;

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy h:mm a');
    } catch (e) {
      return 'Invalid date';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Lead Details</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="border-b border-gray-200 bg-gray-50 px-6 py-4 mb-6">
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
                  <p className="text-gray-800">{lead.branch_name}</p>
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
        </div>

        <div className="border-t border-gray-200 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 transition-colors duration-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const CounsellorLeadList = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const { user } = useAuth();
  const [dataLoaded, setDataLoaded] = useState(false);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        setError('You are not authenticated');
        setLoading(false);
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/leads/`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      // Use backend-filtered results directly
      console.log('Counsellor branch (LeadList):', user?.branch);
      setLeads(response.data);
      setDataLoaded(true);
    } catch (err: any) {
      console.error('Error fetching leads:', err);
      setError(err.response?.data?.detail || 'Failed to fetch leads');
      toast.error('Failed to fetch leads');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [user, dataLoaded]);

  const handleAddSuccess = (newLead?: Lead) => {
    setIsAddModalOpen(false);
    
    if (newLead) {
      setLeads(prev => [newLead, ...prev]);
    }
  };

  const handleViewLead = async (id: number) => {
    try {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        setError('You are not authenticated');
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/leads/${id}/`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      setSelectedLead(response.data);
      setIsViewModalOpen(true);
    } catch (err) {
      console.error('Error fetching lead details:', err);
      setError('Failed to load lead details');
    }
  };

  // Only show loading state on initial load
  if (loading && !dataLoaded) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  // Format date to a readable format
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="flex justify-between items-center p-6 border-b">
        <h1 className="text-2xl font-semibold text-gray-800">Lead Management</h1>
        <button 
          onClick={() => setIsAddModalOpen(true)} 
          className="bg-[#153147] hover:bg-[#153147]/90 text-white py-2 px-4 rounded-md transition-colors duration-300 flex items-center"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Add Lead
        </button>
      </div>

      {leads.length === 0 ? (
        <div className="p-6 text-center text-gray-500">
          <div className="py-8">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <UserPlusIcon className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No leads found</h3>
            <p className="text-gray-500 mb-6">No leads have been added to your branch yet.</p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#153147] hover:bg-[#153147]/90"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              Add Your First Lead
            </button>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-[#153147]">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Email
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Phone
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Country
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Course
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Created
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Source
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {lead.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {lead.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {lead.phone}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {lead.interested_country || 'Not specified'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {lead.interested_course || 'Not specified'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(lead.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {lead.lead_source}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => handleViewLead(lead.id)}
                      className="text-indigo-600 hover:text-indigo-900 focus:outline-none focus:underline"
                      title="View Lead Details"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Lead Modal */}
      <AddLeadModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleAddSuccess}
      />

      {/* View Lead Modal */}
      <ViewLeadModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedLead(null);
        }}
        lead={selectedLead}
      />
    </div>
  );
};

export default CounsellorLeadList; 