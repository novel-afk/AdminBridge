import React, { useRef, useEffect } from 'react';
import { X, Mail, Phone, MapPin, Calendar, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useAuth } from '../../lib/AuthContext';

interface Application {
  id: number;
  job: {
    id: number;
    title: string;
    branch: {
      name: string;
    };
  };
  status: string;
  created_at: string;
}

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  applications: Application[];
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose, applications }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  // Handle click outside to close modal
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    
    function handleEscKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscKey);
      // Disable body scrolling when modal is open
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscKey);
      // Re-enable body scrolling when modal is closed
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'shortlisted':
        return (
          <Badge className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Accepted
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-50 text-red-700 border-red-200 flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Pending
          </Badge>
        );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-auto animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl animate-fadeInScale" ref={modalRef}>
        <div className="absolute top-4 right-4">
          <Button 
            variant="outline"
            size="icon"
            className="rounded-full border-gray-200 hover:bg-gray-100"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </Button>
        </div>
        
        <div className="p-6">
          <h2 className="text-2xl font-bold text-[#153147] mb-4">User Profile</h2>
          
          {/* User Info */}
          <div className="flex items-start gap-6 p-6 bg-[#F9F8F7] rounded-lg">
            <div className="relative">
              <div className="w-20 h-20 rounded-full overflow-hidden ring-4 ring-white bg-[#153147] flex items-center justify-center text-white text-2xl font-bold">
                {user?.first_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </div>
              <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-[#153147]">
                {user?.first_name} {user?.last_name || ''}
              </h3>
              <div className="mt-2 space-y-3">
                <div className="flex items-center gap-2 text-[#232A2F]">
                  <Mail className="h-4 w-4 text-[#ADB8BB]" />
                  <span>{user?.email}</span>
                </div>
                <div className="flex items-center gap-2 text-[#232A2F]">
                  <Phone className="h-4 w-4 text-[#ADB8BB]" />
                  <span>{user?.phone || 'Not provided'}</span>
                </div>
                <div className="flex items-center gap-2 text-[#232A2F]">
                  <MapPin className="h-4 w-4 text-[#ADB8BB]" />
                  <span>{user?.branch?.name || 'Not specified'}</span>
                </div>
                <div className="flex items-center gap-2 text-[#232A2F]">
                  <Calendar className="h-4 w-4 text-[#ADB8BB]" />
                  <span>Joined {formatDate(user?.created_at || new Date().toISOString())}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Job Applications */}
          <div className="mt-6">
            <h4 className="text-lg font-semibold text-[#153147] mb-4">Job Applications</h4>
            {applications.length === 0 ? (
              <div className="p-6 bg-white border border-gray-200 rounded-lg text-center">
                <p className="text-gray-500">You haven't applied to any jobs yet.</p>
                <Button 
                  className="mt-4 bg-[#153147] hover:bg-[#0e2336]"
                  onClick={onClose}
                >
                  Browse Available Jobs
                </Button>
              </div>
            ) : (
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                {applications.map((application) => (
                  <div
                    key={application.id}
                    className="p-4 bg-white border border-[#EDEAE4] rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h5 className="font-semibold text-[#153147]">{application.job.title}</h5>
                        <p className="text-sm text-[#ADB8BB]">{application.job.branch.name}</p>
                      </div>
                      {getStatusBadge(application.status)}
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-sm text-[#232A2F]">
                      <Calendar className="h-4 w-4 text-[#ADB8BB]" />
                      <span>Applied on {formatDate(application.created_at)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal; 