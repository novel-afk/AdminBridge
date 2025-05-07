import React, { useState, useEffect } from 'react';
import { XMarkIcon, ArrowUpTrayIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

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
      <input type="file" accept={accept} onChange={onChange} className="hidden" id={id} />
      <label htmlFor={id} className="px-4 py-2 bg-blue-50 text-blue-900 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors flex items-center space-x-2 border border-blue-200">
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
            <a href={existingFile} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">View</a>
          )}
        </div>
      ) : null}
    </div>
  </FormField>
);

const EditStudentModal = ({ isOpen, onClose, onSuccess, student }) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [branches, setBranches] = useState([]);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    gender: '',
    age: '',
    nationality: '',
    branch: '',
    contactNumber: '',
    profileImage: null,
    existingProfileImage: null,
    institutionName: '',
    languageTest: '',
    address: '',
    emergencyContact: '',
    fatherName: '',
    motherName: '',
    parentNumber: '',
    resume: null,
    existingResume: null,
    dob: '',
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
    if (isOpen) fetchBranches();
  }, [isOpen]);

  useEffect(() => {
    if (student) {
      setFormData({
        firstName: student.user.first_name || '',
        lastName: student.user.last_name || '',
        email: student.user.email || '',
        gender: student.gender || '',
        age: student.age ? String(student.age) : '',
        nationality: student.nationality || '',
        branch: student.branch || '',
        contactNumber: student.contact_number || '',
        profileImage: null,
        existingProfileImage: student.profile_image,
        institutionName: student.institution_name || '',
        languageTest: student.language_test || '',
        address: student.address || '',
        emergencyContact: student.emergency_contact || '',
        fatherName: student.father_name || '',
        motherName: student.mother_name || '',
        parentNumber: student.parent_number || '',
        resume: null,
        existingResume: student.resume,
        dob: student.dob || '',
      });
    }
  }, [student]);

  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.age) newErrors.age = 'Age is required';
    if (!formData.nationality.trim()) newErrors.nationality = 'Nationality is required';
    if (!formData.branch) newErrors.branch = 'Branch is required';
    if (!formData.contactNumber.trim()) newErrors.contactNumber = 'Contact number is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    if (!formData.institutionName.trim()) newErrors.institutionName = 'Institution name is required';
    if (!formData.languageTest) newErrors.languageTest = 'Language test is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (validateStep1()) setStep(2);
  };
  const handleBack = (e) => {
    e.preventDefault();
    setStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep2()) return;
    setIsSubmitting(true);
    setErrors({});
    try {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) throw new Error('Authentication required');
      const submitData = new FormData();
      submitData.append('user.first_name', formData.firstName);
      submitData.append('user.last_name', formData.lastName);
      submitData.append('user.email', formData.email);
      submitData.append('branch', formData.branch);
      submitData.append('gender', formData.gender);
      submitData.append('age', formData.age);
      submitData.append('nationality', formData.nationality);
      submitData.append('contact_number', formData.contactNumber);
      submitData.append('institution_name', formData.institutionName);
      submitData.append('language_test', formData.languageTest);
      submitData.append('address', formData.address);
      submitData.append('emergency_contact', formData.emergencyContact);
      submitData.append('father_name', formData.fatherName);
      submitData.append('mother_name', formData.motherName);
      submitData.append('parent_number', formData.parentNumber);
      if (formData.profileImage) submitData.append('profile_image', formData.profileImage);
      if (formData.resume) submitData.append('resume', formData.resume);
      if (formData.dob) submitData.append('dob', formData.dob);
      await axios.patch(`http://localhost:8000/api/students/${student.id}/`, submitData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      onSuccess && onSuccess();
      onClose && onClose();
    } catch (error) {
      setErrors({ submit: error.response?.data?.detail || 'Failed to update student. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !student) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-[800px] max-h-[90vh] overflow-y-auto m-4">
        <div className="sticky top-0 bg-white border-b border-blue-200 p-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Edit Student</h1>
            <div className="flex items-center space-x-2 mt-2">
              <div className={`h-2 w-16 rounded ${step === 1 ? 'bg-blue-900' : 'bg-blue-200'}`} />
              <div className={`h-2 w-16 rounded ${step === 2 ? 'bg-blue-900' : 'bg-blue-200'}`} />
            </div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        <div className="p-6">
          {step === 1 ? (
            <form onSubmit={handleNext} className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-2 border-b border-blue-200">Personal Information</h2>
              <div className="grid grid-cols-2 gap-6">
                <FormField label="First Name" error={errors.firstName} required>
                  <input type="text" required value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900" />
                </FormField>
                <FormField label="Last Name" error={errors.lastName} required>
                  <input type="text" required value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900" />
                </FormField>
                <FormField label="Email" error={errors.email} required>
                  <input type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900" />
                </FormField>
                <FormField label="Contact Number" error={errors.contactNumber} required>
                  <input type="text" required value={formData.contactNumber} onChange={e => setFormData({ ...formData, contactNumber: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900" />
                </FormField>
                <FormField label="Age" error={errors.age} required>
                  <input type="number" required value={formData.age} onChange={e => setFormData({ ...formData, age: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900" />
                </FormField>
                <FormField label="Gender" error={errors.gender} required>
                  <select required value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900">
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </FormField>
                <FormField label="Nationality" error={errors.nationality} required>
                  <input type="text" required value={formData.nationality} onChange={e => setFormData({ ...formData, nationality: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900" />
                </FormField>
                <FormField label="Branch" error={errors.branch} required>
                  <select required value={formData.branch} onChange={e => setFormData({ ...formData, branch: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900">
                    <option value="">Select Branch</option>
                    {branches.map(branch => (
                      <option key={branch.id} value={branch.id}>{branch.name}</option>
                    ))}
                  </select>
                </FormField>
                <FileUpload id="profileImage" label="Profile Image" accept="image/*" value={formData.profileImage} onChange={e => setFormData({ ...formData, profileImage: e.target.files[0] })} error={errors.profileImage} existingFile={formData.existingProfileImage} />
              </div>
              <div className="flex justify-end mt-8">
                <button type="submit" className="px-6 py-2.5 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-900 focus:ring-offset-2 shadow-sm">Next</button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-2 border-b border-blue-200">Education & Family Information</h2>
              <div className="grid grid-cols-2 gap-6">
                <FormField label="Institution Name" error={errors.institutionName} required>
                  <input type="text" required value={formData.institutionName} onChange={e => setFormData({ ...formData, institutionName: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900" />
                </FormField>
                <FormField label="Language Test" error={errors.languageTest} required>
                  <select required value={formData.languageTest} onChange={e => setFormData({ ...formData, languageTest: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900">
                    <option value="">Select Test</option>
                    <option value="None">None</option>
                    <option value="IELTS">IELTS</option>
                    <option value="TOEFL">TOEFL</option>
                    <option value="PTE">PTE</option>
                    <option value="Other">Other</option>
                  </select>
                </FormField>
                <FormField label="Father's Name" error={errors.fatherName}>
                  <input type="text" value={formData.fatherName} onChange={e => setFormData({ ...formData, fatherName: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900" />
                </FormField>
                <FormField label="Mother's Name" error={errors.motherName}>
                  <input type="text" value={formData.motherName} onChange={e => setFormData({ ...formData, motherName: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900" />
                </FormField>
                <FormField label="Parent Number" error={errors.parentNumber}>
                  <input type="text" value={formData.parentNumber} onChange={e => setFormData({ ...formData, parentNumber: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900" />
                </FormField>
                <FormField label="Emergency Contact" error={errors.emergencyContact}>
                  <input type="text" value={formData.emergencyContact} onChange={e => setFormData({ ...formData, emergencyContact: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900" />
                </FormField>
                <FileUpload id="resume" label="Resume (PDF)" accept="application/pdf" value={formData.resume} onChange={e => setFormData({ ...formData, resume: e.target.files[0] })} error={errors.resume} existingFile={formData.existingResume} />
                <FormField label="Date of Birth" error={errors.dob}>
                  <input type="date" value={formData.dob} onChange={e => setFormData({ ...formData, dob: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900" />
                </FormField>
                <FormField label="Address" error={errors.address} required>
                  <textarea required value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} rows={3} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900" />
                </FormField>
              </div>
              <div className="flex justify-between mt-8">
                <button type="button" onClick={handleBack} className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 shadow-sm">Back</button>
                <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-900 focus:ring-offset-2 shadow-sm disabled:opacity-50">{isSubmitting ? 'Updating...' : 'Update Student'}</button>
              </div>
              {errors.submit && (
                <p className="mt-2 text-sm text-red-500 flex items-center">
                  <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                  {errors.submit}
                </p>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditStudentModal; 