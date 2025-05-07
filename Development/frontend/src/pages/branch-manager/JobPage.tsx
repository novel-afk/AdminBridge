import React, { useState, useEffect } from "react"
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  ArrowDownTrayIcon, 
  TrashIcon, 
  EyeIcon, 
  PencilIcon,
  MapPinIcon,
  BriefcaseIcon 
} from '@heroicons/react/24/outline';
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Checkbox } from "../../components/ui/checkbox"
import { Badge } from "../../components/ui/badge"
import ConfirmationModal from "../../components/ConfirmationModal"
import ViewJobModal from "../../components/ViewJobModal"
import EditJobModal from "../../components/EditJobModal"
import AddJobModal from "../../components/AddJobModal"

interface Job {
  id: number;
  title: string;
  description: string;
  requirements: string;
  branch: number;
  branch_name: string;
  branch_location: string;
  job_type: string;
  salary_range: string;
  is_active: boolean;
  created_by: number;
  created_by_name: string;
  created_at: string;
  updated_at: string;
}

export default function JobPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedJobs, setSelectedJobs] = useState<number[]>([])
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate();

  // API base URL
  const API_BASE_URL = 'http://localhost:8000/api';

  // Confirmation modal states
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'success' as 'success' | 'warning' | 'danger',
    confirmText: 'Confirm'
  })

  const showConfirmation = (config: Partial<typeof confirmationModal>) => {
    setConfirmationModal({
      ...confirmationModal,
      isOpen: true,
      ...config,
    })
  }

  // Format job data
  const formatJobData = (job: any): Job => {
    return {
      ...job,
      created_by_name: job.created_by_name || 'System'
    };
  };

  // Fetch jobs from API
  const fetchJobs = async (showRefreshing = false) => {
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
      
      // Make API call to backend - already filtered by branch in backend
      const response = await axios.get(`${API_BASE_URL}/jobs/`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      
      console.log('API Response:', response.data);
      
      // Handle different response formats
      let jobData: any[] = [];
      if (Array.isArray(response.data)) {
        jobData = response.data;
      } else if (response.data.results && Array.isArray(response.data.results)) {
        jobData = response.data.results;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        jobData = response.data.data;
      }
      
      // Format the job data 
      const formattedJobs = jobData.map(formatJobData);
          
      setJobs(formattedJobs);
      setLoading(false);
      setRefreshing(false);
    } catch (err: any) {
      console.error('Error fetching jobs:', err);
      setError(err.response?.data?.detail || 'Failed to fetch jobs. Please try again.');
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load jobs on mount
  useEffect(() => {
    // Check if user is logged in
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      navigate('/login');
      return;
    }

    fetchJobs();
  }, [navigate]);

  const filteredJobs = jobs.filter((job) =>
    Object.values(job).some((value) => 
      value && typeof value === 'string' && 
      value.toLowerCase().includes(searchQuery.toLowerCase())
    )
  )

  const handleSelectJob = (id: number) => {
    setSelectedJobs((prev) => {
      if (prev.includes(id)) {
        return prev.filter((jobId) => jobId !== id)
      } else {
        return [...prev, id]
      }
    })
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedJobs(filteredJobs.map((job) => job.id))
    } else {
      setSelectedJobs([])
    }
  }

  const handleDelete = () => {
    showConfirmation({
      title: 'Delete Selected Jobs',
      message: `Are you sure you want to delete ${selectedJobs.length} selected job(s)? This action cannot be undone.`,
      type: 'danger',
      confirmText: 'Delete',
      onConfirm: async () => {
        const accessToken = localStorage.getItem('access_token');
        try {
          // Delete each selected job
          for (const id of selectedJobs) {
            await axios.delete(`${API_BASE_URL}/jobs/${id}/`, {
              headers: { Authorization: `Bearer ${accessToken}` }
            });
          }
          
          // Clear selection and refresh data
          setSelectedJobs([]);
          fetchJobs();
          
        } catch (err) {
          console.error('Error deleting jobs:', err);
          setError('Failed to delete jobs. Please try again.');
        }
      },
    })
  }

  const handleDeleteSingle = (job: Job) => {
    showConfirmation({
      title: 'Delete Job',
      message: `Are you sure you want to delete ${job.title}? This action cannot be undone.`,
      type: 'danger',
      confirmText: 'Delete',
      onConfirm: async () => {
        const accessToken = localStorage.getItem('access_token');
        try {
          await axios.delete(`${API_BASE_URL}/jobs/${job.id}/`, {
            headers: { Authorization: `Bearer ${accessToken}` }
          });
          
          fetchJobs();
          
        } catch (err) {
          console.error('Error deleting job:', err);
          setError('Failed to delete job. Please try again.');
        }
      },
    })
  }

  const handleView = (job: Job) => {
    setSelectedJob(job);
    setIsViewModalOpen(true);
  }

  const handleEdit = (job: Job) => {
    setSelectedJob(job);
    setIsEditModalOpen(true);
  }

  const handleEditSuccess = () => {
    setIsEditModalOpen(false);
    showConfirmation({
      title: 'Job Updated',
      message: 'The job has been updated successfully.',
      type: 'success',
      confirmText: 'OK',
      onConfirm: () => {
        fetchJobs(true);
      }
    });
  }

  const handleAddSuccess = () => {
    setIsAddModalOpen(false);
    showConfirmation({
      title: 'Job Created',
      message: 'The job has been created successfully.',
      type: 'success',
      confirmText: 'OK',
      onConfirm: () => {
        fetchJobs(true);
      }
    });
  }

  const handleExport = () => {
    const exportData = selectedJobs.length > 0
      ? filteredJobs.filter(job => selectedJobs.includes(job.id))
      : filteredJobs;

    // Create CSV content
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Headers
    const headers = [
      "Title", "Branch", "Location", "Type", 
      "Salary Range", "Status", "Created By", "Created At"
    ];
    csvContent += headers.join(",") + "\n";
    
    // Data rows
    exportData.forEach(job => {
      const row = [
        `"${job.title || ''}"`,
        `"${job.branch_name || ''}"`,
        `"${job.branch_location || ''}"`,
        `"${job.job_type || ''}"`,
        `"${job.salary_range || ''}"`,
        `"${job.is_active ? 'Active' : 'Inactive'}"`,
        `"${job.created_by_name || ''}"`,
        `"${formatDate(job.created_at) || ''}"`,
      ];
      csvContent += row.join(",") + "\n";
    });
    
    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "jobs_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch (e) {
      return 'Invalid date';
    }
  };

  const getJobStatus = (isActive: boolean) => {
    return isActive ? (
      <Badge className="bg-green-100 text-green-800 border-green-300">Active</Badge>
    ) : (
      <Badge variant="outline" className="text-gray-500">Inactive</Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-none pb-6">
          <h1 className="text-2xl font-bold text-gray-800">Jobs</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your job listings</p>
        </div>
        
        <div className="flex-1 flex justify-center items-center">
          <div className="bg-white rounded-lg shadow-md p-8 flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1e1b4b] mb-4"></div>
            <div className="text-xl text-gray-600">Loading jobs...</div>
            <p className="text-sm text-gray-500 mt-2">Please wait while we fetch the data</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
     

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex-none pb-6">
          <h1 className="text-2xl font-bold text-gray-800">Jobs</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your job listings</p>

          <div className="flex justify-between items-center mt-8">
            <Button 
              onClick={() => setIsAddModalOpen(true)} 
              className="bg-[#153147] hover:bg-[#1e1b4b]/90 text-white px-4 py-2 rounded-md flex items-center gap-2"
              disabled={refreshing}
            >
              <PlusIcon className="h-5 w-5" />
              Add Job
            </Button>

            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => fetchJobs(true)}
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
                disabled={filteredJobs.length === 0 || refreshing}
                className="flex items-center gap-2 text-gray-700 hover:bg-gray-100"
              >
                <ArrowDownTrayIcon className="h-5 w-5" />
                Export
              </Button>
              {selectedJobs.length > 0 && (
                <Button 
                  onClick={handleDelete} 
                  disabled={selectedJobs.length === 0 || refreshing}
                  className="bg-red-50 text-red-600 hover:bg-red-100 flex items-center gap-2"
                  variant="ghost"
                >
                  <TrashIcon className="h-5 w-5" />
                  Delete
                </Button>
              )}
              <div className="relative ml-2">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                <Input
                  type="text"
                  placeholder="Search jobs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-[300px] bg-white rounded-md border-gray-300 focus:border-[#1e1b4b] focus:ring-1 focus:ring-[#1e1b4b] transition-all duration-200"
                  disabled={refreshing}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
            <button 
              onClick={() => fetchJobs()} 
              className="ml-auto text-sm text-red-700 hover:text-red-900 underline"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Jobs table */}
        <div className="bg-[#153147] shadow overflow-hidden rounded-lg mb-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-[#153147]">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    <Checkbox
                      checked={selectedJobs.length === filteredJobs.length && filteredJobs.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Title</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Location</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Type</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Salary</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Created</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredJobs.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-4 whitespace-nowrap text-center text-gray-500">
                      No jobs found.
                    </td>
                  </tr>
                ) : (
                  filteredJobs.map((job) => (
                    <tr key={job.id} className={selectedJobs.includes(job.id) ? 'bg-indigo-50' : 'hover:bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Checkbox 
                          checked={selectedJobs.includes(job.id)} 
                          onCheckedChange={() => handleSelectJob(job.id)}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{job.title}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          <div className="flex items-center">
                            <MapPinIcon className="h-4 w-4 mr-1 text-gray-400" /> 
                            {job.branch_location || job.branch_name || 'Unknown'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          <div className="flex items-center">
                            <BriefcaseIcon className="h-4 w-4 mr-1 text-gray-400" /> 
                            {job.job_type || 'Not specified'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {job.salary_range || 'Not specified'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getJobStatus(job.is_active)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(job.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <Button 
                          onClick={() => handleView(job)} 
                          variant="ghost" 
                          size="sm" 
                          className="inline-flex items-center px-2 py-1 text-gray-700 hover:text-indigo-600"
                        >
                          <EyeIcon className="h-4 w-4 mr-1" /> View
                        </Button>
                        <Button 
                          onClick={() => handleEdit(job)} 
                          variant="ghost" 
                          size="sm" 
                          className="inline-flex items-center px-2 py-1 text-gray-700 hover:text-indigo-600"
                        >
                          <PencilIcon className="h-4 w-4 mr-1" /> Edit
                        </Button>
                        <Button 
                          onClick={() => handleDeleteSingle(job)} 
                          variant="ghost" 
                          size="sm" 
                          className="inline-flex items-center px-2 py-1 text-gray-700 hover:text-red-600"
                        >
                          <TrashIcon className="h-4 w-4 mr-1" /> Delete
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modals */}
      {isAddModalOpen && (
        <AddJobModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={handleAddSuccess}
        />
      )}

      {isEditModalOpen && selectedJob && (
        <EditJobModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={handleEditSuccess}
          job={selectedJob}
        />
      )}

      {isViewModalOpen && selectedJob && (
        <ViewJobModal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          job={selectedJob}
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
  )
} 