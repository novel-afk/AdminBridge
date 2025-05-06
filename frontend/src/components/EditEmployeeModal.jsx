import React, { useState, useEffect } from 'react';
import { XMarkIcon, ArrowUpTrayIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import toast from 'react-hot-toast';
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

const FileUpload = ({ id, label, accept, value, onChange, error, existingFile }) => (
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
      {value ? (
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <CheckCircleIcon className="h-5 w-5 text-green-500" />
          <span>{value.name}</span>
        </div>
      ) : existingFile ? (
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <CheckCircleIcon className="h-5 w-5 text-green-500" />
          <span>Existing file</span>
          {typeof existingFile === 'string' && (
            <a href={existingFile} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              View
            </a>
          )}
        </div>
      ) : null}
    </div>
  </FormField>
);

const PersonalInfoForm = ({ formData, setFormData, onNext, errors, branches }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'SuperAdmin';
  
  // Find the branch name based on branch ID
  const selectedBranchName = branches.find(b => b.id.toString() === formData.branch.toString())?.name || '';
  
  // Check if editing a SuperAdmin (for protection)
  const isEditingSuperAdmin = formData.role === 'SuperAdmin';

  const handleNext = (e) => {
    e.preventDefault();
    onNext();
  };

  const roles = user?.role === 'SuperAdmin' 
    ? ['SuperAdmin', 'BranchManager', 'Counsellor', 'Receptionist']
    : ['Counsellor', 'Receptionist'];

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

        <FormField label="Role" error={errors.role} required>
          <select
            required
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            className={`w-full px-4 py-2.5 border ${errors.role ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-[#1e1b4b]'} rounded-lg focus:outline-none focus:ring-2 transition-colors`}
            disabled={isEditingSuperAdmin && user?.role !== 'SuperAdmin'}
          >
            <option value="">Select Role</option>
            {roles.map((role) => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
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
          value={formData.profilePicture}
          onChange={(e) => setFormData({ ...formData, profilePicture: e.target.files[0] })}
          error={errors.profilePicture}
          existingFile={formData.existingProfilePicture}
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
        
        <FormField label="Date of Birth" error={errors.dob}>
          <input
            type="date"
            value={formData.dob}
            onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
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

const EmploymentDetailsForm = ({ formData, setFormData, onBack, onSubmit, errors, isSubmitting }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-2 border-b border-[#1e1b4b]/20">Employment Details</h2>
      <div className="space-y-6">
        <FormField label="Salary" error={errors.salary} required>
          <input
            type="number"
            step="0.01"
            required
            value={formData.salary}
            onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
            className={`w-full px-4 py-2.5 border ${errors.salary ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-[#1e1b4b]'} rounded-lg focus:outline-none focus:ring-2 transition-colors`}
          />
        </FormField>

        <FormField label="Address" error={errors.address} required>
          <textarea
            required
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            rows={3}
            className={`w-full px-4 py-2.5 border ${errors.address ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-[#1e1b4b]'} rounded-lg focus:outline-none focus:ring-2 transition-colors`}
          />
        </FormField>

        <FileUpload
          id="citizenshipDocument"
          label="Citizenship Document"
          accept=".pdf,.doc,.docx"
          value={formData.citizenshipDocument}
          onChange={(e) => setFormData({ ...formData, citizenshipDocument: e.target.files[0] })}
          error={errors.citizenshipDocument}
          existingFile={formData.existingCitizenshipDocument}
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
              Updating...
            </>
          ) : (
            'Update'
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

const EditEmployeeModal = ({ isOpen, onClose, onSuccess, employee }) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [branches, setBranches] = useState([]);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    role: '',
    gender: '',
    nationality: '',
    phone: '',
    email: '',
    branch: '',
    emergencyContact: '',
    dob: '',
    salary: '',
    address: '',
    profilePicture: null,
    citizenshipDocument: null,
    existingProfilePicture: null,
    existingCitizenshipDocument: null,
  });

  // Extract data from employee prop when component mounts
  const { user } = useAuth();
  const [selectedBranch, setSelectedBranch] = useState(userBranch);
  
  // Define available roles based on current user's role
  const roles = user?.role === 'SuperAdmin' 
    ? ['SuperAdmin', 'BranchManager', 'Counsellor', 'Receptionist'] 
    : ['Counsellor', 'Receptionist'];
    
  // Check if editing a SuperAdmin (for protection)
  const isEditingSuperAdmin = employee?.user?.role === 'SuperAdmin';

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

  // Initialize form data when the employee prop changes
  useEffect(() => {
    if (employee) {
      setFormData({
        firstName: employee.user.first_name || '',
        lastName: employee.user.last_name || '',
        role: employee.user.role || '',
        gender: employee.gender || '',
        nationality: employee.nationality || '',
        phone: employee.contact_number || '',
        email: employee.user.email || '',
        branch: employee.branch || '',
        emergencyContact: employee.emergency_contact || '',
        dob: employee.dob ? new Date(employee.dob).toISOString().split('T')[0] : '',
        salary: employee.salary || '',
        address: employee.address || '',
        profilePicture: null,
        citizenshipDocument: null,
        existingProfilePicture: employee.profile_image,
        existingCitizenshipDocument: employee.citizenship_document,
      });
    }
  }, [employee]);

  const validatePersonalInfo = () => {
    const newErrors = {};
    
    // Required field validation
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.role) newErrors.role = 'Role is required';
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateEmploymentDetails = () => {
    const newErrors = {};

    if (!formData.salary) newErrors.salary = 'Salary is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    
    // File size validation (if files are present)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (formData.citizenshipDocument && formData.citizenshipDocument.size > maxSize) {
      newErrors.citizenshipDocument = 'File size should be less than 5MB';
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
    if (validatePersonalInfo()) {
      setStep(2);
    }
  };

  if (!isOpen || !employee) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-[800px] max-h-[90vh] overflow-y-auto m-4">
        <div className="sticky top-0 bg-white border-b border-[#1e1b4b]/20 p-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Edit Employee</h1>
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
            <EmploymentDetailsForm
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

export default EditEmployeeModal; 