import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Briefcase, Book, Search, MapPin, Calendar, User, ChevronRight, Sparkles, Users, Globe, TrendingUp } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import SharedHeader from './SharedHeader';

// Reuse data from jobs and blogs
const featuredJobs = Array.from({ length: 3 }, (_, index) => ({
  id: index + 1,
  title: [
    "Senior React Developer",
    "Product Manager",
    "UX Designer",
  ][index],
  department: [
    "Engineering",
    "Product",
    "Design",
  ][index],
  location: [
    "New York, USA",
    "London, UK",
    "San Francisco, USA",
  ][index],
  type: ["Full-time", "Full-time", "Contract"][index],
}));

const featuredBlogs = Array.from({ length: 3 }, (_, index) => ({
  id: index + 1,
  title: [
    "Getting Started with React",
    "The Future of AI",
    "Web Development Trends 2024",
  ][index],
  category: [
    "Development",
    "Technology",
    "Web Development",
  ][index],
  author: [
    "John Doe",
    "Jane Smith",
    "Mike Johnson",
  ][index],
  publishDate: [
    "2024-03-15",
    "2024-03-14",
    "2024-03-13",
  ][index],
  tags: [
    ["React", "JavaScript", "Frontend"],
    ["AI", "Machine Learning", "Technology"],
    ["Web", "Development", "Trends"],
  ][index],
}));

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

const AlternativeHome = () => {
  return (
    <div className="min-h-screen bg-[#F9F8F7]">
      <SharedHeader />

      {/* Hero Section */}
      <section className="bg-[#153147] text-white py-24 -mt-1">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center bg-white/10 rounded-full px-4 py-2 mb-6">
              <Sparkles className="h-5 w-5 text-yellow-300 mr-2" />
              <span className="text-[#EDEAE4]">Welcome to the next generation platform</span>
            </div>
            <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-[#F9F8F7] to-[#EDEAE4] bg-clip-text text-transparent">
              Your Gateway to Professional Growth
            </h1>
            <p className="text-xl text-[#ADB8BB] mb-12 max-w-2xl mx-auto">
              Discover opportunities, share knowledge, and connect with a community of professionals all in one place.
            </p>
            <div className="flex gap-4 justify-center">
              <Button 
                asChild
                size="lg"
                className="bg-[#F9F8F7] text-[#153147] hover:bg-[#EDEAE4] hover:scale-105 transform transition-all duration-200 px-8 py-6 text-lg rounded-full"
              >
                <Link to="/home2/jobs" className="flex items-center">
                  Browse Jobs
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button 
                asChild
                variant="outline" 
                size="lg"
                className="bg-transparent border-2 border-[#EDEAE4] text-[#EDEAE4] hover:bg-[#EDEAE4] hover:text-[#153147] hover:scale-105 transform transition-all duration-200 px-8 py-6 text-lg rounded-full flex items-center gap-2"
              >
                <Link to="/home2/blogs">
                  Read Articles
                  <ChevronRight className="h-5 w-5" />
                </Link>
              </Button>
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
            <Button 
              asChild
              variant="outline"
              className="border-[#153147] text-[#153147] hover:bg-[#153147] hover:text-white"
            >
              <Link to="/home2/jobs" className="flex items-center gap-2">
                View All Jobs
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredJobs.map((job) => (
              <Link 
                key={job.id}
                to="/home2/jobs"
                className="bg-white rounded-xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-[#EDEAE4] group transform hover:-translate-y-1"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-[#153147] group-hover:text-[#232A2F] transition-colors">
                      {job.title}
                    </h3>
                    <p className="text-[#ADB8BB] mt-1">{job.department}</p>
                  </div>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    {job.type}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-[#232A2F]">
                  <MapPin className="h-4 w-4 text-[#ADB8BB]" />
                  <span>{job.location}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Blogs Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-4xl font-bold text-[#153147]">Latest Articles</h2>
              <p className="text-[#ADB8BB] mt-2">Stay updated with industry insights</p>
            </div>
            <Button 
              asChild
              variant="outline"
              className="border-[#153147] text-[#153147] hover:bg-[#153147] hover:text-white"
            >
              <Link to="/home2/blogs" className="flex items-center gap-2">
                View All Articles
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredBlogs.map((blog) => (
              <Link 
                key={blog.id}
                to="/home2/blogs"
                className="bg-[#F9F8F7] rounded-xl p-8 hover:shadow-xl transition-all duration-300 group transform hover:-translate-y-1"
              >
                <div className="mb-4">
                  <h3 className="text-xl font-semibold text-[#153147] group-hover:text-[#232A2F] transition-colors">
                    {blog.title}
                  </h3>
                  <p className="text-[#ADB8BB] mt-1">{blog.category}</p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-[#232A2F]">
                    <User className="h-4 w-4 text-[#ADB8BB]" />
                    <span>{blog.author}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#232A2F]">
                    <Calendar className="h-4 w-4 text-[#ADB8BB]" />
                    <span>
                      {new Date(blog.publishDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {blog.tags.map((tag, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="bg-[#153147]/5 text-[#153147] border-[#153147]/20"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AlternativeHome; 