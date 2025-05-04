import { XMarkIcon } from '@heroicons/react/24/outline';

const InfoSection = ({ title, children }) => (
  <div className="space-y-4">
    <h2 className="text-xl font-semibold text-gray-800 pb-2 border-b border-primary-100">{title}</h2>
    <div className="grid grid-cols-2 gap-6">{children}</div>
  </div>
);

const InfoField = ({ label, value }) => (
  <div>
    <p className="text-sm font-medium text-gray-500">{label}</p>
    <p className="mt-1 text-sm text-gray-900">{value || 'Not provided'}</p>
  </div>
);

const ViewLeadModal = ({ isOpen, onClose, lead }) => {
  if (!isOpen || !lead) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-[800px] max-h-[90vh] overflow-y-auto m-4">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Lead Details</h1>
            <p className="text-sm text-gray-500 mt-1">{lead.name}'s Information</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        
        <div className="p-6 space-y-8">
          <InfoSection title="Personal Information">
            <InfoField label="Name" value={lead.name} />
            <InfoField label="Email" value={lead.email} />
            <InfoField label="Phone" value={lead.phone} />
            <InfoField label="Nationality" value={lead.nationality} />
          </InfoSection>

          <InfoSection title="Educational Background">
            <InfoField label="Current Course" value={lead.courseStudies} />
            <InfoField label="Current Degree" value={lead.degree} />
            <InfoField label="GPA" value={lead.gpa} />
          </InfoSection>

          <InfoSection title="Interest Information">
            <InfoField label="Interested Country" value={lead.interestedCountry} />
            <InfoField label="Interested Course" value={lead.interestedCourse} />
            <InfoField label="Referred By" value={lead.referredBy} />
          </InfoSection>

          <InfoSection title="Language Proficiency">
            <InfoField label="Language Test" value={lead.languageTest} />
            <InfoField label="Language Score" value={lead.languageScore} />
          </InfoSection>
        </div>
      </div>
    </div>
  );
};

export default ViewLeadModal; 