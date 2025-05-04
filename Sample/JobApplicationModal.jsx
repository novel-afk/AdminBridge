import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Mail, Phone, MapPin, Briefcase, FileText } from "lucide-react";

export default function JobApplicationModal({ isOpen, onClose, job }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    experience: "",
    location: "",
    coverLetter: "",
    resume: null
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would handle the application submission
    console.log("Application submitted:", formData);
    onClose();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData(prev => ({
      ...prev,
      resume: file
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#153147]">
            Apply for {job?.title}
          </DialogTitle>
          <p className="text-[#ADB8BB] mt-1">{job?.department} • {job?.location}</p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#232A2F]">Full Name</label>
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
                className="border-[#ADB8BB] focus:border-[#153147]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#232A2F]">Email</label>
              <div className="relative">
                <Mail className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#ADB8BB]" />
                <Input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  required
                  className="pl-10 border-[#ADB8BB] focus:border-[#153147]"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#232A2F]">Phone</label>
              <div className="relative">
                <Phone className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#ADB8BB]" />
                <Input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                  required
                  className="pl-10 border-[#ADB8BB] focus:border-[#153147]"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#232A2F]">Experience</label>
              <div className="relative">
                <Briefcase className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#ADB8BB]" />
                <Input
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  placeholder="Years of experience"
                  required
                  className="pl-10 border-[#ADB8BB] focus:border-[#153147]"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#232A2F]">Location</label>
              <div className="relative">
                <MapPin className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#ADB8BB]" />
                <Input
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Your location"
                  required
                  className="pl-10 border-[#ADB8BB] focus:border-[#153147]"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#232A2F]">Resume</label>
              <div className="relative">
                <FileText className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#ADB8BB]" />
                <Input
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx"
                  required
                  className="pl-10 border-[#ADB8BB] focus:border-[#153147]"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[#232A2F]">Cover Letter</label>
            <Textarea
              name="coverLetter"
              value={formData.coverLetter}
              onChange={handleChange}
              placeholder="Write your cover letter..."
              required
              className="h-32 resize-none border-[#ADB8BB] focus:border-[#153147]"
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-[#ADB8BB] text-[#232A2F] hover:bg-[#F9F8F7]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#153147] hover:bg-[#232A2F] text-white"
            >
              Submit Application
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 