import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon, ArrowUpTrayIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../lib/AuthContext';

interface Branch {
  id: number;
  name: string;
  country: string;
  city: string;
}

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// Form field component for reusability
const FormField = ({ label, error, children, required = false }: {
  label: string;
  error?: string;
  children: React.ReactNode;
  required?: boolean;
}) => (
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

// File upload component
const FileUpload = ({ id, label, accept, onChange, error, fileName }: {
  id: string;
  label: string;
  accept: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  fileName?: string;
}) => (
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
      {fileName && (
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <CheckCircleIcon className="h-5 w-5 text-green-500" />
          <span>{fileName}</span>
        </div>
      )}
    </div>
  </FormField>
);

// Component for personal info form (step 1)
const PersonalInfoForm = ({ 
  formData, 
  setFormData, 
  onNext, 
  errors, 
  branches, 
  branchId,
  handleFileChange
}: {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  onNext: () => void;
  errors: Record<string, string>;
  branches: Branch[];
  branchId: number | undefined;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => {
  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  // Find the branch name based on branch ID
  const selectedBranchName = branchId ? 
    branches.find(b => b.id === branchId)?.name || '' : '';

  return (
    <form onSubmit={handleNext} className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-2 border-b border-[#1e1b4b]/20">Personal Information</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            <option value="Other">Other</option>
          </select>
        </FormField>

        <FileUpload
          id="profilePicture"
          label="Profile Picture"
          accept="image/*"
          onChange={handleFileChange}
          error={errors.profilePicture}
          fileName={formData.profilePicture?.name}
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
          {/* Non-admin users can only see their branch as disabled input */}
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
              value={branchId}
            />
            <p className="mt-1 text-xs text-gray-500">Your branch is automatically assigned</p>
          </div>
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

// Component for education form (step 2)
const EducationForm = ({ 
  formData, 
  setFormData, 
  onBack, 
  onSubmit, 
  errors, 
  isSubmitting,
  handleFileChange
}: {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  onBack: () => void;
  onSubmit: () => void;
  errors: Record<string, string>;
  isSubmitting: boolean;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => {
  const languageTests = ['IELTS', 'PTE', 'TOEFL', 'None'];

  const handleSubmit = (e: React.FormEvent) => {
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
            {languageTests.map(test => (
              <option key={test} value={test}>{test}</option>
            ))}
          </select>
        </FormField>

        <FileUpload
          id="cv"
          label="Resume/CV (PDF only)"
          accept="application/pdf"
          onChange={handleFileChange}
          error={errors.cv}
          fileName={formData.cv?.name}
        />

        <FormField label="Address" error={errors.address}>
          <textarea
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e1b4b] transition-colors"
            rows={3}
          />
        </FormField>

        <FormField label="Comments/Notes" error={errors.comments}>
          <textarea
            value={formData.comments}
            onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e1b4b] transition-colors"
            rows={3}
          />
        </FormField>
      </div>

      <div className="flex justify-between mt-8">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-2.5 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 shadow-sm"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2.5 bg-[#1e1b4b] text-white rounded-lg hover:bg-[#1e1b4b]/90 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#1e1b4b] focus:ring-offset-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Adding Student...' : 'Add Student'}
        </button>
      </div>
    </form>
  );
};

const AddStudentModal: React.FC<AddStudentModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    age: '',
    gender: '',
    nationality: '',
    phone: '',
    emergencyContact: '',
    fatherName: '',
    motherName: '',
    parentNumber: '',
    institute: '',
    language: '',
    address: '',
    comments: '',
    profilePicture: null as File | null,
    cv: null as File | null,
  });

  // Reset everything when modal is opened/closed
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        age: '',
        gender: '',
        nationality: '',
        phone: '',
        emergencyContact: '',
        fatherName: '',
        motherName: '',
        parentNumber: '',
        institute: '',
        language: '',
        address: '',
        comments: '',
        profilePicture: null,
        cv: null,
      });
      setErrors({});
      
      // Fetch branches
      fetchBranches();
    }
  }, [isOpen]);

  const fetchBranches = async () => {
    try {
      const accessToken = localStorage.getItem("access_token");
      if (!accessToken) return;
      
      const response = await axios.get('http://localhost:8000/api/branches/', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      
      setBranches(response.data);
    } catch (error) {
      console.error("Failed to fetch branches:", error);
      toast.error("Failed to load branches");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      if (e.target.id === 'profilePicture') {
        setFormData({ ...formData, profilePicture: file });
      } else if (e.target.id === 'cv') {
        // Only accept PDF files for CV
        if (file.type !== 'application/pdf') {
          setErrors({ ...errors, cv: 'Please upload PDF files only' });
          return;
        }
        setFormData({ ...formData, cv: file });
      }
    }
  };

  const validatePersonalInfo = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    
    if (!formData.age) newErrors.age = 'Age is required';
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.nationality) newErrors.nationality = 'Nationality is required';
    if (!formData.phone) newErrors.phone = 'Phone number is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateEducationInfo = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.institute) newErrors.institute = 'Institute name is required';
    if (!formData.language) newErrors.language = 'Language test is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validatePersonalInfo()) {
      setStep(2);
    }
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleSubmit = async () => {
    if (!validateEducationInfo()) return;
    
    setIsSubmitting(true);
    
    try {
      const accessToken = localStorage.getItem("access_token");
      if (!accessToken) {
        toast.error("You are not authenticated");
        setIsSubmitting(false);
        return;
      }
      
      // Create form data for sending files
      const formDataToSend = new FormData();
      
      // Student data
      const studentData = {
        branch: user?.branch,
        age: parseInt(formData.age),
        gender: formData.gender,
        nationality: formData.nationality,
        contact_number: formData.phone,
        address: formData.address,
        institution_name: formData.institute,
        language_test: formData.language,
        emergency_contact: formData.emergencyContact,
        father_name: formData.fatherName,
        mother_name: formData.motherName,
        parent_number: formData.parentNumber,
        comments: formData.comments
      };
      
      // User data
      const userData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        role: 'Student'
      };
      
      // Append to form data
      formDataToSend.append('student_data', JSON.stringify(studentData));
      formDataToSend.append('user.first_name', userData.first_name);
      formDataToSend.append('user.last_name', userData.last_name);
      formDataToSend.append('user.email', userData.email);
      formDataToSend.append('user.role', userData.role);
      
      // Add files if selected
      if (formData.profilePicture) {
        formDataToSend.append('profile_image', formData.profilePicture);
      }
      
      if (formData.cv) {
        formDataToSend.append('resume', formData.cv);
      }
      
      // Send to the API
      await axios.post('http://localhost:8000/api/students/', formDataToSend, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      toast.success('Student added successfully');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error adding student:', error);
      
      // Process API error response
      if (error.response?.data) {
        const processErrors = (obj: any, prefix = '') => {
          const newErrors: Record<string, string> = {};
          
          Object.entries(obj).forEach(([key, value]: [string, any]) => {
            if (typeof value === 'object' && value !== null) {
              const nestedErrors = processErrors(value, key + '.');
              Object.assign(newErrors, nestedErrors);
            } else {
              const errorKey = prefix ? prefix + key : key;
              newErrors[errorKey] = Array.isArray(value) ? value[0] : value;
            }
          });
          
          return newErrors;
        };
        
        const apiErrors = processErrors(error.response.data);
        setErrors(apiErrors);
      } else {
        toast.error('Failed to add student. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={() => !isSubmitting && onClose()} className="relative z-50">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      {/* Dialog position */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-4xl rounded-lg bg-white shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <Dialog.Title className="text-xl font-semibold text-gray-900">
              Add New Student
            </Dialog.Title>
            <button 
              onClick={onClose}
              disabled={isSubmitting}
              className="text-gray-400 hover:text-gray-500 focus:outline-none disabled:opacity-50"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          
          {/* Body */}
          <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
            {step === 1 ? (
              <PersonalInfoForm 
                formData={formData}
                setFormData={setFormData}
                onNext={handleNext}
                errors={errors}
                branches={branches}
                branchId={user?.branch}
                handleFileChange={handleFileChange}
              />
            ) : (
              <EducationForm 
                formData={formData}
                setFormData={setFormData}
                onBack={handleBack}
                onSubmit={handleSubmit}
                errors={errors}
                isSubmitting={isSubmitting}
                handleFileChange={handleFileChange}
              />
            )}
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default AddStudentModal; 