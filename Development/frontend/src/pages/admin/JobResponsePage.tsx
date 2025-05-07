import React, { useState, useEffect } from "react";
import { Search, Download, Calendar, CheckCircle, XCircle } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { jobAPI } from "../../lib/api";

interface JobApplication {
  id: number;
  job: {
    id: number;
    title: string;
    branch: string;
    department: string;
    type: string;
  };
  name: string;
  email: string;
  phone: string;
  resume: string;
  cover_letter: string;
  status: string;
  created_at: string;
}

export default function JobResponsePage() {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [jobFilter, setJobFilter] = useState<string>("all");
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null);
  const [jobs, setJobs] = useState<{id: number, title: string}[]>([]);

  useEffect(() => {
    fetchJobResponses();
    fetchJobs();
  }, []);

  const fetchJobResponses = async () => {
    try {
      setLoading(true);
      const response = await jobAPI.getAllResponses();
      setApplications(response.data);
      if (response.data.length > 0) {
        setSelectedApplication(response.data[0]);
      }
    } catch (error) {
      console.error("Error fetching job responses:", error);
      alert("Failed to load job applications");
    } finally {
      setLoading(false);
    }
  };

  const fetchJobs = async () => {
    try {
      const response = await jobAPI.getAll();
      setJobs(response.data.map((job: any) => ({
        id: job.id,
        title: job.title
      })));
    } catch (error) {
      console.error("Error fetching jobs:", error);
    }
  };

  const updateApplicationStatus = async (id: number, status: string) => {
    try {
      await jobAPI.updateResponseStatus(id, { status });
      
      // Update local state
      setApplications(applications.map(app => 
        app.id === id ? { ...app, status } : app
      ));
      
      if (selectedApplication && selectedApplication.id === id) {
        setSelectedApplication({ ...selectedApplication, status });
      }
      
      alert(`Application marked as ${status}`);
    } catch (error) {
      console.error("Error updating application status:", error);
      alert("Failed to update application status");
    }
  };

  // Filter applications based on search query, status and job
  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || app.status.toLowerCase() === statusFilter.toLowerCase();

    const matchesJob =
      jobFilter === "all" || app.job.id.toString() === jobFilter;

    return matchesSearch && matchesStatus && matchesJob;
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "new":
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="h-[calc(100vh-200px)] bg-white rounded-xl border border-gray-200 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 text-gray-400 flex items-center justify-center rounded-full bg-gray-100">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-700">
            Loading...
          </h3>
          <p className="text-sm text-gray-500">
            Please wait while we load the job applications
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
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
                className="pl-10 w-[300px] bg-white rounded-md border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200"
              />
            </div>
            <Select value={jobFilter} onValueChange={setJobFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by job" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Jobs</SelectItem>
                {jobs.map((job) => (
                  <SelectItem key={job.id} value={job.id.toString()}>
                    {job.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="shortlisted">Shortlisted</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {applications.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <h2 className="text-lg font-medium text-gray-700">No Applications Yet</h2>
            <p className="text-gray-500 mt-2">There are no job applications to display.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Applications List with Scrollbar */}
            <div className="h-[calc(100vh-200px)] overflow-hidden">
              <div className="h-full overflow-y-auto pr-4 space-y-3 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                {filteredApplications.map((application) => (
                  <div
                    key={application.id}
                    className={`bg-white rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                      selectedApplication?.id === application.id
                        ? "border-2 border-blue-500 shadow-sm"
                        : "border border-gray-200 hover:border-blue-400"
                    }`}
                    onClick={() => setSelectedApplication(application)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <h3 className="font-medium text-gray-800">
                          {application.name}
                        </h3>
                        <p className="text-sm text-gray-600">{application.job.title}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span className="truncate max-w-[200px]">{application.email}</span>
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
                          {formatDate(application.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Application Details with Reduced Height */}
            {selectedApplication ? (
              <div className="h-[calc(100vh-200px)] overflow-hidden bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="h-full overflow-y-auto">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h2 className="text-lg font-semibold text-gray-800">
                          Application Details
                        </h2>
                        <p className="text-sm text-gray-600">
                          Review and respond to the application
                        </p>
                      </div>
                      {selectedApplication.resume && (
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-blue-600 border-blue-200 hover:bg-blue-50"
                            onClick={() => window.open(selectedApplication.resume, '_blank')}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Resume
                          </Button>
                        </div>
                      )}
                    </div>

                    <div className="space-y-6">
                      {/* Candidate Info */}
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-800 mb-3">
                          Candidate Information
                        </h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600 font-medium">Name</p>
                            <p className="text-gray-800">{selectedApplication.name}</p>
                          </div>
                          <div>
                            <p className="text-gray-600 font-medium">Email</p>
                            <p className="text-gray-800">{selectedApplication.email}</p>
                          </div>
                          <div>
                            <p className="text-gray-600 font-medium">Phone</p>
                            <p className="text-gray-800">{selectedApplication.phone || "Not provided"}</p>
                          </div>
                          <div>
                            <p className="text-gray-600 font-medium">Applied Date</p>
                            <p className="text-gray-800">
                              {formatDate(selectedApplication.created_at)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Job Details */}
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-800 mb-3">
                          Job Details
                        </h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600 font-medium">Position</p>
                            <p className="text-gray-800">{selectedApplication.job.title}</p>
                          </div>
                          <div>
                            <p className="text-gray-600 font-medium">Department</p>
                            <p className="text-gray-800">{selectedApplication.job.department || "N/A"}</p>
                          </div>
                          <div>
                            <p className="text-gray-600 font-medium">Type</p>
                            <p className="text-gray-800">{selectedApplication.job.type || "Full-time"}</p>
                          </div>
                          <div>
                            <p className="text-gray-600 font-medium">Branch</p>
                            <p className="text-gray-800">{selectedApplication.job.branch || "Main Branch"}</p>
                          </div>
                        </div>
                      </div>

                      {/* Cover Letter */}
                      {selectedApplication.cover_letter && (
                        <div>
                          <h3 className="text-sm font-medium text-gray-800 mb-3">
                            Cover Letter
                          </h3>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                              {selectedApplication.cover_letter}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Response Actions */}
                      <div className="flex gap-3 pt-4 border-t border-gray-100">
                        <Button
                          size="sm"
                          variant={selectedApplication.status === "shortlisted" ? "default" : "outline"}
                          className={
                            selectedApplication.status === "shortlisted"
                              ? "flex-1 bg-green-600 hover:bg-green-700 text-white"
                              : "flex-1 border-green-200 text-green-600 hover:bg-green-50"
                          }
                          onClick={() => updateApplicationStatus(selectedApplication.id, "shortlisted")}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Shortlist
                        </Button>
                        <Button
                          size="sm"
                          variant={selectedApplication.status === "rejected" ? "default" : "outline"}
                          className={
                            selectedApplication.status === "rejected"
                              ? "flex-1 bg-red-600 hover:bg-red-700 text-white"
                              : "flex-1 border-red-200 text-red-600 hover:bg-red-50"
                          }
                          onClick={() => updateApplicationStatus(selectedApplication.id, "rejected")}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => updateApplicationStatus(selectedApplication.id, "new")}
                        >
                          <Calendar className="h-4 w-4 mr-2" />
                          Mark as New
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-[calc(100vh-200px)] bg-white rounded-xl border border-gray-200 flex items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto mb-4 h-12 w-12 text-gray-400 flex items-center justify-center rounded-full bg-gray-100">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-700">
                    No Application Selected
                  </h3>
                  <p className="text-sm text-gray-500">
                    Select an application from the list to view details
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 