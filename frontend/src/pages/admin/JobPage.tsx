import { useState, useEffect } from "react"
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
      
      // Make API call to backend
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
          
          // Refresh data after deletion
          fetchJobs();
          
        } catch (err) {
          console.error('Error deleting job:', err);
          setError('Failed to delete job. Please try again.');
        }
      },
    })
  }

  const handleView = (job: Job) => {
    setSelectedJob(job)
    setIsViewModalOpen(true)
  }

  const handleEdit = (job: Job) => {
    setSelectedJob(job)
    setIsEditModalOpen(true)
  }

  const handleEditSuccess = () => {
    showConfirmation({
      title: 'Job Updated Successfully',
      message: 'The job listing has been updated.',
      type: 'success',
      confirmText: 'OK',
      onConfirm: () => {
        setIsEditModalOpen(false)
        setSelectedJob(null)
        // Refresh the jobs
        fetchJobs();
      },
    });
  }

  const handleAddSuccess = () => {
    showConfirmation({
      title: 'Job Added Successfully',
      message: 'The new job listing has been created.',
      type: 'success',
      confirmText: 'OK',
      onConfirm: () => {
        setIsAddModalOpen(false)
        // Refresh the jobs
        fetchJobs(true);
      },
    });
  }

  const handleExport = () => {
    showConfirmation({
      title: 'Export Jobs Data',
      message: 'Are you sure you want to export the jobs data?',
      type: 'warning',
      onConfirm: () => {
        // Create CSV content
        const headers = [
          "ID", 
          "Title", 
          "Department", 
          "Location", 
          "Status", 
          "Type", 
          "Salary Range", 
          "Posted Date",
          "Created By"
        ];
        
        const csvRows = [];
        csvRows.push(headers.join(','));
        
        for (const job of filteredJobs) {
          const row = [
            job.id,
            `"${job.title || ''}"`,
            `"${job.branch_name || ''}"`,
            `"${job.branch_location || ''}"`,
            `"${job.is_active ? 'Active' : 'Inactive'}"`,
            `"${job.job_type || ''}"`,
            `"${job.salary_range || ''}"`,
            `"${formatDate(job.created_at) || ''}"`,
            `"${job.created_by_name || ''}"`,
          ];
          csvRows.push(row.join(','));
        }
        
        const csvContent = csvRows.join('\n');
        
        // Create download link
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `jobs_export_${new Date().toISOString().slice(0,10)}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      },
    })
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Get status badge info from is_active field
  const getJobStatus = (isActive: boolean) => {
    return isActive ? 'Open' : 'Closed';
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-none pb-6">
        <h1 className="text-2xl font-bold text-gray-800">Jobs</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your job listings</p>

        <div className="flex justify-between items-center mt-8">
          <Button 
            onClick={() => setIsAddModalOpen(true)} 
            className="bg-[#1e1b4b] hover:bg-[#1e1b4b]/90 text-white px-4 py-2 rounded-md flex items-center gap-2"
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
            <Button 
              onClick={handleDelete} 
              disabled={selectedJobs.length === 0 || refreshing}
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

      {loading ? (
        <div className="flex-1 flex justify-center items-center bg-white rounded-lg border border-gray-200">
          <div className="text-center">
            <div className="animate-spin h-10 w-10 border-4 border-[#1e1b4b] border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Loading jobs...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-8">
          {filteredJobs.length === 0 ? (
            <div className="col-span-3 bg-white rounded-lg border border-gray-200 flex items-center justify-center p-12">
              <div className="text-center max-w-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <p className="text-gray-600 mb-4 text-lg">No jobs found</p>
                <p className="text-gray-500 mb-6">Start by adding your first job listing</p>
                <Button 
                  onClick={() => setIsAddModalOpen(true)} 
                  className="bg-[#1e1b4b] hover:bg-[#1e1b4b]/90"
                >
                  Add Your First Job
                </Button>
              </div>
            </div>
          ) : (
            <>
              {filteredJobs.map((job) => (
                <div 
                  key={job.id}
                  className="group relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300 border border-gray-100"
                >
                  {/* Checkbox for selection */}
                  <div className="absolute top-3 left-3 z-10">
                    <Checkbox
                      checked={selectedJobs.includes(job.id)}
                      onCheckedChange={() => handleSelectJob(job.id)}
                      className="data-[state=checked]:bg-[#1e1b4b] data-[state=checked]:border-[#1e1b4b]"
                      aria-label={`Select ${job.title}`}
                    />
                  </div>

                  {/* Status Indicator */}
                  <div 
                    className={`absolute top-0 left-0 w-full h-1 ${
                      job.is_active 
                        ? 'bg-gradient-to-r from-[#1e1b4b]/60 via-[#1e1b4b] to-[#1e1b4b]/60'
                        : 'bg-gradient-to-r from-red-400/80 via-red-500 to-red-400/80'
                    }`}
                  />

                  <div className="p-5">
                    {/* Header */}
                    <div className="flex justify-between items-start">
                      <div className="pl-7">
                        <h3 className="text-base font-semibold text-gray-900 group-hover:text-[#1e1b4b] transition-colors line-clamp-1">
                          {job.title}
                        </h3>
                        <Badge 
                          variant="outline" 
                          className={`mt-1.5 text-xs ${
                            job.is_active
                              ? 'bg-[#1e1b4b]/5 text-[#1e1b4b] border-[#1e1b4b]/20'
                              : 'bg-red-50 text-red-700 border-red-200'
                          }`}
                        >
                          {job.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-[#1e1b4b] hover:text-[#1e1b4b] hover:bg-[#1e1b4b]/5 rounded-lg"
                          onClick={() => handleView(job)}
                          title="View Details"
                        >
                          <EyeIcon className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-[#1e1b4b] hover:text-[#1e1b4b] hover:bg-[#1e1b4b]/5 rounded-lg"
                          onClick={() => handleEdit(job)}
                          title="Edit Job"
                        >
                          <PencilIcon className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg"
                          onClick={() => handleDeleteSingle(job)}
                          title="Delete Job"
                        >
                          <TrashIcon className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>

                    {/* Branch and Location Info */}
                    <div className="mt-4 pl-7 space-y-2">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-[#1e1b4b]/5 flex items-center justify-center">
                          <BriefcaseIcon className="h-3.5 w-3.5 text-[#1e1b4b]" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{job.branch_name}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{job.job_type}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-[#1e1b4b]/5 flex items-center justify-center">
                          <MapPinIcon className="h-3.5 w-3.5 text-[#1e1b4b]" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm text-gray-500 truncate">{job.branch_location}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Selection overlay */}
                  {selectedJobs.includes(job.id) && (
                    <div className="absolute inset-0 bg-[#1e1b4b]/5 pointer-events-none" />
                  )}
                </div>
              ))}
            </>
          )}
        </div>
      )}

      <ViewJobModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false)
          setSelectedJob(null)
        }}
        job={selectedJob}
      />
      <EditJobModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedJob(null)
        }}
        onSuccess={handleEditSuccess}
        job={selectedJob}
      />
      <AddJobModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleAddSuccess}
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
  )
} 