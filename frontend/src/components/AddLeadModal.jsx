import React, { useState, useEffect } from 'react';
import { XMarkIcon, ExclamationCircleIcon, ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
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

/**
 * @param {{ isOpen: boolean, onClose: () => void, onSuccess: () => void }} props
 */
const AddLeadModal = ({ isOpen, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    nationality: '',
    branch: '',
    interested_country: '',
    interested_degree: '',
    interested_course: '',
    language_test: 'None',
    language_score: '',
    lead_source: 'Other',
    referred_by: '',
    courses_studied: '',
    gpa: '',
    notes: '',
  });

  const [errors, setErrors] = useState({});
  const [branches, setBranches] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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

    if (isOpen) {
      fetchBranches();
    }
  }, [isOpen, user, isAdmin]);

  const validateStep1 = () => {
    const newErrors = {};
    
    // Required fields validation
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    if (!formData.nationality.trim()) newErrors.nationality = 'Nationality is required';
    if (!formData.branch) newErrors.branch = 'Branch is required';
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    // Phone validation
    const phoneRegex = /^\+?[\d\s-]{10,}$/;
    if (formData.phone && !phoneRegex.test(formData.phone)) {
      newErrors.phone = 'Invalid phone number format';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const validateStep2 = () => {
    const newErrors = {};
    
    // GPA validation
    if (formData.gpa && (isNaN(formData.gpa) || parseFloat(formData.gpa) < 0 || parseFloat(formData.gpa) > 4.0)) {
      newErrors.gpa = 'GPA should be between 0 and 4.0';
    }
    
    // Language score validation
    if (formData.language_score && (isNaN(formData.language_score) || parseFloat(formData.language_score) < 0)) {
      newErrors.language_score = 'Language score must be a positive number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (currentStep === 1) {
      handleNextStep();
      return;
    }
    
    if (!validateStep2()) {
      return;
    }
    
    setIsSubmitting(true);
    
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      setErrors({ submit: 'You must be logged in to perform this action' });
      setIsSubmitting(false);
      return;
    }
    
    try {
      const response = await axios.post(
        'http://localhost:8000/api/leads/',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Lead created successfully:', response.data);
      
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (error) {
      console.error('Error creating lead:', error);
      const newErrors = {};
      
      if (error.response) {
        if (error.response.data.detail) {
          newErrors.submit = error.response.data.detail;
        } else if (typeof error.response.data === 'object') {
          Object.entries(error.response.data).forEach(([key, value]) => {
            if (key === 'user.email' || key === 'email') {
              newErrors.email = 'Email already exists';
              newErrors.submit = 'Email already exists. Please use a different email.';
            } else {
              newErrors[key] = Array.isArray(value) ? value[0] : value;
            }
          });
        }
      } else {
        newErrors.submit = 'Failed to create lead. Please try again.';
      }
      
      setErrors(newErrors);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const renderStepIndicator = () => {
    return (
      <div className="flex items-center justify-center mb-6">
        <div className="flex items-center">
          <div className={`rounded-full h-8 w-8 flex items-center justify-center ${
            currentStep === 1 ? 'bg-[#1e1b4b] text-white' : 'bg-gray-200 text-gray-700'
          }`}>
            1
          </div>
          <div className={`h-1 w-12 ${
            currentStep === 2 ? 'bg-[#1e1b4b]' : 'bg-gray-200'
          }`}></div>
          <div className={`rounded-full h-8 w-8 flex items-center justify-center ${
            currentStep === 2 ? 'bg-[#1e1b4b] text-white' : 'bg-gray-200 text-gray-700'
          }`}>
            2
          </div>
        </div>
      </div>
    );
  };
  
  const renderPersonalInfoForm = () => {
    // Find the branch name based on branch ID
    const selectedBranchName = user?.branch ? 
      branches.find(b => b.id.toString() === user.branch.toString())?.name || '' : '';
      
    return (
      <>
        <h2 className="text-lg font-semibold text-gray-800 pb-2 border-b border-gray-200 mb-4">
          Personal Information
        </h2>
        
        <div className="space-y-4">
          <FormField label="Full Name" error={errors.name} required>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full px-4 py-2.5 border ${errors.name ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-[#1e1b4b]'} rounded-lg focus:outline-none focus:ring-2 transition-colors`}
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
          
          <FormField label="Phone Number" error={errors.phone} required>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className={`w-full px-4 py-2.5 border ${errors.phone ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-[#1e1b4b]'} rounded-lg focus:outline-none focus:ring-2 transition-colors`}
            />
          </FormField>
          
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
                value={formData.branch}
                onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e1b4b]"
                required
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
                  value={branches.find(b => b.id.toString() === formData.branch)?.name || ''}
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
          
          <FormField label="Lead Source" error={errors.lead_source}>
            <select
              value={formData.lead_source}
              onChange={(e) => setFormData({ ...formData, lead_source: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e1b4b] transition-colors"
            >
              <option value="Website">Website</option>
              <option value="Social Media">Social Media</option>
              <option value="Referral">Referral</option>
              <option value="Walk-in">Walk-in</option>
              <option value="Phone Inquiry">Phone Inquiry</option>
              <option value="Email">Email</option>
              <option value="Event">Event</option>
              <option value="Other">Other</option>
            </select>
          </FormField>
          
          <FormField label="Referred By" error={errors.referred_by}>
            <input
              type="text"
              value={formData.referred_by}
              onChange={(e) => setFormData({ ...formData, referred_by: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e1b4b] transition-colors"
            />
          </FormField>
        </div>
        
        <div className="flex justify-end pt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 shadow-sm disabled:opacity-50 mr-3"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleNextStep}
            className="px-6 py-2.5 bg-[#1e1b4b] text-white rounded-lg hover:bg-[#1e1b4b]/90 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#1e1b4b] focus:ring-offset-2 shadow-sm flex items-center"
          >
            Next Step
            <ArrowRightIcon className="ml-2 h-4 w-4" />
          </button>
        </div>
      </>
    );
  };
  
  const renderEducationalInfoForm = () => {
    return (
      <>
        <h2 className="text-lg font-semibold text-gray-800 pb-2 border-b border-gray-200 mb-4">
          Educational Information
        </h2>
        
        <div className="space-y-4">
          <FormField label="Interested Country" error={errors.interested_country}>
            <select
              value={formData.interested_country}
              onChange={(e) => setFormData({ ...formData, interested_country: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e1b4b] transition-colors"
            >
              <option value="">Select Country</option>
              <option value="USA">USA</option>
              <option value="UK">UK</option>
              <option value="Canada">Canada</option>
              <option value="Australia">Australia</option>
              <option value="New Zealand">New Zealand</option>
              <option value="Germany">Germany</option>
              <option value="France">France</option>
              <option value="Japan">Japan</option>
              <option value="Singapore">Singapore</option>
              <option value="South Korea">South Korea</option>
            </select>
          </FormField>
          
          <FormField label="Interested Degree" error={errors.interested_degree}>
            <select
              value={formData.interested_degree}
              onChange={(e) => setFormData({ ...formData, interested_degree: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e1b4b] transition-colors"
            >
              <option value="">Select Degree</option>
              <option value="Diploma">Diploma</option>
              <option value="Bachelor">Bachelor</option>
              <option value="Master">Master</option>
              <option value="PhD">PhD</option>
            </select>
          </FormField>
          
          <FormField label="Interested Course" error={errors.interested_course}>
            <input
              type="text"
              value={formData.interested_course}
              onChange={(e) => setFormData({ ...formData, interested_course: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e1b4b] transition-colors"
            />
          </FormField>
          
          <FormField label="Previous Courses Studied" error={errors.courses_studied}>
            <input
              type="text"
              value={formData.courses_studied}
              onChange={(e) => setFormData({ ...formData, courses_studied: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e1b4b] transition-colors"
            />
          </FormField>
          
          <FormField label="GPA" error={errors.gpa}>
            <input
              type="number"
              step="0.01"
              min="0"
              max="4.0"
              value={formData.gpa}
              onChange={(e) => setFormData({ ...formData, gpa: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e1b4b] transition-colors"
            />
          </FormField>
          
          <FormField label="Language Test" error={errors.language_test}>
            <select
              value={formData.language_test}
              onChange={(e) => setFormData({ ...formData, language_test: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e1b4b] transition-colors"
            >
              <option value="None">None</option>
              <option value="IELTS">IELTS</option>
              <option value="TOEFL">TOEFL</option>
              <option value="N1">N1</option>
              <option value="N2">N2</option>
              <option value="N3">N3</option>
            </select>
          </FormField>
          
          <FormField label="Language Score" error={errors.language_score}>
            <input
              type="number"
              step="0.1"
              min="0"
              value={formData.language_score}
              onChange={(e) => setFormData({ ...formData, language_score: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e1b4b] transition-colors"
            />
          </FormField>
          
          <FormField label="Notes" error={errors.notes}>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={4}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e1b4b] transition-colors"
            />
          </FormField>
        </div>
        
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-center mt-4">
            <ExclamationCircleIcon className="h-5 w-5 mr-2" />
            {errors.submit}
          </div>
        )}
        
        <div className="flex justify-between pt-6">
          <button
            type="button"
            onClick={handlePrevStep}
            className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 shadow-sm disabled:opacity-50 flex items-center"
          >
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Previous
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
              'Save Lead'
            )}
          </button>
        </div>
      </>
    );
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-[700px] max-h-[90vh] overflow-y-auto m-4">
        <div className="sticky top-0 bg-white border-b border-[#1e1b4b]/20 p-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">
            {currentStep === 1 ? 'Add New Lead - Personal Info' : 'Add New Lead - Educational Info'}
          </h1>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        
        <div className="p-6">
          {renderStepIndicator()}
          
          <form onSubmit={handleSubmit}>
            {currentStep === 1 ? renderPersonalInfoForm() : renderEducationalInfoForm()}
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddLeadModal; 