import { useState, useEffect } from 'react';
import axios from 'axios';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { useAuth } from '../lib/AuthContext';

// Form Field component to handle label, input, and error messages
const FormField = ({ label, children, error }) => {
  return (
    <div className="mb-4">
      <Label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </Label>
      {children}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default function EditJobModal({ isOpen, onClose, onSuccess, job }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    branch: '',
    location: '',
    job_type: 'Full-Time',
    salary_range: '',
    required_experience: '',
    is_active: true,
  });

  const [branches, setBranches] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  // Determine if user has branch selection privileges (only SuperAdmin)
  const canSelectBranch = user?.role === 'SuperAdmin';

  // Function to handle rendering when modal is opened
  useEffect(() => {
    if (isOpen && job) {
      setIsLoading(true);
      fetchBranches();
      
      // Populate form with job data
      setFormData({
        title: job.title,
        description: job.description,
        requirements: job.requirements,
        branch: job.branch,
        job_type: job.job_type,
        salary_range: job.salary_range,
        is_active: job.is_active,
        location: job.location || '',
        required_experience: job.required_experience || '',
      });
      
      setIsLoading(false);
    }
  }, [isOpen, job]);

  // After branches are loaded, ensure formData.branch is set to job.branch if not already set
  useEffect(() => {
    if (branches.length > 0 && isOpen && job) {
      // If formData.branch is not set or not in branches, set it to job.branch
      if (!formData.branch || !branches.some(b => b.id.toString() === formData.branch)) {
        setFormData(prev => ({
          ...prev,
          branch: job.branch?.toString() || branches[0].id.toString()
        }));
      }
    }
  }, [branches, isOpen, job]);

  const checkAdmin = () => {
    const accessToken = localStorage.getItem('access_token');
    if (accessToken) {
      const decodedToken = JSON.parse(atob(accessToken.split('.')[1]));
      setIsAdmin(decodedToken.is_superadmin);
    }
  };

  // Extract additional details from the description
  const extractDetailsFromDescription = (description) => {
    let location = '';
    let requiredExperience = '';

    // Try to extract location
    const locationMatch = description.match(/Location: (.*?)(?:\n|$)/);
    if (locationMatch && locationMatch[1]) {
      location = locationMatch[1].trim();
    }

    // Try to extract required experience
    const requiredExperienceMatch = description.match(/Required Experience: (.*?)(?:\n|$)/);
    if (requiredExperienceMatch && requiredExperienceMatch[1]) {
      requiredExperience = requiredExperienceMatch[1].trim();
    }

    return {
      location,
      requiredExperience
    };
  };

  // Extract the main description without the metadata
  const extractMainDescription = (description) => {
    // Remove the metadata lines
    const mainDescription = description
      .replace(/Department: .*?(?:\n|$)/g, '')
      .replace(/Location: .*?(?:\n|$)/g, '')
      .replace(/Required Experience: .*?(?:\n|$)/g, '')
      .trim();
    
    return mainDescription;
  };

  // Debug: Monitor formData changes
  useEffect(() => {
    if (isOpen && job) {
      console.log("Current formData:", formData);
      console.log("Current branch value:", formData.branch);
      console.log("Current job_type value:", formData.job_type);
      console.log("Available branches:", branches);
      console.log("Is branch in branches?", branches.some(b => b.id.toString() === formData.branch));
    }
  }, [formData, branches, isOpen, job]);

  // Fetch branches for dropdown
  const fetchBranches = async () => {
    console.log("Fetching branches...");
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      setServerError('Authentication required. Please log in again.');
      return Promise.reject('No access token');
    }

    try {
      const response = await axios.get('http://localhost:8000/api/branches/', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      
      let branchesData = [];
      if (Array.isArray(response.data)) {
        branchesData = response.data;
      } else if (response.data.results && Array.isArray(response.data.results)) {
        branchesData = response.data.results;
      } else {
        console.error('Unexpected branches data format:', response.data);
        branchesData = [];
      }
      
      console.log("Branches loaded:", branchesData);
      setBranches(branchesData);
      return Promise.resolve(branchesData);
    } catch (err) {
      console.error('Error fetching branches:', err);
      setServerError('Failed to load branches. Please try again.');
      return Promise.reject(err);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Job title is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Job description is required';
    }
    
    if (!formData.requirements.trim()) {
      newErrors.requirements = 'Job requirements are required';
    }
    
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    if (!formData.job_type.trim()) {
      newErrors.job_type = 'Job type is required';
    }
    
    if (!formData.required_experience.trim()) {
      newErrors.required_experience = 'Required experience is required';
    }

    if (!formData.salary_range.trim()) {
      newErrors.salary_range = 'Salary range is required';
    }
    
    if (!formData.branch) {
      newErrors.branch = 'Branch is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error for this field when user types
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSwitchChange = (checked) => {
    setFormData((prev) => ({
      ...prev,
      is_active: checked,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm() || !job) {
      return;
    }
    
    setIsSubmitting(true);
    setServerError('');
    
    const API_BASE_URL = 'http://localhost:8000/api';
    const accessToken = localStorage.getItem('access_token');
    
    if (!accessToken) {
      setServerError('Authentication required. Please log in again.');
      setIsSubmitting(false);
      return;
    }

    // Create the request payload with all fields supported by the backend
    const payload = {
      title: formData.title,
      description: formData.description,
      requirements: formData.requirements,
      branch: formData.branch,
      job_type: formData.job_type,
      salary_range: formData.salary_range,
      is_active: formData.is_active,
      location: formData.location,
      required_experience: formData.required_experience,
    };
    
    try {
      const response = await axios.put(
        `${API_BASE_URL}/jobs/${job.id}/`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      console.log('Job updated:', response.data);
      
      setIsSubmitting(false);
      
      // Close the modal first
      if (onClose) {
        onClose();
      }
      // Then show success message and call success callback
      if (typeof window !== 'undefined' && window.toast) {
        window.toast.success('Job updated successfully!');
      } else {
        // fallback if toast is not global
        try { require('react-toastify').toast.success('Job updated successfully!'); } catch {}
      }
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error updating job:', error);
      
      setIsSubmitting(false);
      
      if (error.response) {
        // Handle validation errors from the server
        if (error.response.data.detail) {
          setServerError(error.response.data.detail);
        } else if (typeof error.response.data === 'object') {
          // Map server validation errors to our error state
          const serverErrors = {};
          for (const [key, value] of Object.entries(error.response.data)) {
            serverErrors[key] = Array.isArray(value) ? value[0] : value;
          }
          setErrors(serverErrors);
        } else {
          setServerError('An error occurred while updating the job. Please try again.');
        }
      } else {
        setServerError('Network error. Please check your connection and try again.');
      }
    }
  };

  if (!isOpen || !job) return null;
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full relative">
          {/* Gradient Line */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#1e1b4b]/60 via-[#1e1b4b] to-[#1e1b4b]/60"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Loading...</h2>
          <div className="animate-spin h-8 w-8 border-4 border-[#1e1b4b] border-t-transparent rounded-full mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col relative">
        {/* Gradient Line */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#1e1b4b]/60 via-[#1e1b4b] to-[#1e1b4b]/60"></div>
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Edit Job</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Body - Form */}
        <div className="p-6 overflow-y-auto">
          <p className="text-sm text-gray-500 mb-6">Fields marked with * are mandatory</p>

          {serverError && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              <p>{serverError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left column */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    Job Title <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g., Senior Software Engineer"
                    className={`mt-1 ${errors.title ? "border-red-300" : ""}`}
                  />
                  {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
                </div>

                <div>
                  <Label htmlFor="location" className="block text-sm font-medium text-gray-700">
                    Location <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="location"
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g., New York, USA"
                    className={`mt-1 ${errors.location ? "border-red-300" : ""}`}
                  />
                  {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location}</p>}
                </div>
                
                <div>
                  <Label htmlFor="branch" className="block text-sm font-medium text-gray-700">
                    Branch <span className="text-red-500">*</span>
                  </Label>
                  {canSelectBranch ? (
                    // SuperAdmin can select any branch
                    <Select
                      name="branch"
                      value={formData.branch}
                      onValueChange={(value) => handleSelectChange('branch', value)}
                    >
                      <SelectTrigger id="branch" className={`mt-1 ${errors.branch ? "border-red-300" : ""}`}>
                        <SelectValue placeholder="Select branch" />
                      </SelectTrigger>
                      <SelectContent>
                        {branches.map((branch) => (
                          <SelectItem key={branch.id} value={branch.id.toString()}>
                            {branch.name} {branch.city && branch.country ? `- ${branch.city}, ${branch.country}` : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    // Non-SuperAdmin users can only see their branch as disabled input
                    <div>
                      <Input
                        type="text"
                        value={branches.find(b => b.id.toString() === formData.branch)?.name || 'Loading...'}
                        className="mt-1 bg-gray-100"
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
                  {errors.branch && <p className="mt-1 text-sm text-red-600">{errors.branch}</p>}
                </div>

                <div>
                  <Label htmlFor="job_type" className="block text-sm font-medium text-gray-700">
                    Job Type <span className="text-red-500">*</span>
                  </Label>
                  <select
                    id="job_type"
                    name="job_type"
                    value={formData.job_type}
                    onChange={(e) => handleChange(e)}
                    className={`w-full mt-1 px-3 py-2 bg-white border ${errors.job_type ? "border-red-300" : "border-gray-300"} rounded-md shadow-sm focus:outline-none focus:ring-[#1e1b4b] focus:border-[#1e1b4b]`}
                  >
                    <option value="" disabled>Select job type</option>
                    <option value="Full-Time">Full-Time</option>
                    <option value="Part-Time">Part-Time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                    <option value="Remote">Remote</option>
                  </select>
                  {errors.job_type && <p className="mt-1 text-sm text-red-600">{errors.job_type}</p>}
                </div>
              </div>
              
              {/* Right column */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="status" className="block text-sm font-medium text-gray-700">
                    Status <span className="text-red-500">*</span>
                  </Label>
                  <select
                    id="status"
                    name="is_active"
                    value={formData.is_active ? "Open" : "Closed"}
                    onChange={(e) => handleSwitchChange(e.target.value === "Open")}
                    className={`w-full mt-1 px-3 py-2 bg-white border ${errors.is_active ? "border-red-300" : "border-gray-300"} rounded-md shadow-sm focus:outline-none focus:ring-[#1e1b4b] focus:border-[#1e1b4b]`}
                  >
                    <option value="Open">Open</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="required_experience" className="block text-sm font-medium text-gray-700">
                    Required Experience <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="required_experience"
                    type="text"
                    name="required_experience"
                    value={formData.required_experience}
                    onChange={handleChange}
                    placeholder="e.g., 3-5 years"
                    className={`mt-1 ${errors.required_experience ? "border-red-300" : ""}`}
                  />
                  {errors.required_experience && <p className="mt-1 text-sm text-red-600">{errors.required_experience}</p>}
                </div>

                <div>
                  <Label htmlFor="salary_range" className="block text-sm font-medium text-gray-700">
                    Salary Range <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="salary_range"
                    type="text"
                    name="salary_range"
                    value={formData.salary_range}
                    onChange={handleChange}
                    placeholder="e.g., $80,000 - $100,000"
                    className={`mt-1 ${errors.salary_range ? "border-red-300" : ""}`}
                  />
                  {errors.salary_range && <p className="mt-1 text-sm text-red-600">{errors.salary_range}</p>}
                </div>
              </div>
            </div>
            
            {/* Full width columns for description and requirements */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div>
                <Label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Job Description <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe the job responsibilities and expectations"
                  style={{ backgroundColor: 'white', color: 'black' }}
                  className={`mt-1 min-h-[120px] bg-white text-gray-900 !bg-white border-gray-300 ${errors.description ? "border-red-300" : ""}`}
                />
                {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
              </div>

              <div>
                <Label htmlFor="requirements" className="block text-sm font-medium text-gray-700">
                  Job Requirements <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="requirements"
                  name="requirements"
                  value={formData.requirements}
                  onChange={handleChange}
                  placeholder="List the qualifications, skills, and experience required for this job"
                  style={{ backgroundColor: 'white', color: 'black' }}
                  className={`mt-1 min-h-[120px] bg-white text-gray-900 !bg-white border-gray-300 ${errors.requirements ? "border-red-300" : ""}`}
                />
                {errors.requirements && <p className="mt-1 text-sm text-red-600">{errors.requirements}</p>}
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-[#1e1b4b] hover:bg-[#1e1b4b]/90"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="animate-spin mr-2">⟳</span>
                Updating...
              </>
            ) : (
              'Update Job'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
} 