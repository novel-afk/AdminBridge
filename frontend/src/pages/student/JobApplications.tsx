import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, ArrowLeft, FileText, Building, Calendar } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { StudentLayout } from '../../components/Layout';
import { jobAPI } from '../../lib/api';
import { useAuth } from '../../lib/AuthContext';

interface JobApplication {
  id: number;
  job: {
    id: number;
    title: string;
    department: string;
    branch: {
      name: string;
    };
  };
  status: string;
  created_at: string;
  resume: string;
  cover_letter: string;
}

const JobApplications: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  useEffect(() => {
    const fetchMyApplications = async () => {
      try {
        setLoading(true);
        // Here we would ideally have an endpoint to get applications by student ID or user ID
        // For demo purposes, we're using getAllResponses and filtering client-side
        const response = await jobAPI.getAllResponses();
        
        // In a real implementation, you'd have a backend endpoint for this
        // This is just for demo purposes - student email matching
        const myApplications = response.data.filter((app: any) => 
          app.email === user?.email
        );
        
        setApplications(myApplications);
      } catch (error) {
        console.error('Error fetching applications:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMyApplications();
  }, [user?.email]);
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'shortlisted':
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Accepted
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200 flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Pending
          </Badge>
        );
    }
  };
  
  const filteredApplications = applications.filter(app => 
    app.job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.job.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.job.branch.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <StudentLayout>
      <div className="container mx-auto px-6 py-12">
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-6">
            <Button 
              variant="outline"
              onClick={() => navigate('/student/jobs')}
              className="h-9"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Jobs
            </Button>
            <h1 className="text-2xl font-bold text-gray-800">My Applications</h1>
          </div>
          
          {/* Search input */}
          <div className="relative w-full md:w-72">
            <Input
              type="text"
              placeholder="Search job applications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            <svg 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"
              fill="none" 
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
              />
            </svg>
          </div>
        </div>
        
        {loading ? (
          <div className="text-center py-16">
            <p className="text-gray-500">Loading your applications...</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="mx-auto h-16 w-16 mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-700">No Applications Found</h3>
            <p className="text-gray-500 mt-2 mb-6">You haven't applied to any jobs yet.</p>
            <Button onClick={() => navigate('/student/jobs')}>
              View Available Jobs
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredApplications.map((application) => (
              <div key={application.id} className="bg-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow duration-200">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-semibold text-lg text-gray-800">{application.job.title}</h3>
                    {getStatusBadge(application.status)}
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Building className="h-4 w-4 mr-2 text-gray-400" />
                      <span>{application.job.branch.name}</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      <span>Applied on {formatDate(application.created_at)}</span>
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="w-full"
                    onClick={() => navigate(`/student/jobs/${application.job.id}`)}
                  >
                    View Job Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </StudentLayout>
  );
};

export default JobApplications; 