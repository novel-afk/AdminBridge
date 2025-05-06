import React, { useState, useEffect } from 'react';
import { XMarkIcon, ArrowUpTrayIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import toast from 'react-hot-toast';

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
          <span>{value.name}</span>
        </div>
      )}
    </div>
  </FormField>
);

const PersonalInfoForm = ({ formData, setFormData, onNext, errors, branches }) => {
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

        <FormField label="Branch" error={errors.branch} required>
          <select
            required
            value={formData.branch}
            onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
            className={`w-full px-4 py-2.5 border ${errors.branch ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-[#1e1b4b]'} rounded-lg focus:outline-none focus:ring-2 transition-colors`}
          >
            <option value="">Select Branch</option>
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>{branch.name}</option>
            ))}
          </select>
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
  const languageTests = ['IELTS', 'PTE', 'TOEFL', 'None'];

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

        <FormField label="Language Test" error={errors.language} required>
          <select
            required
            value={formData.language}
            onChange={(e) => setFormData({ ...formData, language: e.target.value })}
            className={`w-full px-4 py-2.5 border ${errors.language ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-[#1e1b4b]'} rounded-lg focus:outline-none focus:ring-2 transition-colors`}
          >
            <option value="">Select Language Test</option>
            {languageTests.map((test) => (
              <option key={test} value={test}>{test}</option>
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
              Submitting...
            </>
          ) : (
            'Submit'
          )}
        </button>
      </div>

      {errors.submit && (
        <p className="mt-2 text-sm text-red-500 flex items-center">
          <ExclamationCircleIcon className="h-4 w-4 mr-1" />
          {errors.submit}
        </p>
      )}
    </form>
  );
};

const AddStudentModal = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [branches, setBranches] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    nationality: '',
    phone: '',
    email: '',
    branch: '',
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
    const fetchBranches = async () => {
      try {
        const accessToken = localStorage.getItem('access_token');
        const response = await axios.get('http://localhost:8000/api/branches/', {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        setBranches(response.data);
      } catch (error) {
        console.error('Error fetching branches:', error);
      }
    };

    if (isOpen) {
      fetchBranches();
    }
  }, [isOpen]);

  const validatePersonalInfo = () => {
    const newErrors = {};
    
    // Required field validation
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.age) newErrors.age = 'Age is required';
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.nationality.trim()) newErrors.nationality = 'Nationality is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.branch) newErrors.branch = 'Branch is required';
    if (!formData.fatherName.trim()) newErrors.fatherName = 'Father name is required';
    if (!formData.motherName.trim()) newErrors.motherName = 'Mother name is required';

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    // Phone number validation
    const phoneRegex = /^\+?[\d\s-]{10,}$/;
    if (formData.phone && !phoneRegex.test(formData.phone)) {
      newErrors.phone = 'Invalid phone number format';
    }

    // Age validation
    if (formData.age && (formData.age < 1 || formData.age > 100)) {
      newErrors.age = 'Age must be between 1 and 100';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateEducationInfo = () => {
    const newErrors = {};

    if (!formData.institute.trim()) newErrors.institute = 'Educational institute is required';
    
    // Validate that the language test is one of the accepted values
    if (!formData.language) {
      newErrors.language = 'Language test is required';
    } else if (!['IELTS', 'PTE', 'TOEFL', 'None'].includes(formData.language)) {
      newErrors.language = 'Invalid language test selection';
    }

    // File size validation (if files are present)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (formData.cv && formData.cv.size > maxSize) {
      newErrors.cv = 'CV file size should be less than 5MB';
    }

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
      setErrors({});
      
      // Split name into first and last name
      const nameParts = formData.name.split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
      
      // Create the student data object in the format the backend expects
      const studentData = {
        branch: formData.branch,
        age: formData.age,
        gender: formData.gender,
        nationality: formData.nationality,
        contact_number: formData.phone,
        address: "Not provided", // Default value
        institution_name: formData.institute,
        language_test: formData.language,
        emergency_contact: formData.emergencyContact || '',
        mother_name: formData.motherName || '',
        father_name: formData.fatherName || '',
        parent_number: formData.parentNumber || '',
        comments: ''
      };
      
      // Get access token
      const accessToken = localStorage.getItem('access_token');
      
      if (!accessToken) {
        setErrors({ submit: 'You must be logged in to perform this action' });
        setIsSubmitting(false);
        return;
      }
      
      // Create FormData object for file uploads
      const formDataToSend = new FormData();
      
      // Add the student data as JSON
      formDataToSend.append('student_data', JSON.stringify(studentData));
      
      // Add user data fields
      formDataToSend.append('user.first_name', firstName);
      formDataToSend.append('user.last_name', lastName);
      formDataToSend.append('user.email', formData.email);
      formDataToSend.append('user.password', 'Student@123'); // Default password
      
      // Add files if they exist
      if (formData.profilePicture) {
        formDataToSend.append('profile_image', formData.profilePicture);
      }
      
      if (formData.cv) {
        formDataToSend.append('resume', formData.cv);
      }
      
      try {
        // Log form data for debugging
        console.log("Sending student data:", studentData);
        
        // Make API call to create student
        const response = await axios.post(
          'http://localhost:8000/api/students/',
          formDataToSend,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        
        console.log('Student created successfully:', response.data);
        
        if (onSuccess) {
          onSuccess();
        } else {
          onClose();
        }
      } catch (error) {
        console.error('Error creating student:', error);
        
        // Handle different types of API errors
        let errorMessage = 'Failed to save student. Please try again.';
        
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.error('Error response data:', error.response.data);
          
          const newErrors = {};
          
          if (error.response.data.detail) {
            newErrors.submit = error.response.data.detail;
            toast.error(error.response.data.detail);
          } else if (typeof error.response.data === 'object') {
            // Map backend field errors to form fields
            const processErrors = (obj, prefix = '') => {
              Object.entries(obj).forEach(([key, value]) => {
                // If value is an object and not an array, recurse
                if (value && typeof value === 'object' && !Array.isArray(value)) {
                  processErrors(value, `${prefix}${key}.`);
                  return;
                }
                
                const errorMessage = Array.isArray(value) ? value.join(', ') : value;
                const fullKey = `${prefix}${key}`;
                
                // Map user.email errors to email field
                if (fullKey === 'user.email' || key === 'email') {
                  newErrors.email = errorMessage;
                  toast.error('Email already exists');
                }
                // Map phone_number errors to phoneNumber field
                else if (key === 'phone_number') {
                  newErrors.phoneNumber = errorMessage;
                  toast.error('Phone number already exists');
                }
                // Keep other field errors as is
                else {
                  newErrors[key] = errorMessage;
                }
              });
            };
            
            processErrors(error.response.data);
            
            // If we have field-specific errors but no submit error, add a general error
            if (Object.keys(newErrors).length > 0 && !newErrors.submit) {
              newErrors.submit = 'Please correct the errors below.';
            }
          }
          
          // If no specific errors were mapped, use the generic error message
          if (Object.keys(newErrors).length === 0) {
            newErrors.submit = errorMessage;
            toast.error(errorMessage);
          }
          
          setErrors(newErrors);
        } else if (error.request) {
          // The request was made but no response was received
          setErrors({ submit: 'No response received from server. Please check your connection.' });
          toast.error('No response received from server. Please check your connection.');
        }
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
            <h1 className="text-2xl font-bold text-gray-800">Add New Student</h1>
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
              branches={branches}
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

export default AddStudentModal; 