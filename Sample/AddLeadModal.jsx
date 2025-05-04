import { useState } from 'react';
import { XMarkIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

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

const AddLeadModal = ({ isOpen, onClose, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    nationality: '',
    interestedCountry: '',
    degree: '',
    languageTest: '',
    languageScore: '',
    referredBy: '',
    courseStudies: '',
    interestedCourse: '',
    gpa: '',
  });

  const countries = ["USA", "UK", "Canada", "Australia", "New Zealand", "India", "Other"];
  const degrees = ["Bachelor's", "Master's", "PhD", "Diploma"];
  const languageTests = ["IELTS", "TOEFL", "PTE", "None"];
  const referralSources = ["Website", "Agent", "Friend", "Social Media", "Other"];
  const courses = ["Computer Science", "Business", "Engineering", "Medicine", "Arts", "Other"];

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    if (!formData.nationality.trim()) newErrors.nationality = 'Nationality is required';
    if (!formData.interestedCountry) newErrors.interestedCountry = 'Interested country is required';
    if (!formData.degree) newErrors.degree = 'Degree is required';
    if (!formData.courseStudies) newErrors.courseStudies = 'Current course is required';
    if (!formData.interestedCourse) newErrors.interestedCourse = 'Interested course is required';

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

    // GPA validation
    if (formData.gpa && (parseFloat(formData.gpa) < 0 || parseFloat(formData.gpa) > 4)) {
      newErrors.gpa = 'GPA must be between 0 and 4';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSubmitting(true);
      try {
        // Here you would typically make an API call to save the lead data
        console.log('Saving lead:', formData);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
        if (onSuccess) {
          onSuccess();
        } else {
          onClose();
        }
      } catch (error) {
        console.error('Error saving lead:', error);
        setErrors({ submit: 'Failed to save lead. Please try again.' });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-[800px] max-h-[90vh] overflow-y-auto m-4">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Add New Lead</h1>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <FormField label="Name" error={errors.name} required>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full px-4 py-2.5 border ${errors.name ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-primary-500'} rounded-lg focus:outline-none focus:ring-2 transition-colors`}
              />
            </FormField>

            <FormField label="Email" error={errors.email} required>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`w-full px-4 py-2.5 border ${errors.email ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-primary-500'} rounded-lg focus:outline-none focus:ring-2 transition-colors`}
              />
            </FormField>

            <FormField label="Phone" error={errors.phone} required>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className={`w-full px-4 py-2.5 border ${errors.phone ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-primary-500'} rounded-lg focus:outline-none focus:ring-2 transition-colors`}
              />
            </FormField>

            <FormField label="Nationality" error={errors.nationality} required>
              <input
                type="text"
                required
                value={formData.nationality}
                onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                className={`w-full px-4 py-2.5 border ${errors.nationality ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-primary-500'} rounded-lg focus:outline-none focus:ring-2 transition-colors`}
              />
            </FormField>

            <FormField label="Interested Country" error={errors.interestedCountry} required>
              <select
                required
                value={formData.interestedCountry}
                onChange={(e) => setFormData({ ...formData, interestedCountry: e.target.value })}
                className={`w-full px-4 py-2.5 border ${errors.interestedCountry ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-primary-500'} rounded-lg focus:outline-none focus:ring-2 transition-colors`}
              >
                <option value="">Select Country</option>
                {countries.map((country) => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </FormField>

            <FormField label="Degree" error={errors.degree} required>
              <select
                required
                value={formData.degree}
                onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                className={`w-full px-4 py-2.5 border ${errors.degree ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-primary-500'} rounded-lg focus:outline-none focus:ring-2 transition-colors`}
              >
                <option value="">Select Degree</option>
                {degrees.map((degree) => (
                  <option key={degree} value={degree}>{degree}</option>
                ))}
              </select>
            </FormField>

            <FormField label="Language Test" error={errors.languageTest}>
              <select
                value={formData.languageTest}
                onChange={(e) => setFormData({ ...formData, languageTest: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
              >
                <option value="">Select Test</option>
                {languageTests.map((test) => (
                  <option key={test} value={test}>{test}</option>
                ))}
              </select>
            </FormField>

            <FormField label="Language Score" error={errors.languageScore}>
              <input
                type="text"
                value={formData.languageScore}
                onChange={(e) => setFormData({ ...formData, languageScore: e.target.value })}
                placeholder="e.g., 7.5 or 85%"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
              />
            </FormField>

            <FormField label="Referred By" error={errors.referredBy}>
              <select
                value={formData.referredBy}
                onChange={(e) => setFormData({ ...formData, referredBy: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
              >
                <option value="">Select Source</option>
                {referralSources.map((source) => (
                  <option key={source} value={source}>{source}</option>
                ))}
              </select>
            </FormField>

            <FormField label="Current Course" error={errors.courseStudies} required>
              <select
                required
                value={formData.courseStudies}
                onChange={(e) => setFormData({ ...formData, courseStudies: e.target.value })}
                className={`w-full px-4 py-2.5 border ${errors.courseStudies ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-primary-500'} rounded-lg focus:outline-none focus:ring-2 transition-colors`}
              >
                <option value="">Select Course</option>
                {courses.map((course) => (
                  <option key={course} value={course}>{course}</option>
                ))}
              </select>
            </FormField>

            <FormField label="Interested Course" error={errors.interestedCourse} required>
              <select
                required
                value={formData.interestedCourse}
                onChange={(e) => setFormData({ ...formData, interestedCourse: e.target.value })}
                className={`w-full px-4 py-2.5 border ${errors.interestedCourse ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-primary-500'} rounded-lg focus:outline-none focus:ring-2 transition-colors`}
              >
                <option value="">Select Course</option>
                {courses.map((course) => (
                  <option key={course} value={course}>{course}</option>
                ))}
              </select>
            </FormField>

            <FormField label="GPA" error={errors.gpa}>
              <input
                type="number"
                step="0.01"
                min="0"
                max="4"
                value={formData.gpa}
                onChange={(e) => setFormData({ ...formData, gpa: e.target.value })}
                placeholder="0.00 - 4.00"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
              />
            </FormField>
          </div>

          <div className="flex justify-end mt-8">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-6 py-2.5 mr-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 shadow-sm disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 shadow-sm disabled:opacity-50 flex items-center"
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
                'Save'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddLeadModal; 