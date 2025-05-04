import { useState } from "react";
import {
  Search,
  Mail,
  Phone,
  Calendar,
  Briefcase,
  MapPin,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Download,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

// Dummy data for job applications
const applications = [
  {
    id: 1,
    candidate: {
      name: "John Smith",
      email: "john.smith@example.com",
      phone: "+1 234-567-8900",
      experience: "5 years",
      location: "New York, USA",
    },
    job: {
      title: "Senior React Developer",
      department: "Engineering",
      type: "Full-time",
    },
    appliedDate: "2024-03-15",
    status: "Pending",
    resume: "/path/to/resume.pdf",
    coverLetter: "I am excited to apply for this position...",
  },
  {
    id: 2,
    candidate: {
      name: "Sarah Wilson",
      email: "sarah.wilson@example.com",
      phone: "+1 234-567-8901",
      experience: "3 years",
      location: "San Francisco, USA",
    },
    job: {
      title: "UI/UX Designer",
      department: "Design",
      type: "Full-time",
    },
    appliedDate: "2024-03-14",
    status: "Shortlisted",
    resume: "/path/to/resume.pdf",
    coverLetter: "With my background in design...",
  },
  {
    id: 3,
    candidate: {
      name: "Michael Brown",
      email: "michael.brown@example.com",
      phone: "+1 234-567-8902",
      experience: "7 years",
      location: "London, UK",
    },
    job: {
      title: "DevOps Engineer",
      department: "Operations",
      type: "Remote",
    },
    appliedDate: "2024-03-13",
    status: "Rejected",
    resume: "/path/to/resume.pdf",
    coverLetter: "I bring extensive experience in DevOps...",
  },
  {
    id: 4,
    candidate: {
      name: "Emily Davis",
      email: "emily.davis@example.com",
      phone: "+1 234-567-8903",
      experience: "4 years",
      location: "Chicago, USA",
    },
    job: {
      title: "Frontend Developer",
      department: "Engineering",
      type: "Full-time",
    },
    appliedDate: "2024-03-12",
    status: "Pending",
    resume: "/path/to/resume.pdf",
    coverLetter: "As a passionate frontend developer...",
  },
  {
    id: 5,
    candidate: {
      name: "David Lee",
      email: "david.lee@example.com",
      phone: "+1 234-567-8904",
      experience: "6 years",
      location: "Toronto, Canada",
    },
    job: {
      title: "Product Manager",
      department: "Product",
      type: "Full-time",
    },
    appliedDate: "2024-03-11",
    status: "Shortlisted",
    resume: "/path/to/resume.pdf",
    coverLetter: "With my product management experience...",
  },
  {
    id: 6,
    candidate: {
      name: "Anna Johnson",
      email: "anna.johnson@example.com",
      phone: "+1 234-567-8905",
      experience: "8 years",
      location: "Berlin, Germany",
    },
    job: {
      title: "Backend Developer",
      department: "Engineering",
      type: "Remote",
    },
    appliedDate: "2024-03-10",
    status: "Pending",
    resume: "/path/to/resume.pdf",
    coverLetter: "I specialize in backend development...",
  },
  {
    id: 7,
    candidate: {
      name: "James Wilson",
      email: "james.wilson@example.com",
      phone: "+1 234-567-8906",
      experience: "5 years",
      location: "Sydney, Australia",
    },
    job: {
      title: "Data Scientist",
      department: "Data",
      type: "Full-time",
    },
    appliedDate: "2024-03-09",
    status: "Shortlisted",
    resume: "/path/to/resume.pdf",
    coverLetter: "My expertise in data science...",
  },
  {
    id: 8,
    candidate: {
      name: "Sophie Martin",
      email: "sophie.martin@example.com",
      phone: "+1 234-567-8907",
      experience: "3 years",
      location: "Paris, France",
    },
    job: {
      title: "Marketing Manager",
      department: "Marketing",
      type: "Full-time",
    },
    appliedDate: "2024-03-08",
    status: "Rejected",
    resume: "/path/to/resume.pdf",
    coverLetter: "I have successfully led marketing campaigns...",
  },
  {
    id: 9,
    candidate: {
      name: "Lucas Garcia",
      email: "lucas.garcia@example.com",
      phone: "+1 234-567-8908",
      experience: "4 years",
      location: "Madrid, Spain",
    },
    job: {
      title: "QA Engineer",
      department: "Engineering",
      type: "Full-time",
    },
    appliedDate: "2024-03-07",
    status: "Pending",
    resume: "/path/to/resume.pdf",
    coverLetter: "My attention to detail and testing expertise...",
  },
  {
    id: 10,
    candidate: {
      name: "Emma Thompson",
      email: "emma.thompson@example.com",
      phone: "+1 234-567-8909",
      experience: "6 years",
      location: "Melbourne, Australia",
    },
    job: {
      title: "Project Manager",
      department: "Operations",
      type: "Full-time",
    },
    appliedDate: "2024-03-06",
    status: "Shortlisted",
    resume: "/path/to/resume.pdf",
    coverLetter: "I have successfully managed multiple projects...",
  },
  {
    id: 11,
    candidate: {
      name: "Oliver White",
      email: "oliver.white@example.com",
      phone: "+1 234-567-8910",
      experience: "7 years",
      location: "Vancouver, Canada",
    },
    job: {
      title: "Senior React Developer",
      department: "Engineering",
      type: "Remote",
    },
    appliedDate: "2024-03-05",
    status: "Pending",
    resume: "/path/to/resume.pdf",
    coverLetter: "With extensive React experience...",
  },
  {
    id: 12,
    candidate: {
      name: "Isabella Silva",
      email: "isabella.silva@example.com",
      phone: "+1 234-567-8911",
      experience: "5 years",
      location: "Lisbon, Portugal",
    },
    job: {
      title: "UI/UX Designer",
      department: "Design",
      type: "Full-time",
    },
    appliedDate: "2024-03-04",
    status: "Shortlisted",
    resume: "/path/to/resume.pdf",
    coverLetter: "My passion for user-centered design...",
  }
];

// Get unique job titles for filter
const uniqueJobs = [...new Set(applications.map(app => app.job.title))];

export default function JobResponse() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [jobFilter, setJobFilter] = useState("all");
  const [selectedApplication, setSelectedApplication] = useState(null);

  // Filter applications based on search query, status and job
  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.candidate.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || app.status.toLowerCase() === statusFilter.toLowerCase();

    const matchesJob =
      jobFilter === "all" || app.job.title === jobFilter;

    return matchesSearch && matchesStatus && matchesJob;
  });

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "shortlisted":
        return "bg-green-50 text-green-700 border-green-200";
      case "rejected":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Job Applications</h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage and respond to job applications
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <Input
                type="text"
                placeholder="Search applications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-[300px] bg-white rounded-md border-[#ADB8BB] focus:border-[#153147] focus:ring-1 focus:ring-[#153147] transition-all duration-200"
              />
            </div>
            <Select value={jobFilter} onValueChange={setJobFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by job" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Jobs</SelectItem>
                {uniqueJobs.map((job) => (
                  <SelectItem key={job} value={job}>{job}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="shortlisted">Shortlisted</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Applications List with Scrollbar - Height for 3 items */}
          <div className="h-[28rem] overflow-hidden">
            <div className="h-full overflow-y-auto pr-4 space-y-3 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
              {filteredApplications.map((application) => (
                <div
                  key={application.id}
                  className={`bg-white rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                    selectedApplication?.id === application.id
                      ? "border-2 border-[#153147] shadow-sm"
                      : "border border-gray-200 hover:border-[#153147]/50"
                  }`}
                  onClick={() => setSelectedApplication(application)}
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h3 className="font-medium text-[#153147]">
                        {application.candidate.name}
                      </h3>
                      <p className="text-sm text-gray-600">{application.job.title}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Mail className="h-3.5 w-3.5" />
                        <span className="truncate max-w-[200px]">{application.candidate.email}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge
                        variant="outline"
                        className={getStatusColor(application.status)}
                      >
                        {application.status}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {new Date(application.appliedDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Application Details with Reduced Height */}
          {selectedApplication ? (
            <div className="h-[28rem] overflow-hidden bg-white rounded-xl border-2 border-[#153147]">
              <div className="h-full overflow-y-auto">
                <div className="p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-lg font-semibold text-[#153147]">
                        Application Details
                      </h2>
                      <p className="text-sm text-[#232A2F]">
                        Review and respond to the application
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-[#153147] border-[#153147] hover:bg-[#153147] hover:text-white"
                        onClick={() => {
                          // Handle download resume
                        }}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Resume
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Job Details */}
                    <div className="p-3 bg-[#F9F8F7] rounded-lg">
                      <h3 className="text-sm font-medium text-[#153147] mb-2">
                        Job Details
                      </h3>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-[#232A2F] font-medium">Position</p>
                          <p className="text-[#153147]">{selectedApplication.job.title}</p>
                        </div>
                        <div>
                          <p className="text-[#232A2F] font-medium">Department</p>
                          <p className="text-[#153147]">{selectedApplication.job.department}</p>
                        </div>
                        <div>
                          <p className="text-[#232A2F] font-medium">Type</p>
                          <p className="text-[#153147]">{selectedApplication.job.type}</p>
                        </div>
                        <div>
                          <p className="text-[#232A2F] font-medium">Applied Date</p>
                          <p className="text-[#153147]">
                            {new Date(selectedApplication.appliedDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Cover Letter */}
                    <div>
                      <h3 className="text-sm font-medium text-[#153147] mb-2">
                        Cover Letter
                      </h3>
                      <div className="bg-[#F9F8F7] rounded-lg p-3">
                        <p className="text-sm text-[#232A2F] whitespace-pre-wrap leading-relaxed">
                          {selectedApplication.coverLetter}
                        </p>
                      </div>
                    </div>

                    {/* Response Actions */}
                    <div className="flex gap-2 pt-3 border-t border-gray-100">
                      <Button
                        size="sm"
                        className="flex-1 bg-[#153147] hover:bg-[#153147]/90 text-white"
                        onClick={() => {
                          // Handle shortlist
                        }}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Shortlist
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                        onClick={() => {
                          // Handle reject
                        }}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                          // Handle schedule interview
                        }}
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        Schedule
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-[28rem] bg-white rounded-xl border-2 border-[#153147] flex items-center justify-center">
              <div className="text-center">
                <Clock className="h-12 w-12 text-[#153147] mx-auto mb-4" />
                <h3 className="text-lg font-medium text-[#153147]">
                  No Application Selected
                </h3>
                <p className="text-sm text-[#232A2F]">
                  Select an application from the list to view details
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 