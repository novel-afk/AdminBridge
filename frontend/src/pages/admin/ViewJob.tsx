import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

interface Branch {
  id: number;
  name: string;
  city: string;
  country: string;
}

interface Job {
  id: number;
  title: string;
  description: string;
  requirements: string;
  branch: Branch;
  branch_name: string;
  branch_location: string;
  job_type: string;
  is_active: boolean;
  created_by_name: string;
  created_at: string;
  updated_at: string;
}

const ViewJob = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchJob = async () => {
      try {
        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) {
          navigate('/login');
          return;
        }
        
        const response = await axios.get(`http://localhost:8000/api/jobs/${id}/`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        
        setJob(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching job:', err);
        setError('Failed to load job data. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchJob();
  }, [id, navigate]);
  
  const handleEditJob = () => {
    navigate(`/admin/jobs/edit/${id}`);
  };
  
  const handleBack = () => {
    navigate('/admin/jobs');
  };
  
  const formatDate = (dateString: string) => {
    try {
      const options: Intl.DateTimeFormatOptions = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (e) {
      return 'Invalid date';
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-6 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Loading job data...</h2>
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
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
              Back to Jobs
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  if (!job) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
          <div className="text-center text-gray-600">
            Job not found
          </div>
          <div className="flex justify-center mt-4">
            <button
              onClick={handleBack}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 transition-colors duration-300"
            >
              Back to Jobs
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
            <h1 className="text-2xl font-bold text-gray-800">View Job</h1>
            <p className="text-gray-600 mt-1">Detailed information about this job posting</p>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={handleBack}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 transition-colors duration-300"
            >
              Back
            </button>
            <button
              onClick={handleEditJob}
              className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 transition-colors duration-300"
            >
              Edit Job
            </button>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">
                {job.title}
              </h2>
              <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${
                job.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {job.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="mt-1 flex items-center">
              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                job.job_type === 'Full-Time' ? 'bg-green-100 text-green-800' :
                job.job_type === 'Part-Time' ? 'bg-blue-100 text-blue-800' :
                job.job_type === 'Contract' ? 'bg-yellow-100 text-yellow-800' :
                job.job_type === 'Internship' ? 'bg-purple-100 text-purple-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {job.job_type}
              </span>
              <span className="ml-2 text-sm text-gray-500">
                Posted on {formatDate(job.created_at)}
              </span>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-md font-medium text-gray-800 mb-3">Branch Information</h3>
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="text-gray-800"><span className="font-medium">Branch:</span> {job.branch_name}</p>
                  <p className="text-gray-800"><span className="font-medium">Location:</span> {job.branch_location}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-md font-medium text-gray-800 mb-3">Job Details</h3>
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="text-gray-800"><span className="font-medium">Job Type:</span> {job.job_type}</p>
                  <p className="text-gray-800"><span className="font-medium">Status:</span> {job.is_active ? 'Active' : 'Inactive'}</p>
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="text-md font-medium text-gray-800 mb-3">Job Description</h3>
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-gray-800 whitespace-pre-line">{job.description}</p>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="text-md font-medium text-gray-800 mb-3">Job Requirements</h3>
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-gray-800 whitespace-pre-line">{job.requirements}</p>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-md font-medium text-gray-800 mb-3">System Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <span className="text-gray-500 text-sm">Created By:</span>
                  <p className="text-gray-800">{job.created_by_name}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-sm">Created At:</span>
                  <p className="text-gray-800">{formatDate(job.created_at)}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-sm">Last Updated:</span>
                  <p className="text-gray-800">{formatDate(job.updated_at)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewJob; 