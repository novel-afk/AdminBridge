import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, ArrowLeft, Building } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { StudentLayout } from '../../components/Layout';

const JobApplications: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  // Sample job applications with only accepted/rejected statuses
  const sampleApplications = [
    {
      id: 1,
      title: "Marketing Intern",
      company: "Sydney Branch",
      status: "accepted"
    },
    {
      id: 2,
      title: "Administrative Assistant",
      company: "Melbourne Office",
      status: "rejected"
    }
  ];
  
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
      <div className="container mx-auto px-6 py-12">
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sampleApplications.map((application) => (
            <div 
              key={application.id} 
              className="bg-white rounded-xl border-2 border-gray-200 shadow-2xl hover:shadow-2xl transition-all duration-300"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                  <div>
                    <h3 className="font-bold text-xl text-gray-800 mb-1">{application.title}</h3>
                    <div className="flex items-center text-gray-600">
                      <Building className="h-4 w-4 mr-2 text-gray-400" />
                      <span>{application.company}</span>
                    </div>
                  </div>
                  {getStatusBadge(application.status)}
                </div>
                
                <div className="text-gray-700">
                  {application.status === 'accepted' ? (
                    <p>Congratulations! Your application has been accepted. You will receive further instructions from the branch manager soon.</p>
                  ) : (
                    <p>We appreciate your interest, but your application was not selected for this position. We encourage you to apply for other opportunities.</p>
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
          ))}
        </div>
      </div>
    </StudentLayout>
  );
};

export default JobApplications;