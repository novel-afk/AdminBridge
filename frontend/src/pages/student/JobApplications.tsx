import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, ArrowLeft, Building } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { StudentLayout } from '../../components/Layout';
import axios from 'axios';

const JobApplications: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) {
          setError('You are not authenticated');
          setLoading(false);
          return;
        }
        const response = await axios.get('http://localhost:8000/api/my-job-applications/', {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        setApplications(response.data);
      } catch (err: any) {
        setError('Failed to fetch job applications');
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'accepted':
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200 flex items-center gap-1 px-3 py-1">
            <CheckCircle className="h-4 w-4 mr-1" />
            Accepted
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200 flex items-center gap-1 px-3 py-1">
            <XCircle className="h-4 w-4 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <StudentLayout>
      <div className="container mx-auto px-6">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Button 
              variant="outline"
              onClick={() => navigate('/student/jobs')}
              className="h-9"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Jobs
            </Button>
            <h1 className="text-2xl font-bold text-[#153147]">Application Status</h1>
          </div>
          
          <p className="text-gray-600 mb-6">
            See the status of your job applications reviewed by branch managers or administrators.
          </p>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
              {error}
            </div>
          )}
        </div>
        
        {loading ? (
          <div className="text-center text-gray-500">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {applications.length === 0 ? (
              <div className="col-span-2 text-center text-gray-500">No job applications found.</div>
            ) : (
              applications.map((application) => (
                <div 
                  key={application.id} 
                  className="bg-white rounded-xl border-2 border-gray-200 shadow-2xl hover:shadow-2xl transition-all duration-300"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-6 border-b pb-4">
                      <div>
                        <h3 className="font-bold text-xl text-gray-800 mb-1">{application.job_title}</h3>
                        <div className="flex items-center text-gray-600">
                          <Building className="h-4 w-4 mr-2 text-gray-400" />
                          <span>{application.job.branch_name || application.job_title}</span>
                        </div>
                      </div>
                      {getStatusBadge(application.status)}
                    </div>
                    
                    <div className="text-gray-700">
                      {application.status.toLowerCase() === 'accepted' ? (
                        <p>Congratulations! Your application has been accepted. You will receive further instructions from the branch manager soon.</p>
                      ) : application.status.toLowerCase() === 'rejected' ? (
                        <p>We appreciate your interest, but your application was not selected for this position. We encourage you to apply for other opportunities.</p>
                      ) : (
                        <p>Your application is under review.</p>
                      )}
                    </div>
                    
                    <div className="mt-6">
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => navigate('/student/jobs')}
                      >
                        View More Jobs
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </StudentLayout>
  );
};

export default JobApplications; 