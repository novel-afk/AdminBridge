import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import { 
  MagnifyingGlassIcon, 
  PlusIcon, 
  ArrowDownTrayIcon, 
  EyeIcon, 
  PencilIcon 
} from '@heroicons/react/24/outline';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Checkbox } from '../../components/ui/checkbox';
import { Badge } from '../../components/ui/badge';
import AddLeadModal from '../../components/AddLeadModal';
import EditLeadModal from '../../components/EditLeadModal';
import ViewLeadModal from '../../components/ViewLeadModal';
import ConfirmationModal from '../../components/ConfirmationModal';

interface Lead {
  id: number;
  name: string;
  email: string;
  phone: string;
  nationality: string;
  branch: number;
  branch_name?: string;
  interested_country?: string;
  interested_degree?: string;
  language_test: string;
  language_score?: number | null;
  lead_source: string;
  created_at: string;
  notes?: string;
  referred_by?: string;
  courses_studied?: string;
  interested_course?: string;
  gpa?: number | null;
  created_by?: number;
  assigned_to?: number;
  assigned_to_name?: string;
  created_by_name?: string;
}

const columns = [
  { key: "select", label: "" },
  { key: "sNo", label: "S.No" },
  { key: "name", label: "Name" },
  { key: "nationality", label: "Nationality" },
  { key: "contact", label: "Contact Info" },
  { key: "interestedCountry", label: "Country" },
  { key: "interestedDegree", label: "Degree" },
  { key: "interestedCourse", label: "Course" },
  { key: "language", label: "Language Test" },
  { key: "source", label: "Lead Source" },
  { key: "createdBy", label: "Created By" },
  { key: "assignedTo", label: "Assigned To" },
  { key: "createdAt", label: "Created At" },
  { key: "actions", label: "Actions" },
];

const LeadList = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();
  
  // New state variables for the enhanced UI
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedLeads, setSelectedLeads] = useState<number[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  
  // API base URL - should match your backend configuration
  const API_BASE_URL = 'http://localhost:8000/api';
  
  // Confirmation modal states
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'success' as 'success' | 'warning' | 'danger',
    confirmText: 'Confirm'
  });

  const showConfirmation = (config: Partial<typeof confirmationModal>) => {
    setConfirmationModal({
      ...confirmationModal,
      isOpen: true,
      ...config,
    });
  };
  
  // Format lead data for component compatibility
  const formatLeadData = (lead: any): Lead => {
    return {
      ...lead,
      branch_name: lead.branch?.name || '',
      assigned_to_name: lead.assigned_to?.first_name ? 
        `${lead.assigned_to.first_name} ${lead.assigned_to.last_name}` : 'Unassigned',
      created_by_name: lead.created_by?.first_name ? 
        `${lead.created_by.first_name} ${lead.created_by.last_name}` : 'System'
    };
  };

  // Function to fetch leads from API
  const fetchLeads = async (showRefreshing = false) => {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      navigate('/login');
      return;
    }
    
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError('');
      
      // Make API call to backend
      const response = await axios.get(`${API_BASE_URL}/leads/`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      
      console.log('API Response:', response.data);
      
      // Handle different response formats
      let leadData: any[] = [];
      if (Array.isArray(response.data)) {
        leadData = response.data;
      } else if (response.data.results && Array.isArray(response.data.results)) {
        leadData = response.data.results;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        leadData = response.data.data;
      }
      
      // Format the lead data to match our UI component structure
      const formattedLeads = leadData.map(formatLeadData);
          
      setLeads(formattedLeads);
      setLoading(false);
      setRefreshing(false);
    } catch (err: any) {
      console.error('Error fetching leads:', err);
      setError(err.response?.data?.detail || 'Failed to fetch leads. Please try again.');
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    // Check if user is logged in
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      navigate('/login');
      return;
    }

    fetchLeads();
  }, [navigate]);

  // Filtered leads based on search query
  const filteredLeads = leads.filter((lead) =>
    Object.values(lead).some((value) => 
      value && typeof value === 'string' && 
      value.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  // Calculate pagination
  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedLeads = filteredLeads.slice(startIndex, startIndex + itemsPerPage);
  
  // Determine dynamic table height based on number of rows
  const getTableHeight = () => {
    if (paginatedLeads.length === 0) return 'h-auto';
    if (paginatedLeads.length === 1) return 'h-[120px]';
    if (paginatedLeads.length === 2) return 'h-[180px]';
    if (paginatedLeads.length === 3) return 'h-[240px]';
    if (paginatedLeads.length === 4) return 'h-[300px]';
    if (paginatedLeads.length === 5) return 'h-[360px]';
    if (paginatedLeads.length <= 8) return 'h-[500px]';
    if (paginatedLeads.length <= 12) return 'h-[620px]';
    return 'h-[680px]'; // Fixed height for 13-15 items
  };

  // Calculate container size based on content
  const getContainerClass = () => {
    if (leads.length === 0) return 'h-full';
    return 'flex-1';  // Always use flex-1 for non-empty lists for better layout
  };

  const handleSelectLead = (id: number) => {
    setSelectedLeads((prev) => {
      if (prev.includes(id)) {
        return prev.filter((leadId) => leadId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedLeads(filteredLeads.map((lead) => lead.id));
    } else {
      setSelectedLeads([]);
    }
  };

  const handleExport = () => {
    const exportData = selectedLeads.length > 0
      ? filteredLeads.filter(lead => selectedLeads.includes(lead.id))
      : filteredLeads;

    // Create CSV content
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Headers
    const headers = [
      "Name", "Email", "Phone", "Nationality", "Branch", 
      "Interested Country", "Interested Degree", "Interested Course",
      "Language Test", "Language Score", "Lead Source", "Created At",
      "Notes", "Referred By", "Courses Studied", "GPA",
      "Created By", "Assigned To"
    ];
    csvContent += headers.join(",") + "\n";
    
    // Data rows
    exportData.forEach(lead => {
      const row = [
        `"${lead.name || ''}"`,
        `"${lead.email || ''}"`,
        `"${lead.phone || ''}"`,
        `"${lead.nationality || ''}"`,
        `"${lead.branch_name || ''}"`,
        `"${lead.interested_country || ''}"`,
        `"${lead.interested_degree || ''}"`,
        `"${lead.interested_course || ''}"`,
        `"${lead.language_test || ''}"`,
        `"${lead.language_score || ''}"`,
        `"${lead.lead_source || ''}"`,
        `"${lead.created_at ? formatDate(lead.created_at) : ''}"`,
        `"${lead.notes || ''}"`,
        `"${lead.referred_by || ''}"`,
        `"${lead.courses_studied || ''}"`,
        `"${lead.gpa || ''}"`,
        `"${lead.created_by_name || ''}"`,
        `"${lead.assigned_to_name || ''}"`,
      ];
      csvContent += row.join(",") + "\n";
    });
    
    // Create a download link and trigger the download
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "leads_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleView = (lead: Lead) => {
    setSelectedLead(lead);
    setIsViewModalOpen(true);
  };

  const handleEdit = (lead: Lead) => {
    setSelectedLead(lead);
    setIsEditModalOpen(true);
  };

  const handleAddSuccess = () => {
    setIsAddModalOpen(false);
    showConfirmation({
      title: 'Lead Created',
      message: 'The lead has been created successfully.',
      type: 'success',
      confirmText: 'OK',
      onConfirm: () => {
        fetchLeads(true);
      }
    });
  };

  const handleEditSuccess = () => {
    setIsEditModalOpen(false);
    showConfirmation({
      title: 'Lead Updated',
      message: 'The lead has been updated successfully.',
      type: 'success',
      confirmText: 'OK',
      onConfirm: () => {
        fetchLeads(true);
      }
    });
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
      <div className="flex flex-col h-full">
        <div className="flex-none pb-6">
          <h1 className="text-2xl font-bold text-gray-800">Leads</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your leads information</p>
        </div>
        
        <div className="flex-1 flex justify-center items-center">
          <div className="bg-white rounded-lg shadow-md p-8 flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1e1b4b] mb-4"></div>
            <div className="text-xl text-gray-600">Loading leads...</div>
            <p className="text-sm text-gray-500 mt-2">Please wait while we fetch the data</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
     

      {/* Page title and controls */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex-none pb-6">
          <h1 className="text-2xl font-bold text-gray-800">Leads</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your leads information</p>

          <div className="flex justify-between items-center mt-8">
            <Button 
              onClick={() => setIsAddModalOpen(true)} 
              className="bg-[#153147] hover:bg-[#1e1b4b]/90 text-white px-4 py-2 rounded-md flex items-center gap-2"
              disabled={refreshing}
            >
              <PlusIcon className="h-5 w-5" />
              Add
            </Button>

            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => fetchLeads(true)}
                disabled={refreshing}
                className="flex items-center gap-2 text-gray-700 hover:bg-gray-100"
              >
                {refreshing ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-[#1e1b4b] border-t-transparent rounded-full"></div>
                    Refreshing...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                onClick={handleExport} 
                disabled={filteredLeads.length === 0 || refreshing}
                className="flex items-center gap-2 text-gray-700 hover:bg-gray-100"
              >
                <ArrowDownTrayIcon className="h-5 w-5" />
                Export
              </Button>
              <div className="relative ml-2">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                <Input
                  type="text"
                  placeholder="Search leads..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-[300px] bg-white rounded-md border-gray-300 focus:border-[#1e1b4b] focus:ring-1 focus:ring-[#1e1b4b] transition-all duration-200"
                  disabled={refreshing}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Error message if any */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
            <button 
              onClick={() => fetchLeads()} 
              className="ml-auto text-sm text-red-700 hover:text-red-900 underline"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Leads table */}
        <div className={`bg-white shadow overflow-hidden rounded-lg mb-6 ${getContainerClass()}`}>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-[#153147]">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <Checkbox
                      checked={selectedLeads.length === filteredLeads.length && filteredLeads.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    S.No
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Nationality
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Contact Info
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Country
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Source
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Created At
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className={`bg-white divide-y divide-gray-200 ${getTableHeight()}`}>
                {paginatedLeads.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-4 text-center text-gray-500">
                      No leads found.
                    </td>
                  </tr>
                ) : (
                  paginatedLeads.map((lead, index) => (
                    <tr key={lead.id} className={selectedLeads.includes(lead.id) ? 'bg-indigo-50' : 'hover:bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Checkbox 
                          checked={selectedLeads.includes(lead.id)} 
                          onCheckedChange={() => handleSelectLead(lead.id)}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {startIndex + index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {lead.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {lead.nationality || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>
                          {lead.email && <div><span className="font-medium">Email:</span> {lead.email}</div>}
                          {lead.phone && <div><span className="font-medium">Phone:</span> {lead.phone}</div>}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {lead.interested_country || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <Badge variant="outline" className="capitalize">
                          {lead.lead_source || 'Unknown'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(lead.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <Button 
                          onClick={() => handleView(lead)} 
                          variant="ghost" 
                          size="sm" 
                          className="inline-flex items-center px-2 py-1 text-gray-700 hover:text-indigo-600"
                        >
                          <EyeIcon className="h-4 w-4 mr-1" /> View
                        </Button>
                        <Button 
                          onClick={() => handleEdit(lead)} 
                          variant="ghost" 
                          size="sm" 
                          className="inline-flex items-center px-2 py-1 text-gray-700 hover:text-indigo-600"
                        >
                          <PencilIcon className="h-4 w-4 mr-1" /> Edit
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-lg">
            <div className="flex flex-1 justify-between sm:hidden">
              <Button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                variant="outline"
                className="relative inline-flex items-center rounded-md px-4 py-2 text-sm font-medium"
              >
                Previous
              </Button>
              <Button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                variant="outline"
                className="relative ml-3 inline-flex items-center rounded-md px-4 py-2 text-sm font-medium"
              >
                Next
              </Button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
                  <span className="font-medium">
                    {Math.min(startIndex + itemsPerPage, filteredLeads.length)}
                  </span>{" "}
                  of <span className="font-medium">{filteredLeads.length}</span> results
                </p>
              </div>
              <div>
                <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                  <Button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    variant="outline"
                    className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                  >
                    <span className="sr-only">Previous</span>
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                    </svg>
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      variant={currentPage === page ? "default" : "outline"}
                      className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold focus:z-20 ${
                        currentPage === page
                          ? "z-10 bg-indigo-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                          : "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0"
                      }`}
                    >
                      {page}
                    </Button>
                  ))}
                  <Button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    variant="outline"
                    className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                  >
                    <span className="sr-only">Next</span>
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                    </svg>
                  </Button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {isAddModalOpen && (
        <AddLeadModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={handleAddSuccess}
        />
      )}

      {isEditModalOpen && selectedLead && (
        <EditLeadModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={handleEditSuccess}
          lead={selectedLead}
        />
      )}

      {isViewModalOpen && selectedLead && (
        <ViewLeadModal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          lead={selectedLead}
        />
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={() => setConfirmationModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmationModal.onConfirm}
        title={confirmationModal.title}
        message={confirmationModal.message}
        type={confirmationModal.type}
        confirmText={confirmationModal.confirmText}
      />
    </div>
  );
};

export default LeadList; 