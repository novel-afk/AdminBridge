import { useState } from "react"
import { Search, Eye, MapPin, Briefcase, Send } from "lucide-react"
import { Link } from 'react-router-dom';
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Badge } from "../components/ui/badge"
import ViewJobModal from "../components/ViewJobModal"
import JobApplicationModal from "../components/JobApplicationModal"
import SharedHeader from "../components/SharedHeader"

// Reuse the jobs data from the original Jobs page
const jobs = Array.from({ length: 8 }, (_, index) => ({
  id: index + 1,
  title: [
    "Software Engineer",
    "Product Manager",
    "UX Designer",
    "Data Analyst",
    "Marketing Manager",
    "Sales Representative",
    "HR Specialist",
    "Financial Analyst"
  ][index],
  department: [
    "Engineering",
    "Product",
    "Design",
    "Analytics",
    "Marketing",
    "Sales",
    "Human Resources",
    "Finance"
  ][index],
  location: [
    "New York, USA",
    "London, UK",
    "Paris, France",
    "Tokyo, Japan",
    "Dubai, UAE",
    "Singapore",
    "Sydney, Australia",
    "Toronto, Canada"
  ][index],
  status: ["Open", "Open", "Open", "Closed", "Open", "Open", "Draft", "Open"][index],
  type: ["Full-time", "Full-time", "Contract", "Part-time", "Full-time", "Full-time", "Full-time", "Contract"][index],
  experience: ["3-5 years", "5+ years", "2-4 years", "1-3 years", "4-6 years", "2-3 years", "3-4 years", "4-5 years"][index],
}));

// Add Header component
const Header = () => (
  <header className="bg-[#153147] shadow-lg">
    <div className="container mx-auto px-6 py-4">
      <div className="flex items-center justify-between">
        <Link to="/home2" className="flex items-center space-x-6">
          <div className="group w-12 h-12 flex items-center justify-center rounded-xl bg-[#F9F8F7]/10 p-2 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#F9F8F7]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <img src="/logo.png" alt="Admin Bridge Logo" 
                 className="relative w-full h-full object-contain brightness-0 invert 
                            group-hover:scale-105 transition-transform duration-300" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#F9F8F7]">Admin Bridge</h1>
            <p className="text-sm text-[#ADB8BB]">Management System</p>
          </div>
        </Link>
        <div className="flex items-center space-x-8">
          <nav className="flex items-center space-x-6">
            <Link 
              to="/home2/jobs" 
              className="text-[#F9F8F7] hover:text-[#EDEAE4] font-medium transition-colors duration-200"
            >
              Jobs
            </Link>
            <Link 
              to="/home2/blogs" 
              className="text-[#F9F8F7] hover:text-[#EDEAE4] font-medium transition-colors duration-200"
            >
              Blogs
            </Link>
          </nav>
          <Button 
            asChild
            variant="outline"
            className="border-[#F9F8F7] text-[#F9F8F7] hover:bg-[#F9F8F7] hover:text-[#153147] transition-all duration-200"
          >
            <Link to="/login">Login</Link>
          </Button>
        </div>
      </div>
    </div>
  </header>
);

export default function AlternativeJobs() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedJob, setSelectedJob] = useState(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false)

  const handleView = (job) => {
    setSelectedJob(job)
    setIsViewModalOpen(true)
  }

  const handleApply = (job) => {
    setSelectedJob(job)
    setIsApplyModalOpen(true)
  }

  const filteredJobs = jobs.filter((job) =>
    Object.values(job).some((value) => value.toString().toLowerCase().includes(searchQuery.toLowerCase())),
  )

  return (
    <div className="min-h-screen bg-[#F9F8F7]">
      <SharedHeader />
      
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-[#153147]">Job Listings</h2>
          <p className="text-[#232A2F] mt-2">Explore available positions</p>

          <div className="flex justify-end items-center mt-8">
            <div className="relative">
              <Search className="h-5 w-5 text-[#ADB8BB] absolute left-3 top-1/2 transform -translate-y-1/2" />
              <Input
                type="text"
                placeholder="Search jobs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-[300px] bg-white rounded-lg border-[#ADB8BB] focus:border-[#153147] focus:ring-1 focus:ring-[#153147]"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.map((job) => (
            <div 
              key={job.id}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-200 border border-[#EDEAE4] group"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-[#153147] group-hover:text-[#232A2F] transition-colors">
                    {job.title}
                  </h3>
                  <p className="text-[#ADB8BB] mt-1">{job.department}</p>
                </div>
                <Badge 
                  variant="outline" 
                  className={`
                    ${job.status === 'Open' 
                      ? 'bg-green-50 text-green-700 border-green-200' 
                      : job.status === 'Draft'
                      ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                      : 'bg-red-50 text-red-700 border-red-200'
                    }
                  `}
                >
                  {job.status}
                </Badge>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-[#232A2F]">
                  <MapPin className="h-4 w-4 text-[#ADB8BB]" />
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center gap-2 text-[#232A2F]">
                  <Briefcase className="h-4 w-4 text-[#ADB8BB]" />
                  <span>{job.type} • {job.experience}</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#EDEAE4] flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-[#153147] hover:text-[#232A2F] hover:bg-[#F9F8F7]"
                  onClick={() => handleView(job)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Button>
                {job.status === 'Open' && (
                  <Button
                    variant="default"
                    size="sm"
                    className="bg-[#153147] hover:bg-[#232A2F] text-white"
                    onClick={() => handleApply(job)}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Apply Now
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <ViewJobModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false)
          setSelectedJob(null)
        }}
        job={selectedJob}
      />

      <JobApplicationModal
        isOpen={isApplyModalOpen}
        onClose={() => {
          setIsApplyModalOpen(false)
          setSelectedJob(null)
        }}
        job={selectedJob}
      />
    </div>
  )
} 