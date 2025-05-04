import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowRight, Briefcase, Book, Search, MapPin, Calendar, User, ChevronRight, Sparkles, Users, Globe, TrendingUp } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import Layout from '../../components/Layout';
import StudentHeader from '../../components/StudentHeader';

interface FeaturedJob {
  id: number;
  title: string;
  description: string;
  requirements: string;
  job_type: string;
  branch: {
    name: string;
    city: string;
    country: string;
  };
  created_at: string;
}

interface Blog {
  id: number;
  title: string;
  content: string;
  author: {
    first_name: string;
    last_name: string;
  };
  published_date: string;
  created_at: string;
}

const features = [
  {
    icon: <Globe className="h-6 w-6" />,
    title: "Global Opportunities",
    description: "Connect with companies worldwide and explore international career paths."
  },
  {
    icon: <Users className="h-6 w-6" />,
    title: "Professional Network",
    description: "Build relationships with industry experts and like-minded professionals."
  },
  {
    icon: <TrendingUp className="h-6 w-6" />,
    title: "Career Growth",
    description: "Access resources and insights to accelerate your professional development."
  }
];

const Dashboard: React.FC = () => {
  const [featuredJobs, setFeaturedJobs] = useState<FeaturedJob[]>([]);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [jobsResponse, blogsResponse] = await Promise.all([
          axios.get('/api/jobs/?is_active=true&limit=3'),
          axios.get('/api/blogs/?is_published=true&limit=3')
        ]);
        
        setFeaturedJobs(jobsResponse.data.results || []);
        setBlogs(blogsResponse.data.results || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <>
      <StudentHeader />
      <Layout showSidebar={false} showHeader={false}>
        {/* Hero Section */}
        <section className="bg-[#153147] text-white py-24 -mt-1">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center bg-white/10 rounded-full px-4 py-2 mb-6">
                <Sparkles className="h-5 w-5 text-yellow-300 mr-2" />
                <span className="text-[#EDEAE4]">Welcome to AdminBridge Student Portal</span>
              </div>
              <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-[#F9F8F7] to-[#EDEAE4] bg-clip-text text-transparent">
                Your Gateway to Professional Growth
              </h1>
              <p className="text-xl text-[#ADB8BB] mb-12 max-w-2xl mx-auto">
                Discover opportunities, share knowledge, and connect with a community of professionals all in one place.
              </p>
              <div className="flex gap-4 justify-center">
                <Link to="/student/jobs" className="flex items-center">
                  <Button 
                    size="lg"
                    className="bg-[#F9F8F7] text-[#153147] hover:bg-[#EDEAE4] hover:scale-105 transform transition-all duration-200 px-8 py-6 text-lg rounded-full"
                  >
                    Browse Jobs
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/student/blogs">
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="bg-transparent border-2 border-[#EDEAE4] text-[#EDEAE4] hover:bg-[#EDEAE4] hover:text-[#153147] hover:scale-105 transform transition-all duration-200 px-8 py-6 text-lg rounded-full flex items-center gap-2"
                  >
                    Read Articles
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className="text-center p-8 rounded-2xl bg-gradient-to-b from-[#F9F8F7] to-white border border-[#EDEAE4] hover:shadow-lg transition-all duration-300"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-[#153147] text-white mb-6">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-[#153147] mb-4">{feature.title}</h3>
                  <p className="text-[#232A2F]">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Jobs Section */}
        <section className="py-20">
          <div className="container mx-auto px-6">
            <div className="flex justify-between items-center mb-12">
              <div>
                <h2 className="text-4xl font-bold text-[#153147]">Featured Jobs</h2>
                <p className="text-[#ADB8BB] mt-2">Explore our latest opportunities</p>
              </div>
              <Link to="/student/jobs" className="flex items-center gap-2">
                <Button 
                  variant="outline"
                  className="border-[#153147] text-[#153147] hover:bg-[#153147] hover:text-white"
                >
                  View All Jobs
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {loading ? (
                <div className="col-span-3 text-center py-12">Loading featured jobs...</div>
              ) : featuredJobs.length === 0 ? (
                <div className="col-span-3 text-center py-12">No featured jobs available at this time</div>
              ) : (
                featuredJobs.map((job) => (
                  <Link 
                    key={job.id}
                    to={`/student/jobs/${job.id}`}
                    className="bg-white rounded-xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-[#EDEAE4] group transform hover:-translate-y-1"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-[#153147] group-hover:text-[#232A2F] transition-colors">
                          {job.title}
                        </h3>
                        <p className="text-[#ADB8BB] mt-1">{job.branch?.name}</p>
                      </div>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        {job.job_type}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-[#232A2F]">
                      <MapPin className="h-4 w-4 text-[#ADB8BB]" />
                      <span>{job.branch?.city}, {job.branch?.country}</span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Latest Articles Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-6">
            <div className="flex justify-between items-center mb-12">
              <div>
                <h2 className="text-4xl font-bold text-[#153147]">Latest Articles</h2>
                <p className="text-[#ADB8BB] mt-2">Stay updated with industry insights</p>
              </div>
              <Link to="/student/blogs" className="flex items-center gap-2">
                <Button 
                  variant="outline"
                  className="border-[#153147] text-[#153147] hover:bg-[#153147] hover:text-white"
                >
                  View All Articles
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {loading ? (
                <div className="col-span-3 text-center py-12">Loading latest articles...</div>
              ) : blogs.length === 0 ? (
                <div className="col-span-3 text-center py-12">No articles available at this time</div>
              ) : (
                blogs.map((blog) => (
                  <Link 
                    key={blog.id}
                    to={`/student/blogs/${blog.id}`}
                    className="bg-[#F9F8F7] rounded-xl p-8 hover:shadow-xl transition-all duration-300 group transform hover:-translate-y-1"
                  >
                    <div className="mb-4">
                      <h3 className="text-xl font-semibold text-[#153147] group-hover:text-[#232A2F] transition-colors">
                        {blog.title}
                      </h3>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-[#232A2F]">
                        <User className="h-4 w-4 text-[#ADB8BB]" />
                        <span>{blog.author?.first_name} {blog.author?.last_name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[#232A2F]">
                        <Calendar className="h-4 w-4 text-[#ADB8BB]" />
                        <span>{formatDate(blog.published_date || blog.created_at)}</span>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </section>
      </Layout>
    </>
  );
};

export default Dashboard; 