import React from 'react';
import { XMarkIcon, DocumentTextIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';

const InfoSection = ({ title, children }) => (
  <div className="space-y-4">
    <h2 className="text-xl font-semibold text-gray-800 pb-2 border-b border-[#1e1b4b]/20">{title}</h2>
    <div className="grid grid-cols-2 gap-6">{children}</div>
  </div>
);

const InfoField = ({ label, value }) => (
  <div>
    <p className="text-sm font-medium text-gray-500">{label}</p>
    <p className="mt-1 text-sm text-gray-900">{value}</p>
  </div>
);

const ViewStudentModal = ({ isOpen, onClose, student }) => {
  if (!isOpen || !student) return null;

  const getFileExtension = (filename) => {
    return filename?.split('.').pop()?.toLowerCase() || '';
  };

  const getDocumentIcon = (fileUrl) => {
    const ext = getFileExtension(fileUrl);
    
    switch(ext) {
      case 'pdf':
        return <DocumentTextIcon className="h-5 w-5 text-red-500" />;
      case 'doc':
      case 'docx':
        return <DocumentTextIcon className="h-5 w-5 text-blue-500" />;
      default:
        return <DocumentArrowDownIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-[800px] max-h-[90vh] overflow-y-auto m-4">
        <div className="sticky top-0 z-10 bg-white border-b border-[#1e1b4b]/20">
          <div className="flex justify-end p-4">
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          
          <div className="flex flex-col items-center pb-6">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 border-4 border-[#1e1b4b] mb-4">
              {student.profilePicture ? (
                <img
                  src={typeof student.profilePicture === 'string' ? student.profilePicture : URL.createObjectURL(student.profilePicture)}
                  alt={`${student.name}'s profile`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[#1e1b4b]/10 text-[#1e1b4b]">
                  <span className="text-4xl font-bold">
                    {student.name?.charAt(0)?.toUpperCase() || 'S'}
                  </span>
                </div>
              )}
            </div>
            <h1 className="text-2xl font-bold text-gray-800">{student.name}</h1>
            <p className="text-sm text-gray-500 mt-1">Student Profile</p>
          </div>
        </div>
        
        <div className="p-6 space-y-8">
          <InfoSection title="Personal Information">
            <InfoField label="Age" value={student.age} />
            <InfoField label="Gender" value={student.gender} />
            <InfoField label="Nationality" value={student.nationality} />
            <InfoField label="Phone Number" value={student.phone} />
            <InfoField label="Email" value={student.email} />
            <InfoField label="Emergency Contact" value={student.emergencyContact || 'Not provided'} />
          </InfoSection>

          <InfoSection title="Family Information">
            <InfoField label="Father's Name" value={student.fatherName} />
            <InfoField label="Mother's Name" value={student.motherName} />
            <InfoField label="Parent's Contact" value={student.parentNumber || 'Not provided'} />
          </InfoSection>

          <InfoSection title="Education Information">
            <InfoField label="Educational Institute" value={student.institute || 'Not provided'} />
            <InfoField label="Language Test" value={student.language || 'Not provided'} />
          </InfoSection>

          <InfoSection title="Documents">
            <div className="col-span-2">
              {student.cv ? (
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getDocumentIcon(student.cv)}
                      <div>
                        <h4 className="font-medium text-gray-900">CV/Resume</h4>
                        <p className="text-sm text-gray-500 mt-0.5 max-w-sm truncate">
                          {typeof student.cv === 'string' 
                            ? student.cv.split('/').pop() 
                            : student.cv.name}
                        </p>
                      </div>
                    </div>
                    {typeof student.cv === 'string' && (
                      <a 
                        href={student.cv}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#1e1b4b] hover:bg-[#1e1b4b]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1e1b4b] transition-colors"
                      >
                        View Document
                      </a>
                    )}
                  </div>
                </div>
              ) : (
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 flex justify-center items-center">
                  <p className="text-sm text-gray-500">No documents uploaded</p>
                </div>
              )}
            </div>
          </InfoSection>
        </div>
      </div>
    </div>
  );
};

export default ViewStudentModal; 