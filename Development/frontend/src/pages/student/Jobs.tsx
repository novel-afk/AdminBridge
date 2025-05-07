import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Calendar, Briefcase } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { StudentLayout } from '../../components/Layout';
import { jobAPI } from '../../lib/api'; // Import API method

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
}

const Jobs: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const response = await jobAPI.getActive();
        
        let jobsData: Job[] = [];
        if (response.data.results && Array.isArray(response.data.results)) {
          jobsData = response.data.results;
        } else if (Array.isArray(response.data)) {
          jobsData = response.data;
        }
        
        console.log('Jobs data:', jobsData);
        setJobs(jobsData);
        setFilteredJobs(jobsData);
      } catch (error) {
        console.error('Error fetching jobs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredJobs(jobs);
    } else {
      const filtered = jobs.filter(job => 
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.branch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.branch.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.branch.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.job_type.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredJobs(filtered);
    }
  }, [searchQuery, jobs]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Function to truncate text
  const truncateText = (text: string, maxLength: number) => {
    if (!text) return '';
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
  };

  return (
    <StudentLayout>
      <div className="container mx-auto px-6 py-12">
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold text-[#153147] mb-2">Job Listings</h1>
          <p className="text-gray-600 mb-6">Explore available positions</p>
          
          <div className="relative mb-8">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search jobs..."
              className="pl-10 py-2 w-full md:w-1/2 border-gray-300 focus:border-[#153147] focus:ring-[#153147]"
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>
          
          {loading ? (
            <div className="text-center py-12">Loading jobs...</div>
          ) : filteredJobs.length === 0 ? (
            <div className="text-center py-12">No jobs found matching your search criteria</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredJobs.map((job) => (
                <div 
                  key={job.id}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <div className="p-6">
                    <h2 className="text-xl font-semibold text-[#153147] mb-2">{job.title}</h2>
                    <p className="text-gray-500 text-sm mb-4">{job.branch.name}</p>
                    
                    <div className="mb-4">
                      <p className="text-gray-600 text-sm">
                        {truncateText(job.description || "", 120)}
                      </p>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{job.branch.city}, {job.branch.country}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{job.job_type}</span>
                        {job.salary_range && (
                          <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700 border-blue-200">
                            {job.salary_range}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">Posted on {formatDate(job.created_at)}</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button
                        variant="default"
                        className="bg-[#153147] hover:bg-[#0e2336] text-white"
                        onClick={() => window.location.href = `/student/jobs/${job.id}`}
                      >
                        Apply now
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </StudentLayout>
  );
};

export default Jobs; 