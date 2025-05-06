import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Briefcase, ArrowLeft, Building, FileText, DollarSign } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { StudentLayout } from '../../components/Layout';
import JobApplicationModal from '../../components/student/JobApplicationModal';
import { jobAPI } from '../../lib/api';

interface Job {
  id: number;
  title: string;
  description: string;
  requirements: string;
  job_type: string;
  salary_range: string;
  is_active: boolean;
  branch: {
    name: string;
    city: string;
    country: string;
  };
  created_at: string;
  created_by: {
    first_name: string;
    last_name: string;
  };
}

const JobDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showApplyForm, setShowApplyForm] = useState<boolean>(false);

  useEffect(() => {
    const fetchJobDetail = async () => {
      try {
        setLoading(true);
        const response = await jobAPI.getById(parseInt(id || '0'));
        setJob(response.data);
      } catch (error) {
        console.error('Error fetching job details:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchJobDetail();
    }
  }, [id]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <StudentLayout>
      <div className="container mx-auto px-6 py-12">
        {loading ? (
          <div className="text-center py-12">Loading job details...</div>
        ) : !job ? (
          <div className="text-center py-12">
            <p>Job not found or has been removed.</p>
            <Button 
              variant="outline"
              className="mt-4"
              onClick={() => navigate('/student/jobs')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Jobs
            </Button>
          </div>
        ) : (
          <div className="flex flex-col">
            <div className="mb-6">
              <div className="flex gap-3">
                <Button 
                  variant="outline"
                  className="mb-4"
                  onClick={() => navigate('/student/jobs')}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Jobs
                </Button>
                
                <Button 
                  variant="outline"
                  className="mb-4"
                  onClick={() => navigate('/student/applications')}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  My Applications
                </Button>
              </div>
              
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold text-[#153147] mb-2">{job.title}</h1>
                  <p className="text-[#ADB8BB] mb-4">{job.branch.name}</p>
                </div>
                <Badge className="bg-green-100 text-green-800 border-0 text-sm px-3 py-1">
                  {job.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>
            
            <div className="bg-white rounded-xl border border-gray-200 p-8 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Building className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-700">{job.branch.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-700">{job.branch.city}, {job.branch.country}</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-700">{job.job_type}</span>
                  </div>
                  {job.salary_range && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-gray-400" />
                      <span className="text-gray-700">{job.salary_range}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-700">Posted on {formatDate(job.created_at)}</span>
                  </div>
                </div>
              </div>
              
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-[#153147] mb-4">Job Description</h2>
                <div className="prose max-w-none text-gray-700">
                  {job.description.split('\n').map((paragraph, index) => (
                    <p key={index} className="mb-4">{paragraph}</p>
                  ))}
                </div>
              </div>
              
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-[#153147] mb-4">Requirements</h2>
                <div className="prose max-w-none text-gray-700">
                  {job.requirements.split('\n').map((paragraph, index) => (
                    <p key={index} className="mb-4">{paragraph}</p>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-center">
                <Button 
                  size="lg"
                  className="bg-[#153147] hover:bg-[#0e2336] text-white px-8"
                  onClick={() => setShowApplyForm(true)}
                >
                  Apply for this position
                </Button>
              </div>
            </div>
            
            {/* Application Modal */}
            <JobApplicationModal 
              isOpen={showApplyForm} 
              onClose={() => setShowApplyForm(false)} 
              job={job}
            />
          </div>
        )}
      </div>
    </StudentLayout>
  );
};

export default JobDetail; 