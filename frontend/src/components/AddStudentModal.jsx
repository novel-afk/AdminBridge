import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { XMarkIcon, ArrowUpTrayIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../lib/AuthContext';

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
          {id === 'profilePicture' && value.type.startsWith('image/') && (
            <img 
              src={URL.createObjectURL(value)} 
              alt="Preview" 
              className="h-10 w-10 object-cover rounded"
            />
          )}
        </div>
      )}
    </div>
  </FormField>
);

const PersonalInfoForm = ({ formData, setFormData, onNext, errors, branches, userBranch, isAdmin }) => {
  const handleNext = (e) => {
    e.preventDefault();
    onNext();
  };

  // Find the branch name based on branch ID
  const selectedBranchName = userBranch ? 
    branches.find(b => b.id.toString() === userBranch.toString())?.name || '' : '';

  return (
    <form onSubmit={handleNext} className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-2 border-b border-[#1e1b4b]/20">Personal Information</h2>
      <div className="grid grid-cols-2 gap-6">
        <FormField label="First Name" error={errors.firstName} required>
          <input
            type="text"
            required
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            className={`w-full px-4 py-2.5 border ${errors.firstName ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-[#1e1b4b]'} rounded-lg focus:outline-none focus:ring-2 transition-colors`}
          />
        </FormField>

        <FormField label="Last Name" error={errors.lastName} required>
          <input
            type="text"
            required
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            className={`w-full px-4 py-2.5 border ${errors.lastName ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-[#1e1b4b]'} rounded-lg focus:outline-none focus:ring-2 transition-colors`}
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
          {isAdmin ? (
            // SuperAdmin can select any branch
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
          ) : (
            // Non-admin users can only see their branch as disabled input
            <div>
              <input
                type="text"
                value={selectedBranchName}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-100"
                disabled
              />
              <input 
                type="hidden" 
                name="branch" 
                value={formData.branch} 
              />
              <p className="mt-1 text-xs text-gray-500">Your branch is automatically assigned</p>
            </div>
          )}
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

        <FormField label="Parent Number" error={errors.parentNumber}>
          <input
            type="tel"
            value={formData.parentNumber}
            onChange={(e) => setFormData({ ...formData, parentNumber: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e1b4b] transition-colors"
          />
        </FormField>

        <FormField label="Father Name" error={errors.fatherName}>
          <input
            type="text"
            value={formData.fatherName}
            onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e1b4b] transition-colors"
          />
        </FormField>

        <FormField label="Mother Name" error={errors.motherName}>
          <input
            type="text"
            value={formData.motherName}
            onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
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

const AddStudentModal = ({ onClose, onSuccess, initialData }) => {
  console.log('AddStudentModal mounted');
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [branches, setBranches] = useState([]);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
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

  // Prefill formData if initialData is provided
  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        ...initialData,
        branch: initialData.branch ? initialData.branch.toString() : prev.branch,
      }));
    }
  }, [initialData]);

  // Check if the current user is an admin
  const isAdmin = user?.role === 'SuperAdmin';

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const accessToken = localStorage.getItem('access_token');
        const response = await axios.get('http://localhost:8000/api/branches/', {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        setBranches(response.data);
        // If user has a branch and is not admin, auto-select their branch
        if (user?.branch && !isAdmin) {
          setFormData(prev => ({ ...prev, branch: user.branch.toString() }));
        } else if (response.data.length > 0) {
          // For admin users, select the first branch as default
          setFormData(prev => ({ ...prev, branch: response.data[0].id.toString() }));
        }
      } catch (error) {
        console.error('Error fetching branches:', error);
      }
    };
    fetchBranches();
  }, [user, isAdmin]);

  const validatePersonalInfo = () => {
    const newErrors = {};
    
    // Required field validation
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.age) newErrors.age = 'Age is required';
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.nationality.trim()) newErrors.nationality = 'Nationality is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.branch) newErrors.branch = 'Branch is required';

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
    if (Object.keys(newErrors).length > 0) {
      toast.error(Object.values(newErrors)[0]);
    }
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
    if (Object.keys(newErrors).length > 0) {
      toast.error(Object.values(newErrors)[0]);
    }
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
      formDataToSend.append('user.first_name', formData.firstName);
      formDataToSend.append('user.last_name', formData.lastName);
      formDataToSend.append('user.email', formData.email);
      formDataToSend.append('user.password', 'Nepal@123'); // Default password for all roles
      formDataToSend.append('user.role', 'Student');
      
      // Add files if they exist
      if (formData.profilePicture) {
        formDataToSend.append('profile_image', formData.profilePicture);
      }
      
      if (formData.cv) {
        formDataToSend.append('resume', formData.cv);
      }

      // Log the form data to debug
      console.log('Submitting data:', {
        student_data: studentData,
        user_data: {
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          password: 'Nepal@123',
          role: 'Student'
        },
        has_profile_image: !!formData.profilePicture,
        has_resume: !!formData.cv,
        father_name: formData.fatherName,
        mother_name: formData.motherName
      });
      
      try {
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
        let errorMessage = 'Failed to save student. Please try again.';
        let toastShown = false;
        if (error.response) {
          // Collect all string errors recursively
          function collectStringErrors(obj) {
            let errors = [];
            if (!obj) return errors;
            if (typeof obj === 'string') {
              if (obj.length < 200 && !obj.includes('django.db.models')) errors.push(obj);
              return errors;
            }
            if (Array.isArray(obj)) {
              obj.forEach(item => { errors = errors.concat(collectStringErrors(item)); });
              return errors;
            }
            if (typeof obj === 'object') {
              Object.values(obj).forEach(val => { errors = errors.concat(collectStringErrors(val)); });
              return errors;
            }
            return errors;
          }
          const allErrors = collectStringErrors(error.response.data);
          // Prefer known field errors for toast
          const fieldOrder = ['email', 'user.email', 'first_name', 'user.first_name', 'last_name', 'user.last_name', 'phone', 'contact_number'];
          let toastError = null;
          for (const field of fieldOrder) {
            if (error.response.data[field]) {
              toastError = Array.isArray(error.response.data[field]) ? error.response.data[field][0] : error.response.data[field];
              break;
            }
          }
          if (!toastError && allErrors.length > 0) toastError = allErrors[0];
          if (toastError) {
            toast.error(`Error: ${toastError}`);
            toastShown = true;
          }
          // Map errors to fields for inline validation
          const newErrors = {};
          const processErrors = (obj, prefix = '') => {
            Object.entries(obj).forEach(([key, value]) => {
              if (value && typeof value === 'object' && !Array.isArray(value)) {
                processErrors(value, `${prefix}${key}.`);
                return;
              }
              const errorMsg = Array.isArray(value) ? value.join(', ') : value;
              if (key === 'user.email' || key === 'email') newErrors.email = errorMsg;
              else if (key === 'user.first_name' || key === 'first_name' || key === 'firstName') newErrors.firstName = errorMsg;
              else if (key === 'user.last_name' || key === 'last_name' || key === 'lastName') newErrors.lastName = errorMsg;
              else if (key === 'phone' || key === 'contact_number') newErrors.phone = errorMsg;
              else newErrors[`${prefix}${key}`] = errorMsg;
            });
          };
          if (typeof error.response.data === 'object') {
            processErrors(error.response.data);
          }
          if (Object.keys(newErrors).length === 0 && !toastShown) {
            toast.error(errorMessage);
          }
          setErrors(newErrors);
        } else if (error.request) {
          setErrors({ submit: 'No response received from server. Please check your connection.' });
          toast.error('No response received from server. Please check your connection.');
        }
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const modalContent = (
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
              userBranch={user?.branch}
              isAdmin={isAdmin}
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
  return ReactDOM.createPortal(modalContent, document.body);
};

export default AddStudentModal; 