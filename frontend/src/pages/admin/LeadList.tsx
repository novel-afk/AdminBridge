import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import { 
  MagnifyingGlassIcon, 
  PlusIcon, 
  ArrowDownTrayIcon, 
  TrashIcon, 
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
      setSelectedLeads(paginatedLeads.map((lead) => lead.id));
    } else {
      setSelectedLeads([]);
    }
  };

  const handleExport = () => {
    showConfirmation({
      title: 'Export Leads Data',
      message: 'Are you sure you want to export the leads data?',
      type: 'warning',
      onConfirm: () => {
        // Create CSV content
        const headers = [
          "ID", 
          "Name", 
          "Email", 
          "Phone", 
          "Nationality", 
          "Interested Country", 
          "Interested Degree", 
          "Interested Course",
          "Language Test", 
          "Language Score",
          "Lead Source", 
          "Referred By",
          "Courses Studied",
          "GPA",
          "Branch", 
          "Assigned To",
          "Created At",
          "Notes"
        ];
        
        const csvRows = [];
        csvRows.push(headers.join(','));
        
        for (const lead of filteredLeads) {
          const row = [
            lead.id,
            `"${lead.name || ''}"`,
            `"${lead.email || ''}"`,
            `"${lead.phone || ''}"`,
            `"${lead.nationality || ''}"`,
            `"${lead.interested_country || ''}"`,
            `"${lead.interested_degree || ''}"`,
            `"${lead.interested_course || ''}"`,
            `"${lead.language_test || ''}"`,
            lead.language_score || '',
            `"${lead.lead_source || ''}"`,
            `"${lead.referred_by || ''}"`,
            `"${lead.courses_studied || ''}"`,
            lead.gpa || '',
            `"${lead.branch_name || ''}"`,
            `"${lead.assigned_to_name || ''}"`,
            `"${lead.created_at || ''}"`,
            `"${lead.notes?.replace(/"/g, '""') || ''}"`,
          ];
          csvRows.push(row.join(','));
        }
        
        const csvContent = csvRows.join('\n');
        
        // Create download link
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `leads_export_${new Date().toISOString().slice(0,10)}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      },
    });
  };

  const handleDeleteSelected = () => {
    showConfirmation({
      title: 'Delete Selected Leads',
      message: `Are you sure you want to delete ${selectedLeads.length} selected lead(s)? This action cannot be undone.`,
      type: 'danger',
      confirmText: 'Delete',
      onConfirm: async () => {
        const accessToken = localStorage.getItem('access_token');
        try {
          // Delete each selected lead
          for (const id of selectedLeads) {
            await axios.delete(`${API_BASE_URL}/leads/${id}/`, {
              headers: { Authorization: `Bearer ${accessToken}` }
            });
          }
          
          // Clear selection and refresh data
          setSelectedLeads([]);
          fetchLeads();
          
        } catch (err) {
          console.error('Error deleting leads:', err);
          setError('Failed to delete leads. Please try again.');
        }
      },
    });
  };

  const handleDeleteSingle = (lead: Lead) => {
    showConfirmation({
      title: 'Delete Lead',
      message: `Are you sure you want to delete ${lead.name}? This action cannot be undone.`,
      type: 'danger',
      confirmText: 'Delete',
      onConfirm: async () => {
        const accessToken = localStorage.getItem('access_token');
        try {
          await axios.delete(`${API_BASE_URL}/leads/${lead.id}/`, {
            headers: { Authorization: `Bearer ${accessToken}` }
          });
          
          // Refresh data after deletion
          fetchLeads();
          
        } catch (err) {
          console.error('Error deleting lead:', err);
          setError('Failed to delete lead. Please try again.');
        }
      },
    });
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
    console.log("Lead added successfully!");
    showConfirmation({
      title: 'Lead Added Successfully',
      message: 'The new lead has been added to the system.',
      type: 'success',
      confirmText: 'OK',
      onConfirm: () => {
        setIsAddModalOpen(false);
        // Refresh the lead list
        fetchLeads(true);
      },
    });
  };

  const handleEditSuccess = () => {
    showConfirmation({
      title: 'Lead Updated Successfully',
      message: 'The lead information has been updated.',
      type: 'success',
      confirmText: 'OK',
      onConfirm: () => {
        setIsEditModalOpen(false);
        setSelectedLead(null);
        // Refresh the lead list
        fetchLeads();
      },
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-none pb-6">
        <h1 className="text-2xl font-bold mb-6 text-[#153147] px-4 py-2 rounded-md">Leads</h1>

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
            <Button 
              onClick={handleDeleteSelected} 
              disabled={selectedLeads.length === 0 || refreshing}
              className="bg-red-50 text-red-600 hover:bg-red-100 flex items-center gap-2"
              variant="ghost"
            >
              <TrashIcon className="h-5 w-5" />
              Delete
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

      <div className={`flex-1 flex flex-col ${getContainerClass()}`}>
        {leads.length === 0 ? (
          <div className="h-full bg-white rounded-lg border border-gray-200 flex items-center justify-center">
            <div className="text-center p-8 max-w-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="text-gray-600 mb-4 text-lg">No leads found.</p>
              <p className="text-gray-500 mb-6">Start by adding your first lead to the system.</p>
              <Button 
                onClick={() => setIsAddModalOpen(true)} 
                className="bg-[#153147] hover:bg-[#1e1b4b]/90"
              >
                Add Your First Lead
              </Button>
            </div>
          </div>
        ) : (
          <div className={`h-full bg-white rounded-lg border border-gray-200 overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-200 flex flex-col`}>
            <div className={`relative flex-1 overflow-hidden ${getTableHeight()}`}>
              <div className="absolute inset-0 overflow-auto">
                <div className="inline-block min-w-full max-w-full">
                  <table className="w-full border-collapse table-auto">
                    <thead className="bg-[#153147] sticky top-0 z-10 shadow-sm">
                      <tr>
                        {columns.map((column) => (
                          <th
                            key={column.key}
                            scope="col"
                            className={`px-6 py-4 text-left text-sm font-medium text-white first:pl-4 last:pr-4 
                            ${column.key === "select" ? "min-w-[40px] w-10" : 
                              column.key === "sNo" ? "min-w-[60px] w-16" :
                              column.key === "name" ? "min-w-[160px]" :
                              column.key === "nationality" ? "min-w-[120px]" :
                              column.key === "contact" ? "min-w-[180px]" :
                              column.key === "interestedCountry" ? "min-w-[120px]" :
                              column.key === "interestedDegree" ? "min-w-[120px]" :
                              column.key === "interestedCourse" ? "min-w-[120px]" :
                              column.key === "language" ? "min-w-[130px]" :
                              column.key === "source" ? "min-w-[120px]" :
                              column.key === "createdBy" ? "min-w-[160px]" :
                              column.key === "assignedTo" ? "min-w-[160px]" :
                              column.key === "createdAt" ? "min-w-[150px]" :
                              column.key === "actions" ? "min-w-[100px] w-24" : ""
                            }`}
                            style={{ position: 'sticky', top: 0 }}
                          >
                            {column.key === "select" ? (
                              <Checkbox
                                checked={paginatedLeads.length > 0 && selectedLeads.length === paginatedLeads.length}
                                onCheckedChange={handleSelectAll}
                                aria-label="Select all"
                              />
                            ) : (
                              column.label
                            )}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className={`divide-y divide-gray-100`}>
                      {paginatedLeads.map((lead, index) => (
                        <tr 
                          key={lead.id} 
                          className="hover:bg-gray-50 transition-all duration-200 ease-in-out group relative even:bg-gray-50/30"
                        >
                          <td className="px-6 py-4 whitespace-nowrap first:pl-4 group-hover:bg-gray-50 transition-colors duration-200">
                            <Checkbox
                              checked={selectedLeads.includes(lead.id)}
                              onCheckedChange={() => handleSelectLead(lead.id)}
                              aria-label={`Select ${lead.name}`}
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 group-hover:bg-gray-50 transition-colors duration-200">
                            {startIndex + index + 1}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 font-medium group-hover:bg-gray-50 transition-colors duration-200 truncate max-w-[200px]" title={lead.name}>
                            {lead.name}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 group-hover:bg-gray-50 transition-colors duration-200 truncate max-w-[150px]" title={lead.nationality}>
                            {lead.nationality}
                          </td>
                          <td className="px-6 py-4 text-sm group-hover:bg-gray-50 transition-colors duration-200">
                            <div className="truncate max-w-[180px]" title={lead.email}>
                              <a href={`mailto:${lead.email}`} className="text-blue-600 hover:text-blue-800 transition-colors truncate inline-block max-w-full">
                                {lead.email}
                              </a>
                            </div>
                            <div className="text-gray-600">{lead.phone}</div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 group-hover:bg-gray-50 transition-colors duration-200">
                            {lead.interested_country ? (
                              <Badge className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                                {lead.interested_country}
                              </Badge>
                            ) : "-"}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 group-hover:bg-gray-50 transition-colors duration-200">
                            {lead.interested_degree ? (
                              <Badge className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                                {lead.interested_degree}
                              </Badge>
                            ) : "-"}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 group-hover:bg-gray-50 transition-colors duration-200">
                            {lead.interested_course ? (
                              <div className="truncate max-w-[150px]" title={lead.interested_course}>
                                {lead.interested_course}
                              </div>
                            ) : "-"}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 group-hover:bg-gray-50 transition-colors duration-200">
                            <div>{lead.language_test || "None"}</div>
                            {lead.language_score && (
                              <div className="text-sm font-medium">Score: {lead.language_score}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap group-hover:bg-gray-50 transition-colors duration-200">
                            <Badge 
                              variant="outline"
                              className={`
                                px-3 py-1 rounded-full text-xs font-medium transition-colors duration-200
                                ${lead.lead_source === 'Website' ? 'bg-blue-100 text-blue-800 border-blue-200' : 
                                lead.lead_source === 'Social Media' ? 'bg-purple-100 text-purple-800 border-purple-200' : 
                                lead.lead_source === 'Referral' ? 'bg-green-100 text-green-800 border-green-200' : 
                                lead.lead_source === 'Walk-in' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : 
                                lead.lead_source === 'Phone Inquiry' ? 'bg-orange-100 text-orange-800 border-orange-200' : 
                                lead.lead_source === 'Email' ? 'bg-indigo-100 text-indigo-800 border-indigo-200' : 
                                lead.lead_source === 'Event' ? 'bg-pink-100 text-pink-800 border-pink-200' : 
                                'bg-gray-100 text-gray-800 border-gray-200'}
                              `}
                            >
                              {lead.lead_source}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 group-hover:bg-gray-50 transition-colors duration-200 truncate max-w-[160px]" title={lead.created_by_name}>
                            {lead.created_by_name}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 group-hover:bg-gray-50 transition-colors duration-200 truncate max-w-[160px]" title={lead.assigned_to_name}>
                            {lead.assigned_to_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 group-hover:bg-gray-50 transition-colors duration-200">
                            {formatDate(lead.created_at)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 last:pr-4 group-hover:bg-gray-50 transition-colors duration-200">
                            <div className="flex items-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity duration-200">
                              <button
                                onClick={() => handleView(lead)}
                                className="text-blue-600 hover:text-blue-800 transition-colors p-1 hover:bg-blue-50 rounded-full"
                                title="View"
                                disabled={refreshing}
                              >
                                <EyeIcon className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => handleEdit(lead)}
                                className="text-green-600 hover:text-green-800 transition-colors p-1 hover:bg-green-50 rounded-full"
                                title="Edit"
                                disabled={refreshing}
                              >
                                <PencilIcon className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => handleDeleteSingle(lead)}
                                className="text-red-600 hover:text-red-800 transition-colors p-1 hover:bg-red-50 rounded-full"
                                title="Delete"
                                disabled={refreshing}
                              >
                                <TrashIcon className="h-5 w-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            {totalPages > 1 && (
              <div className="flex-shrink-0 border-t border-gray-200 px-6 py-4 flex items-center justify-between shadow-md bg-white">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed rounded border border-gray-200 hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  {totalPages > 5 && currentPage > 3 && (
                    <>
                      <button
                        onClick={() => setCurrentPage(1)}
                        className="px-3 py-1.5 rounded-md text-sm font-medium text-gray-600 hover:text-gray-800 border border-gray-200 hover:bg-gray-50"
                      >
                        1
                      </button>
                      <span className="text-gray-500">...</span>
                    </>
                  )}
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return pageNum;
                  }).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium border ${
                        currentPage === page
                          ? 'bg-[#1e1b4b] text-white border-[#1e1b4b]'
                          : 'text-gray-600 hover:text-gray-800 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <>
                      <span className="text-gray-500">...</span>
                      <button
                        onClick={() => setCurrentPage(totalPages)}
                        className="px-3 py-1.5 rounded-md text-sm font-medium text-gray-600 hover:text-gray-800 border border-gray-200 hover:bg-gray-50"
                      >
                        {totalPages}
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed rounded border border-gray-200 hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
                <div className="text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-md border border-gray-200">
                  Showing {Math.min(filteredLeads.length, startIndex + 1)}-
                  {Math.min(startIndex + itemsPerPage, filteredLeads.length)} of {filteredLeads.length} leads
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      <AddLeadModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleAddSuccess}
      />
      
      <EditLeadModal 
        isOpen={isEditModalOpen} 
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedLead(null);
        }}
        onSuccess={handleEditSuccess}
        lead={selectedLead}
      />
      
      <ViewLeadModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedLead(null);
        }}
        lead={selectedLead}
      />
      
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={() => setConfirmationModal({ ...confirmationModal, isOpen: false })}
        title={confirmationModal.title}
        message={confirmationModal.message}
        onConfirm={confirmationModal.onConfirm}
        type={confirmationModal.type}
        confirmText={confirmationModal.confirmText}
      />
    </div>
  );
};

export default LeadList; 