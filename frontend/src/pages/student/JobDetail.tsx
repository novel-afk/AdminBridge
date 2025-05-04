import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { MapPin, Calendar, Briefcase, ArrowLeft, Building, FileText, DollarSign } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Textarea } from '../../components/ui/textarea';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { StudentLayout } from '../../components/Layout';

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
  
  // Form state
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [coverLetter, setCoverLetter] = useState<string>('');
  const [resume, setResume] = useState<File | null>(null);
  const [formSubmitting, setFormSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<boolean>(false);

  useEffect(() => {
    const fetchJobDetail = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/jobs/${id}/`);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setResume(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resume) {
      setFormError('Please upload your resume');
      return;
    }
    
    try {
      setFormSubmitting(true);
      setFormError(null);
      
      const formData = new FormData();
      formData.append('job', id || '');
      formData.append('name', name);
      formData.append('email', email);
      formData.append('phone', phone);
      formData.append('cover_letter', coverLetter);
      formData.append('resume', resume);
      
      await axios.post('/api/job-responses/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setFormSuccess(true);
      // Reset form
      setName('');
      setEmail('');
      setPhone('');
      setCoverLetter('');
      setResume(null);
      
      // Hide form after successful submission
      setTimeout(() => {
        setShowApplyForm(false);
      }, 3000);
      
    } catch (error) {
      console.error('Error submitting application:', error);
      setFormError('An error occurred while submitting your application. Please try again.');
    } finally {
      setFormSubmitting(false);
    }
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
              <Button 
                variant="outline"
                className="mb-4"
                onClick={() => navigate('/student/jobs')}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Jobs
              </Button>
              
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
                  className="bg-[#153147] hover:bg-[#0e2336] px-8"
                  onClick={() => setShowApplyForm(true)}
                >
                  Apply for this position
                </Button>
              </div>
            </div>
            
            {/* Application Form */}
            {showApplyForm && (
              <div className="bg-white rounded-xl border border-gray-200 p-8 mb-8">
                <h2 className="text-2xl font-semibold text-[#153147] mb-6">Submit Your Application</h2>
                
                {formSuccess ? (
                  <div className="bg-green-50 text-green-800 p-4 rounded-lg mb-6">
                    Your application has been submitted successfully! We'll review it and get back to you soon.
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    {formError && (
                      <div className="bg-red-50 text-red-800 p-4 rounded-lg mb-6">
                        {formError}
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input 
                          id="name"
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                          className="w-full"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input 
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="w-full"
                        />
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input 
                          id="phone"
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          required
                          className="w-full"
                        />
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <div className="space-y-2">
                        <Label htmlFor="resume">Resume/CV (PDF only)</Label>
                        <Input 
                          id="resume"
                          type="file"
                          accept=".pdf"
                          onChange={handleFileChange}
                          required
                          className="w-full"
                        />
                        <p className="text-sm text-gray-500">Upload your resume in PDF format</p>
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <div className="space-y-2">
                        <Label htmlFor="coverLetter">Cover Letter (Optional)</Label>
                        <Textarea 
                          id="coverLetter"
                          value={coverLetter}
                          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCoverLetter(e.target.value)}
                          rows={6}
                          className="w-full"
                          placeholder="Tell us why you're a good fit for this position..."
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-end gap-4">
                      <Button 
                        type="button"
                        variant="outline"
                        onClick={() => setShowApplyForm(false)}
                        disabled={formSubmitting}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit"
                        className="bg-[#153147] hover:bg-[#0e2336]"
                        disabled={formSubmitting}
                      >
                        {formSubmitting ? 'Submitting...' : 'Submit Application'}
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </StudentLayout>
  );
};

export default JobDetail; 