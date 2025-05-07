import React, { useState, useRef, useEffect } from "react";
import { Dialog } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { Mail, Phone, MapPin, Briefcase, FileText, X } from "lucide-react";
import axios from "axios";
import { getAuthHeader } from "../../lib/auth";
import { API_URL } from "../../lib/api";

interface Job {
  id: number;
  title: string;
  department?: string;
  location?: string;
}

interface JobApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: Job | null;
}

export default function JobApplicationModal({ isOpen, onClose, job }: JobApplicationModalProps) {
  const [loading, setLoading] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    cover_letter: "",
    resume: null as File | null
  });

  // Handle click outside to close modal
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        handleCancel();
      }
    }
    
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!job) return;
    if (!formData.resume) {
      alert("Please upload your resume");
      return;
    }
    
    try {
      setLoading(true);
      
      const formPayload = new FormData();
      formPayload.append('job', job.id.toString());
      formPayload.append('name', formData.name);
      formPayload.append('email', formData.email);
      formPayload.append('phone', formData.phone);
      formPayload.append('cover_letter', formData.cover_letter);
      formPayload.append('resume', formData.resume);
      
      // For unauthenticated users or students
      const headers = {
        'Content-Type': 'multipart/form-data',
        ...getAuthHeader() // Include auth token if user is logged in
      };
      
      await axios.post(`${API_URL}/job-responses/`, formPayload, { headers });
      
      alert("Your job application has been submitted successfully!");
      
      // Reset form and close modal
      setFormData({
        name: "",
        email: "",
        phone: "",
        cover_letter: "",
        resume: null
      });
      onClose();
      
    } catch (error) {
      console.error("Error submitting application:", error);
      alert("Failed to submit your application. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({
        ...prev,
        resume: e.target.files ? e.target.files[0] : null
      }));
    }
  };

  const handleCancel = () => {
    // Reset form data
    setFormData({
      name: "",
      email: "",
      phone: "",
      cover_letter: "",
      resume: null
    });
    // Close the modal
    onClose();
  };

  if (!job) return null;
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div ref={modalRef} className="bg-white rounded-lg shadow-lg w-full max-w-2xl overflow-hidden">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Apply for {job.title}
            </h2>
            <p className="text-gray-500 mt-1">
              {job.department} • {job.location}
            </p>
          </div>
          <button 
            onClick={handleCancel} 
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  required
                  className="pl-10"
                  disabled={loading}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <div className="relative">
                <Phone className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                  required
                  className="pl-10"
                  disabled={loading}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="resume">Resume</Label>
              <div className="relative">
                <FileText className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  id="resume"
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx"
                  required
                  className="pl-10"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cover_letter">Cover Letter</Label>
            <Textarea
              id="cover_letter"
              name="cover_letter"
              value={formData.cover_letter}
              onChange={handleChange}
              placeholder="Write your cover letter..."
              rows={5}
              required
              className="resize-none"
              disabled={loading}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit Application"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 