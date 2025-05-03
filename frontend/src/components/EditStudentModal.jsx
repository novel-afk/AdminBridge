import { useState, useEffect } from 'react';
import { XMarkIcon, ArrowUpTrayIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

const FormField = ({ label, error, children, required }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
    {error && (
      <p className="mt-1 text-sm text-red-500 flex items-center">
        <ExclamationCircleIcon className="h-4 w-4 mr-1" />
        {error}
      </p>
    )}
  </div>
);

const FileUpload = ({ id, label, accept, value, onChange, error }) => (
  <FormField label={label} error={error}>
    <div className="flex items-center space-x-2">
      <input
        type="file"
        accept={accept}
        onChange={onChange}
        className="hidden"
        id={id}
      />
      <label
        htmlFor={id}
        className="px-4 py-2 bg-[#1e1b4b]/10 text-[#1e1b4b] rounded-lg cursor-pointer hover:bg-[#1e1b4b]/20 transition-colors flex items-center space-x-2 border border-[#1e1b4b]/20"
      >
        <ArrowUpTrayIcon className="h-5 w-5" />
        <span>Upload</span>
      </label>
      {value && (
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <CheckCircleIcon className="h-5 w-5 text-green-500" />
          <span>{typeof value === 'string' ? value : value.name}</span>
        </div>
      )}
    </div>
  </FormField>
);

const PersonalInfoForm = ({ formData, setFormData, onNext, errors }) => {
  const handleNext = (e) => {
    e.preventDefault();
    onNext();
  };

  return (
    <form onSubmit={handleNext} className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-2 border-b border-[#1e1b4b]/20">Personal Information</h2>
      <div className="grid grid-cols-2 gap-6">
        <FormField label="Name" error={errors.name} required>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className={`w-full px-4 py-2.5 border ${errors.name ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-[#1e1b4b]'} rounded-lg focus:outline-none focus:ring-2 transition-colors`}
          />
        </FormField>

        <FormField label="Age" error={errors.age} required>
          <input
            type="number"
            required
            min="1"
            max="100"
            value={formData.age}
            onChange={(e) => setFormData({ ...formData, age: e.target.value })}
            className={`w-full px-4 py-2.5 border ${errors.age ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-[#1e1b4b]'} rounded-lg focus:outline-none focus:ring-2 transition-colors`}
          />
        </FormField>

        <FormField label="Gender" error={errors.gender} required>
          <select
            required
            value={formData.gender}
            onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
            className={`w-full px-4 py-2.5 border ${errors.gender ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-[#1e1b4b]'} rounded-lg focus:outline-none focus:ring-2 transition-colors`}
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </FormField>

        <FileUpload
          id="profilePicture"
          label="Profile Picture"
          accept="image/*"
          value={formData.profilePicture}
          onChange={(e) => setFormData({ ...formData, profilePicture: e.target.files[0] })}
          error={errors.profilePicture}
        />

        <FormField label="Nationality" error={errors.nationality} required>
          <input
            type="text"
            required
            value={formData.nationality}
            onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
            className={`w-full px-4 py-2.5 border ${errors.nationality ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-[#1e1b4b]'} rounded-lg focus:outline-none focus:ring-2 transition-colors`}
          />
        </FormField>

        <FormField label="Phone Number" error={errors.phone} required>
          <input
            type="tel"
            required
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className={`w-full px-4 py-2.5 border ${errors.phone ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-[#1e1b4b]'} rounded-lg focus:outline-none focus:ring-2 transition-colors`}
          />
        </FormField>

        <FormField label="Email" error={errors.email} required>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className={`w-full px-4 py-2.5 border ${errors.email ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-[#1e1b4b]'} rounded-lg focus:outline-none focus:ring-2 transition-colors`}
          />
        </FormField>

        <FormField label="Emergency Contact" error={errors.emergencyContact}>
          <input
            type="tel"
            value={formData.emergencyContact}
            onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e1b4b] transition-colors"
          />
        </FormField>

        <FormField label="Father Name" error={errors.fatherName} required>
          <input
            type="text"
            required
            value={formData.fatherName}
            onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
            className={`w-full px-4 py-2.5 border ${errors.fatherName ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-[#1e1b4b]'} rounded-lg focus:outline-none focus:ring-2 transition-colors`}
          />
        </FormField>

        <FormField label="Mother Name" error={errors.motherName} required>
          <input
            type="text"
            required
            value={formData.motherName}
            onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
            className={`w-full px-4 py-2.5 border ${errors.motherName ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-[#1e1b4b]'} rounded-lg focus:outline-none focus:ring-2 transition-colors`}
          />
        </FormField>

        <FormField label="Parent Number" error={errors.parentNumber}>
          <input
            type="tel"
            value={formData.parentNumber}
            onChange={(e) => setFormData({ ...formData, parentNumber: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e1b4b] transition-colors"
          />
        </FormField>
      </div>

      <div className="flex justify-end mt-8">
        <button
          type="submit"
          className="px-6 py-2.5 bg-[#1e1b4b] text-white rounded-lg hover:bg-[#1e1b4b]/90 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#1e1b4b] focus:ring-offset-2 shadow-sm"
        >
          Next
        </button>
      </div>
    </form>
  );
};

const EducationForm = ({ formData, setFormData, onBack, onSubmit, errors, isSubmitting }) => {
  const languages = ['English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese', 'Other'];

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-2 border-b border-[#1e1b4b]/20">Education Background</h2>
      <div className="space-y-6">
        <FormField label="Educational Institute" error={errors.institute} required>
          <input
            type="text"
            required
            value={formData.institute}
            onChange={(e) => setFormData({ ...formData, institute: e.target.value })}
            className={`w-full px-4 py-2.5 border ${errors.institute ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-[#1e1b4b]'} rounded-lg focus:outline-none focus:ring-2 transition-colors`}
          />
        </FormField>

        <FormField label="Language" error={errors.language} required>
          <select
            required
            value={formData.language}
            onChange={(e) => setFormData({ ...formData, language: e.target.value })}
            className={`w-full px-4 py-2.5 border ${errors.language ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-[#1e1b4b]'} rounded-lg focus:outline-none focus:ring-2 transition-colors`}
          >
            <option value="">Select Language</option>
            {languages.map((lang) => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>
        </FormField>

        <FileUpload
          id="cv"
          label="CV/Resume"
          accept=".pdf,.doc,.docx"
          value={formData.cv}
          onChange={(e) => setFormData({ ...formData, cv: e.target.files[0] })}
          error={errors.cv}
        />

       
      </div>

      <div className="flex justify-between mt-8">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 shadow-sm disabled:opacity-50"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2.5 bg-[#1e1b4b] text-white rounded-lg hover:bg-[#1e1b4b]/90 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#1e1b4b] focus:ring-offset-2 shadow-sm disabled:opacity-50 flex items-center"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </button>
      </div>
    </form>
  );
};

const EditStudentModal = ({ isOpen, onClose, student, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    nationality: '',
    phone: '',
    email: '',
    emergencyContact: '',
    fatherName: '',
    motherName: '',
    parentNumber: '',
    institute: '',
    language: '',
    profilePicture: null,
    cv: null,
    degree: null,
  });

  useEffect(() => {
    if (student) {
      setFormData({
        ...formData,
        ...student,
      });
    }
  }, [student]);

  const validatePersonalInfo = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.age) newErrors.age = 'Age is required';
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.nationality) newErrors.nationality = 'Nationality is required';
    if (!formData.phone) newErrors.phone = 'Phone number is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.fatherName) newErrors.fatherName = 'Father name is required';
    if (!formData.motherName) newErrors.motherName = 'Mother name is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateEducationInfo = () => {
    const newErrors = {};
    if (!formData.institute) newErrors.institute = 'Educational institute is required';
    if (!formData.language) newErrors.language = 'Language is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validatePersonalInfo()) {
      setStep(2);
    }
  };

  const handleSubmit = async () => {
    if (validateEducationInfo()) {
      setIsSubmitting(true);
      try {
        // Here you would typically make an API call to update the student data
        console.log('Updating student:', formData);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
        if (onSuccess) {
          onSuccess();
        } else {
          onClose();
        }
      } catch (error) {
        console.error('Error updating student:', error);
        setErrors({ submit: 'Failed to update student. Please try again.' });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-[800px] max-h-[90vh] overflow-y-auto m-4">
        <div className="sticky top-0 bg-white border-b border-[#1e1b4b]/20 p-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Edit Student</h1>
            <div className="flex items-center space-x-2 mt-2">
              <div className={`h-2 w-16 rounded ${step === 1 ? 'bg-[#1e1b4b]' : 'bg-[#1e1b4b]/20'}`} />
              <div className={`h-2 w-16 rounded ${step === 2 ? 'bg-[#1e1b4b]' : 'bg-[#1e1b4b]/20'}`} />
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        
        <div className="p-6">
          {step === 1 ? (
            <PersonalInfoForm
              formData={formData}
              setFormData={setFormData}
              onNext={handleNext}
              errors={errors}
            />
          ) : (
            <EducationForm
              formData={formData}
              setFormData={setFormData}
              onBack={() => setStep(1)}
              onSubmit={handleSubmit}
              errors={errors}
              isSubmitting={isSubmitting}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default EditStudentModal; 