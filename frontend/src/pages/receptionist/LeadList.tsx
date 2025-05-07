import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { UserPlusIcon, EyeIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../lib/AuthContext';
import AddLeadModal from '../../components/AddLeadModal';
import ViewLeadModal from '../../components/ViewLeadModal';

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
}

const ReceptionistLeadList = () => {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);

  useEffect(() => {
    const fetchLeads = async () => {
      // If data already loaded, don't fetch again
      if (dataLoaded) return;
      
      try {
        setLoading(true);
        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) {
          setError('You are not authenticated');
          setLoading(false);
          return;
        }

        const response = await axios.get('http://localhost:8000/api/leads/', {
          headers: { Authorization: `Bearer ${accessToken}` }
        });

        // Filter leads by branch if the receptionist has a branch
        const filteredLeads = user?.branch 
          ? response.data.filter((lead: Lead) => lead.branch === user.branch)
          : response.data;

        setLeads(filteredLeads);
        setLoading(false);
        setDataLoaded(true);
      } catch (err: any) {
        console.error('Error fetching leads:', err);
        setError(err.response?.data?.detail || 'Failed to fetch leads');
        setLoading(false);
      }
    };

    fetchLeads();
  }, [user, dataLoaded]);

  const handleAddSuccess = () => {
    setIsAddModalOpen(false);
    setDataLoaded(false); // Refresh the list
  };

  const handleViewLead = async (id: number) => {
    try {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        setError('You are not authenticated');
        return;
      }
      const response = await axios.get(`http://localhost:8000/api/leads/${id}/`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      setSelectedLead(response.data);
      setIsViewModalOpen(true);
    } catch (err) {
      setError('Failed to load lead details');
    }
  };

  if (loading) {
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
          <UserPlusIcon className="w-5 h-5 mr-2" />
          Add Lead
        </button>
      </div>

      {leads.length === 0 ? (
        <div className="p-6 text-center text-gray-500">
          No leads found in your branch
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3 flex">
                    <button
                      onClick={() => handleViewLead(lead.id)}
                      className="text-blue-600 hover:text-blue-900 focus:outline-none focus:underline"
                      title="View Details"
                    >
                      <EyeIcon className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <AddLeadModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleAddSuccess}
      />
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

export default ReceptionistLeadList; 