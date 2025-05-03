import React, { useMemo } from 'react';
import { XMarkIcon, BriefcaseIcon, MapPinIcon, CalendarIcon, CurrencyDollarIcon, ClockIcon, UserIcon, BuildingOfficeIcon, CheckCircleIcon, XCircleIcon, AcademicCapIcon, BuildingLibraryIcon, MapIcon } from '@heroicons/react/24/outline';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

// Component for displaying label-value pairs
const DetailsItem = ({ label, value, icon: Icon }) => {
  if (!value) return null;
  
  return (
    <div className="flex items-start gap-3 mb-4">
      {Icon && (
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#1e1b4b]/5 flex items-center justify-center">
          <Icon className="h-4 w-4 text-[#1e1b4b]" />
        </div>
      )}
      <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
        <div className="text-base text-gray-900">{value}</div>
      </div>
    </div>
  );
};

export default function ViewJobModal({ isOpen, onClose, job }) {
  if (!isOpen || !job) return null;

  // Extract additional details from the description
  const extractedDetails = useMemo(() => {
    if (!job.description) return { location: '', requiredExperience: '', mainDescription: '' };
    
    let location = '';
    let requiredExperience = '';

    // Try to extract location
    const locationMatch = job.description.match(/Location: (.*?)(?:\n|$)/);
    if (locationMatch && locationMatch[1]) {
      location = locationMatch[1].trim();
    }

    // Try to extract required experience
    const requiredExperienceMatch = job.description.match(/Required Experience: (.*?)(?:\n|$)/);
    if (requiredExperienceMatch && requiredExperienceMatch[1]) {
      requiredExperience = requiredExperienceMatch[1].trim();
    }

    // Extract the main description without the metadata
    const mainDescription = job.description
      .replace(/Department: .*?(?:\n|$)/g, '')
      .replace(/Location: .*?(?:\n|$)/g, '')
      .replace(/Required Experience: .*?(?:\n|$)/g, '')
      .trim();

    return {
      location,
      requiredExperience,
      mainDescription
    };
  }, [job.description]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Get status badge color
  const getStatusColor = (isActive) => {
    return isActive 
      ? 'bg-[#1e1b4b]/5 text-[#1e1b4b] border-[#1e1b4b]/20'
      : 'bg-red-50 text-red-700 border-red-200';
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col relative">
        {/* Gradient Line */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#1e1b4b]/60 via-[#1e1b4b] to-[#1e1b4b]/60"></div>
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">{job.title}</h2>
              <div className="flex items-center gap-2 mt-1">
                <Badge 
                  variant="outline" 
                  className={`${getStatusColor(job.is_active)}`}
                >
                  {job.is_active ? 'Active' : 'Inactive'}
                </Badge>
                {job.job_type && (
                  <Badge 
                    variant="outline" 
                    className="bg-gray-50 text-gray-700 border-gray-200"
                  >
                    {job.job_type}
                  </Badge>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-base font-semibold text-gray-800 mb-4">Job Details</h3>
              <DetailsItem 
                label="Branch" 
                value={job.branch_name} 
                icon={BuildingOfficeIcon} 
              />
              <DetailsItem 
                label="Location" 
                value={extractedDetails.location || job.branch_location} 
                icon={MapIcon} 
              />
              <DetailsItem 
                label="Required Experience" 
                value={extractedDetails.requiredExperience} 
                icon={AcademicCapIcon} 
              />
              <DetailsItem 
                label="Job Type" 
                value={job.job_type} 
                icon={BriefcaseIcon} 
              />
              <DetailsItem 
                label="Salary Range" 
                value={job.salary_range} 
                icon={CurrencyDollarIcon} 
              />
              <DetailsItem 
                label="Status" 
                value={
                  <div className="flex items-center">
                    {job.is_active ? (
                      <>
                        <CheckCircleIcon className="h-4 w-4 text-green-500 mr-1" />
                        <span>Active</span>
                      </>
                    ) : (
                      <>
                        <XCircleIcon className="h-4 w-4 text-red-500 mr-1" />
                        <span>Inactive</span>
                      </>
                    )}
                  </div>
                } 
              />
            </div>
            
            <div>
              <h3 className="text-base font-semibold text-gray-800 mb-4">Posting Information</h3>
              <DetailsItem 
                label="Posted Date" 
                value={formatDate(job.created_at)} 
                icon={CalendarIcon} 
              />
              <DetailsItem 
                label="Created By" 
                value={job.created_by_name || 'System'} 
                icon={UserIcon} 
              />
              <DetailsItem 
                label="Last Updated" 
                value={formatDate(job.updated_at)} 
                icon={ClockIcon} 
              />
            </div>
          </div>

          {extractedDetails.mainDescription && (
            <div className="mt-8">
              <h3 className="text-base font-semibold text-gray-800 mb-4">Job Description</h3>
              <div className="bg-white border border-gray-100 rounded-lg p-4 text-gray-700 whitespace-pre-line">
                {extractedDetails.mainDescription}
              </div>
            </div>
          )}

          {job.requirements && (
            <div className="mt-8">
              <h3 className="text-base font-semibold text-gray-800 mb-4">Requirements</h3>
              <div className="bg-white border border-gray-100 rounded-lg p-4 text-gray-700 whitespace-pre-line">
                {job.requirements}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-end">
          <Button
            type="button"
            onClick={onClose}
            className="bg-[#1e1b4b] hover:bg-[#1e1b4b]/90"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
} 