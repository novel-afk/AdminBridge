import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Badge } from "./ui/badge";
import { User, Briefcase, MapPin, Calendar, Mail, Phone } from 'lucide-react';

const mockApplications = [
  {
    id: 1,
    jobTitle: "Senior React Developer",
    company: "Tech Corp",
    status: "Under Review",
    appliedDate: "2024-03-15",
  },
  {
    id: 2,
    jobTitle: "Product Manager",
    company: "Innovation Labs",
    status: "Rejected",
    appliedDate: "2024-03-10",
  },
  {
    id: 3,
    jobTitle: "UX Designer",
    company: "Design Studio",
    status: "Shortlisted",
    appliedDate: "2024-03-08",
  },
];

const mockUser = {
  name: "John Doe",
  email: "john.doe@example.com",
  phone: "+1 234 567 8900",
  location: "New York, USA",
  joinedDate: "March 2024",
  profilePicture: "/profile-photo.jpg"
};

export default function UserProfile({ isOpen, onClose }) {
  const getStatusColor = (status) => {
    switch (status) {
      case "Under Review":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "Rejected":
        return "bg-red-50 text-red-700 border-red-200";
      case "Shortlisted":
        return "bg-green-50 text-green-700 border-green-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>User Profile</DialogTitle>
        </DialogHeader>

        {/* User Info */}
        <div className="flex items-start gap-6 p-4 bg-[#F9F8F7] rounded-lg">
          <div className="relative">
            <div className="w-20 h-20 rounded-full overflow-hidden ring-4 ring-white">
              <img
                src={mockUser.profilePicture}
                alt={mockUser.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-[#153147]">{mockUser.name}</h3>
            <div className="mt-2 space-y-1">
              <div className="flex items-center gap-2 text-[#232A2F]">
                <Mail className="h-4 w-4 text-[#ADB8BB]" />
                <span>{mockUser.email}</span>
              </div>
              <div className="flex items-center gap-2 text-[#232A2F]">
                <Phone className="h-4 w-4 text-[#ADB8BB]" />
                <span>{mockUser.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-[#232A2F]">
                <MapPin className="h-4 w-4 text-[#ADB8BB]" />
                <span>{mockUser.location}</span>
              </div>
              <div className="flex items-center gap-2 text-[#232A2F]">
                <Calendar className="h-4 w-4 text-[#ADB8BB]" />
                <span>Joined {mockUser.joinedDate}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Job Applications */}
        <div className="mt-6">
          <h4 className="text-lg font-semibold text-[#153147] mb-4">Job Applications</h4>
          <div className="space-y-4">
            {mockApplications.map((application) => (
              <div
                key={application.id}
                className="p-4 bg-white border border-[#EDEAE4] rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h5 className="font-semibold text-[#153147]">{application.jobTitle}</h5>
                    <p className="text-sm text-[#ADB8BB]">{application.company}</p>
                  </div>
                  <Badge
                    variant="outline"
                    className={getStatusColor(application.status)}
                  >
                    {application.status}
                  </Badge>
                </div>
                <div className="mt-2 flex items-center gap-2 text-sm text-[#232A2F]">
                  <Calendar className="h-4 w-4 text-[#ADB8BB]" />
                  <span>Applied on {new Date(application.appliedDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 