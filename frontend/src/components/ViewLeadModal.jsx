import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const DetailsItem = ({ label, value, link }) => (
  <div className="py-3 flex border-b border-gray-100">
    <dt className="text-sm font-medium text-gray-500 w-1/3">{label}</dt>
    <dd className="text-sm text-gray-900 flex-1">
      {link ? (
        <a href={link} className="text-blue-600 hover:text-blue-800" target="_blank" rel="noopener noreferrer">
          {value || "-"}
        </a>
      ) : (
        value || "-"
      )}
    </dd>
  </div>
);

const ViewLeadModal = ({ isOpen, onClose, lead }) => {
  if (!isOpen || !lead) return null;

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-[800px] max-h-[90vh] overflow-y-auto m-4">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center z-10">
          <h2 className="text-2xl font-bold text-gray-800">Lead Details</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900">{lead.name}</h3>
            <div className="mt-1 flex flex-wrap gap-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {lead.lead_source}
              </span>
              {lead.interested_country && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {lead.interested_country}
                </span>
              )}
              {lead.interested_degree && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  {lead.interested_degree}
                </span>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Contact Information</h4>
              <dl>
                <DetailsItem label="Full Name" value={lead.name} />
                <DetailsItem label="Email" value={lead.email} />
                <DetailsItem label="Phone" value={lead.phone} />
                <DetailsItem label="Nationality" value={lead.nationality} />
                <DetailsItem label="Branch" value={lead.branch_name} />
                <DetailsItem label="Lead Source" value={lead.lead_source} />
                <DetailsItem label="Referred By" value={lead.referred_by} />
              </dl>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Educational Information</h4>
              <dl>
                <DetailsItem label="Interested Country" value={lead.interested_country} />
                <DetailsItem label="Interested Degree" value={lead.interested_degree} />
                <DetailsItem label="Interested Course" value={lead.interested_course} />
                <DetailsItem label="Previous Courses" value={lead.courses_studied} />
                <DetailsItem label="GPA" value={lead.gpa} />
                <DetailsItem label="Language Test" value={lead.language_test} />
                <DetailsItem label="Language Score" value={lead.language_score} />
              </dl>
            </div>
          </div>

          <div className="mb-8">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Lead Management</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <dl>
                <DetailsItem label="Created By" value={lead.created_by_name} />
                <DetailsItem label="Created At" value={formatDate(lead.created_at)} />
              </dl>
            </div>
          </div>

          {lead.notes && (
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Notes</h4>
              <div className="bg-gray-50 p-4 rounded-lg text-gray-700 whitespace-pre-wrap">
                {lead.notes}
              </div>
            </div>
          )}

          <div className="mt-8 border-t border-gray-200 pt-4 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewLeadModal; 