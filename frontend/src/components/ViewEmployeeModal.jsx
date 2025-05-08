import React from 'react';
import { XMarkIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';

const BACKEND_URL = 'http://localhost:8000';
const getFullUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${BACKEND_URL}${url}`;
};

const DetailsItem = ({ label, value, isLink }) => (
  <div className="py-3 flex border-b border-gray-100">
    <dt className="text-sm font-medium text-gray-500 w-1/3">{label}</dt>
    <dd className="text-sm text-gray-900 flex-1">
      {isLink && value ? (
        <a 
          href={value} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 flex items-center"
        >
          View Document
          <ArrowTopRightOnSquareIcon className="h-4 w-4 ml-1" />
        </a>
      ) : (
        value || "-"
      )}
    </dd>
  </div>
);

const ViewEmployeeModal = ({ isOpen, onClose, employee }) => {
  if (!isOpen || !employee) return null;

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

  // Format salary with currency
  const formatSalary = (salary) => {
    if (!salary) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(salary);
  };

  // Fallback for broken images
  const [imgError, setImgError] = React.useState(false);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-[800px] max-h-[90vh] overflow-y-auto m-4">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center z-10">
          <h2 className="text-2xl font-bold text-gray-800">Employee Details</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="mb-8 flex items-center">
            <div className="mr-4">
              {employee.profile_image && !imgError ? (
                <img
                  src={getFullUrl(employee.profile_image)}
                  alt={`${employee.user.first_name} ${employee.user.last_name}`}
                  className="w-24 h-24 rounded-full object-cover"
                  onError={() => setImgError(true)}
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-[#1e1b4b]/10 flex items-center justify-center text-[#1e1b4b] text-2xl font-semibold">
                  {`${employee.user.first_name.charAt(0)}${employee.user.last_name.charAt(0)}`}
                </div>
              )}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">{employee.user.first_name} {employee.user.last_name}</h3>
              <p className="text-gray-500">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                  {employee.user.role}
                </span>
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 mt-1">
                  {employee.employee_id}
                </span>
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Personal Information</h4>
              <dl>
                <DetailsItem label="Full Name" value={`${employee.user.first_name} ${employee.user.last_name}`} />
                <DetailsItem label="Email" value={employee.user.email} />
                <DetailsItem label="Phone" value={employee.contact_number} />
                <DetailsItem label="Gender" value={employee.gender} />
                <DetailsItem label="Nationality" value={employee.nationality} />
                <DetailsItem label="Date of Birth" value={formatDate(employee.dob)} />
                <DetailsItem label="Emergency Contact" value={employee.emergency_contact} />
              </dl>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Employment Information</h4>
              <dl>
                <DetailsItem label="Employee ID" value={employee.employee_id} />
                <DetailsItem label="Role" value={employee.user.role} />
                <DetailsItem label="Branch" value={employee.branch_name} />
                <DetailsItem label="Joining Date" value={formatDate(employee.joining_date)} />
                <DetailsItem label="Salary" value={formatSalary(employee.salary)} />
                <DetailsItem label="Address" value={employee.address} />
                <DetailsItem label="Citizenship Document" value={employee.citizenship_document ? getFullUrl(employee.citizenship_document) : null} isLink={!!employee.citizenship_document} />
              </dl>
            </div>
          </div>

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

export default ViewEmployeeModal; 