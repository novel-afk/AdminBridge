import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../lib/AuthContext';
import { API_BASE_URL } from '../../lib/apiConfig';

interface Branch {
  id: number;
  name: string;
  country: string;
  city: string;
}

interface AddLeadModalProps {
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

const AddLeadModal: React.FC<AddLeadModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    nationality: '',
    branch: '',
    interested_country: '',
    interested_degree: '',
    language_test: 'None',
    language_score: '',
    referred_by: '',
    courses_studied: '',
    interested_course: '',
    gpa: '',
    lead_source: 'Website',
    notes: '',
  });

  // Country options for the dropdown
  const countryOptions = [
    { value: '', label: 'Select Country' },
    { value: 'USA', label: 'USA' },
    { value: 'UK', label: 'UK' },
    { value: 'Canada', label: 'Canada' },
    { value: 'Australia', label: 'Australia' },
    { value: 'New Zealand', label: 'New Zealand' },
    { value: 'Germany', label: 'Germany' },
    { value: 'France', label: 'France' },
    { value: 'Japan', label: 'Japan' },
    { value: 'Singapore', label: 'Singapore' },
    { value: 'South Korea', label: 'South Korea' },
  ];

  // Degree options for the dropdown
  const degreeOptions = [
    { value: '', label: 'Select Degree' },
    { value: 'Diploma', label: 'Diploma' },
    { value: 'Bachelor', label: 'Bachelor' },
    { value: 'Master', label: 'Master' },
    { value: 'PhD', label: 'PhD' },
  ];

  // Language test options for the dropdown
  const languageTestOptions = [
    { value: 'None', label: 'None' },
    { value: 'IELTS', label: 'IELTS' },
    { value: 'TOEFL', label: 'TOEFL' },
    { value: 'PTE', label: 'PTE' },
    { value: 'Duolingo', label: 'Duolingo' },
    { value: 'N1', label: 'N1' },
    { value: 'N2', label: 'N2' },
    { value: 'N3', label: 'N3' },
  ];

  // Lead source options for the dropdown
  const leadSourceOptions = [
    { value: 'Website', label: 'Website' },
    { value: 'Social Media', label: 'Social Media' },
    { value: 'Referral', label: 'Referral' },
    { value: 'Walk-in', label: 'Walk-in' },
    { value: 'Phone Inquiry', label: 'Phone Inquiry' },
    { value: 'Email', label: 'Email' },
    { value: 'Event', label: 'Event' },
    { value: 'Other', label: 'Other' },
  ];

  // Reset everything when modal is opened/closed
  useEffect(() => {
    if (isOpen) {
      setFormData(prev => ({
        ...prev,
        branch: user?.branch ? user.branch.toString() : ''
      }));
      console.log('Counsellor branch (modal open):', user?.branch);
      setErrors({});
      
      // Fetch branches
      fetchBranches();
    }
  }, [isOpen, user]);

  // Fetch branches from the API
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

  // Handle input field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Validate all form fields
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.phone) newErrors.phone = 'Phone number is required';
    if (!formData.nationality) newErrors.nationality = 'Nationality is required';
    if (!formData.branch) newErrors.branch = 'Branch is required';
    // Validate language score if a test is selected
    if (formData.language_test !== 'None' && !formData.language_score) {
      newErrors.language_score = 'Language score is required when a test is selected';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const accessToken = localStorage.getItem("access_token");
      if (!accessToken) {
        toast.error("You are not authenticated");
        setIsSubmitting(false);
        return;
      }
      
      // Prepare data for API
      const leadData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        nationality: formData.nationality,
        branch: parseInt(formData.branch),
        lead_source: formData.lead_source,
        notes: formData.notes || null,
        // Optional fields
        interested_country: formData.interested_country || null,
        interested_degree: formData.interested_degree || null,
        language_test: formData.language_test,
        language_score: formData.language_score ? parseFloat(formData.language_score) : null,
        referred_by: formData.referred_by || null,
        courses_studied: formData.courses_studied || null,
        interested_course: formData.interested_course || null,
        gpa: formData.gpa ? parseFloat(formData.gpa) : null,
      };
      
      console.log("Submitting lead data:", leadData);
      
      // Send to the API
      await axios.post(`${API_BASE_URL}/leads/`, leadData, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      
      toast.success('Lead added successfully');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error adding lead:', error);
      
      // Process API error response
      if (error.response?.data) {
        console.log("API error response:", error.response.data);
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
        toast.error('Failed to add lead. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Find the branch name based on branch ID
  const selectedBranchName = formData.branch
    ? branches.find(b => b.id.toString() === formData.branch)?.name || ''
    : '';

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
              Add New Lead
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
            <form onSubmit={handleSubmit} className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-2 border-b border-[#1e1b4b]/20">
                Lead Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information Section */}
                <FormField label="Full Name" error={errors.name} required>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-2.5 border ${errors.name ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-[#1e1b4b]'} rounded-lg focus:outline-none focus:ring-2 transition-colors`}
                  />
                </FormField>

                <FormField label="Email" error={errors.email} required>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-2.5 border ${errors.email ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-[#1e1b4b]'} rounded-lg focus:outline-none focus:ring-2 transition-colors`}
                  />
                </FormField>

                <FormField label="Phone Number" error={errors.phone} required>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-2.5 border ${errors.phone ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-[#1e1b4b]'} rounded-lg focus:outline-none focus:ring-2 transition-colors`}
                  />
                </FormField>

                <FormField label="Nationality" error={errors.nationality} required>
                  <input
                    type="text"
                    name="nationality"
                    value={formData.nationality}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-2.5 border ${errors.nationality ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-[#1e1b4b]'} rounded-lg focus:outline-none focus:ring-2 transition-colors`}
                  />
                </FormField>

                <FormField label="Branch" error={errors.branch} required>
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
                    {!user?.branch && (
                      <p className="mt-1 text-xs text-red-500">No branch assigned to your account. Please contact admin.</p>
                    )}
                  </div>
                </FormField>

                <FormField label="Lead Source" error={errors.lead_source} required>
                  <select
                    name="lead_source"
                    value={formData.lead_source}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-2.5 border ${errors.lead_source ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-[#1e1b4b]'} rounded-lg focus:outline-none focus:ring-2 transition-colors`}
                  >
                    {leadSourceOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </FormField>

                <FormField label="Referred By" error={errors.referred_by}>
                  <input
                    type="text"
                    name="referred_by"
                    value={formData.referred_by}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e1b4b] transition-colors"
                  />
                </FormField>
              </div>

              <h3 className="text-lg font-medium text-gray-800 mt-8 mb-4">Education & Preferences</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Educational Information Section */}
                <FormField label="Interested Country" error={errors.interested_country}>
                  <select
                    name="interested_country"
                    value={formData.interested_country}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e1b4b] transition-colors"
                  >
                    {countryOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </FormField>

                <FormField label="Interested Degree" error={errors.interested_degree}>
                  <select
                    name="interested_degree"
                    value={formData.interested_degree}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e1b4b] transition-colors"
                  >
                    {degreeOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </FormField>

                <FormField label="Language Test" error={errors.language_test}>
                  <select
                    name="language_test"
                    value={formData.language_test}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e1b4b] transition-colors"
                  >
                    {languageTestOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </FormField>

                {formData.language_test !== 'None' && (
                  <FormField label="Language Score" error={errors.language_score}>
                    <input
                      type="text"
                      name="language_score"
                      value={formData.language_score}
                      onChange={handleChange}
                      className={`w-full px-4 py-2.5 border ${errors.language_score ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-[#1e1b4b]'} rounded-lg focus:outline-none focus:ring-2 transition-colors`}
                    />
                  </FormField>
                )}

                <FormField label="Courses Studied" error={errors.courses_studied}>
                  <input
                    type="text"
                    name="courses_studied"
                    value={formData.courses_studied}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e1b4b] transition-colors"
                  />
                </FormField>

                <FormField label="Interested Course" error={errors.interested_course}>
                  <input
                    type="text"
                    name="interested_course"
                    value={formData.interested_course}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e1b4b] transition-colors"
                  />
                </FormField>

                <FormField label="GPA" error={errors.gpa}>
                  <input
                    type="text"
                    name="gpa"
                    value={formData.gpa}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e1b4b] transition-colors"
                  />
                </FormField>
              </div>

              <FormField label="Notes" error={errors.notes}>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e1b4b] transition-colors"
                />
              </FormField>

              <div className="flex justify-end mt-8">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors duration-200 mr-4 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 shadow-sm disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !user?.branch}
                  className="px-6 py-2.5 bg-[#1e1b4b] text-white rounded-lg hover:bg-[#1e1b4b]/90 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#1e1b4b] focus:ring-offset-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Adding Lead...' : 'Add Lead'}
                </button>
              </div>
            </form>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default AddLeadModal; 