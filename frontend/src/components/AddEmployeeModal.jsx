import React, { useState, useEffect, useRef } from 'react';
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
        </div>
      )}
    </div>
  </FormField>
);

const PersonalInfoForm = ({ formData, setFormData, onNext, errors, branches, userBranch, isAdmin }) => {
  const { user } = useAuth();
  const selectedBranchName = userBranch?.name || '';
  
  // Define available roles based on current user's role
  const roles = user?.role === 'SuperAdmin' 
    ? ['SuperAdmin', 'BranchManager', 'Counsellor', 'Receptionist'] 
    : ['Counsellor', 'Receptionist'];

  const handleNext = (e) => {
    e.preventDefault();
    onNext();
  };

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
                value={formData.branch} 
                name="branch" 
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

const AddEmployeeModal = ({ isOpen, onClose, onSuccess }) => {
  const { user } = useAuth();
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
  });

  // Check if the current user is an admin
  const isAdmin = user?.role === 'SuperAdmin';

  const firstNameRef = useRef(null);
  const lastNameRef = useRef(null);
  const emailRef = useRef(null);
  const roleRef = useRef(null);
  const genderRef = useRef(null);
  const nationalityRef = useRef(null);
  const phoneRef = useRef(null);
  const dobRef = useRef(null);
  const salaryRef = useRef(null);
  const addressRef = useRef(null);

  // Initial state for formData and errors
  const initialFormData = {
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
  };
  const initialErrors = {};

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

    if (isOpen) {
      fetchBranches();
    }
  }, [isOpen, user, isAdmin]);

  const validatePersonalInfo = () => {
    const newErrors = {};
    
    // Required field validation
    if (!formData.firstName.trim()) newErrors.firstName = 'First Name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last Name is required';
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
    if (validateEmploymentDetails()) {
      setIsSubmitting(true);
      setErrors({});
      
      // Create the employee data object in the format the backend expects
      const employeeData = {
        branch: formData.branch,
        gender: formData.gender,
        nationality: formData.nationality,
        contact_number: formData.phone,
        address: formData.address,
        emergency_contact: formData.emergencyContact || '',
        salary: formData.salary,
        dob: formData.dob || null
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
      
      // Add the employee data as JSON
      formDataToSend.append('employee_data', JSON.stringify(employeeData));
      
      // Add user data fields
      formDataToSend.append('user.first_name', formData.firstName);
      formDataToSend.append('user.last_name', formData.lastName);
      formDataToSend.append('user.email', formData.email);
      formDataToSend.append('user.role', formData.role);
      formDataToSend.append('user.password', 'Employee@123'); // Default password
      
      // Add files if they exist
      if (formData.profilePicture) {
        formDataToSend.append('profile_image', formData.profilePicture);
      }
      
      if (formData.citizenshipDocument) {
        formDataToSend.append('citizenship_document', formData.citizenshipDocument);
      }
      
      try {
        // Log form data for debugging
        console.log("Sending employee data:", employeeData);
        
        // Make API call to create employee
        const response = await axios.post(
          'http://localhost:8000/api/employees/',
          formDataToSend,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        
        console.log('Employee created successfully:', response.data);
        
        if (onSuccess) {
          onSuccess();
        } else {
          onClose();
        }
      } catch (err) {
        setIsSubmitting(false);
        if (err.response && err.response.data) {
          const errors = err.response.data;
          setErrors(errors);
          // Show toast for the first error, including nested errors
          function extractFirstError(obj) {
            if (!obj) return null;
            if (typeof obj === 'string') return obj;
            if (Array.isArray(obj) && obj.length > 0) return obj[0];
            if (typeof obj === 'object') {
              for (const key in obj) {
                const errMsg = extractFirstError(obj[key]);
                if (errMsg) return errMsg;
              }
            }
            return null;
          }
          const firstError = extractFirstError(errors);
          if (firstError) toast.error(firstError);
          // Focus the first field with an error
          if (errors.first_name && firstNameRef.current) firstNameRef.current.focus();
          else if (errors.last_name && lastNameRef.current) lastNameRef.current.focus();
          else if (errors.email && emailRef.current) emailRef.current.focus();
          else if (errors.role && roleRef.current) roleRef.current.focus();
          else if (errors.gender && genderRef.current) genderRef.current.focus();
          else if (errors.nationality && nationalityRef.current) nationalityRef.current.focus();
          else if (errors.contact_number && phoneRef.current) phoneRef.current.focus();
          else if (errors.dob && dobRef.current) dobRef.current.focus();
          else if (errors.salary && salaryRef.current) salaryRef.current.focus();
          else if (errors.address && addressRef.current) addressRef.current.focus();
          return;
        }
        toast.error('Failed to add employee. Please try again.');
        return;
      }
    }
  };

  // Reset modal state on close
  const handleClose = () => {
    setFormData(initialFormData);
    setErrors(initialErrors);
    setStep(1);
    setIsSubmitting(false);
    if (onClose) onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-[800px] max-h-[90vh] overflow-y-auto m-4">
        <div className="sticky top-0 bg-white border-b border-[#1e1b4b]/20 p-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Add New Employee</h1>
            <div className="flex items-center space-x-2 mt-2">
              <div className={`h-2 w-16 rounded ${step === 1 ? 'bg-[#1e1b4b]' : 'bg-[#1e1b4b]/20'}`} />
              <div className={`h-2 w-16 rounded ${step === 2 ? 'bg-[#1e1b4b]' : 'bg-[#1e1b4b]/20'}`} />
            </div>
          </div>
          <button
            onClick={handleClose}
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
              firstNameRef={firstNameRef}
              lastNameRef={lastNameRef}
              emailRef={emailRef}
              roleRef={roleRef}
              genderRef={genderRef}
              nationalityRef={nationalityRef}
              phoneRef={phoneRef}
              dobRef={dobRef}
              salaryRef={salaryRef}
              addressRef={addressRef}
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

export default AddEmployeeModal; 