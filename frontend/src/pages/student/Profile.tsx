import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { User, Mail, Phone, Calendar, Book, MapPin, School, Users } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { StudentLayout } from '../../components/Layout';
import { studentProfileAPI } from '../../lib/api';
import { useAuth } from '../../lib/AuthContext';
import { toast } from 'react-toastify';

interface StudentProfile {
  id: number;
  user: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    role: string;
    branch: number | null;
    branch_name: string | null;
  };
  branch: {
    id: number;
    name: string;
    country: string;
    city: string;
    address: string;
    created_at: string;
    updated_at: string;
  };
  student_id: string;
  age: number;
  gender: string;
  nationality: string;
  contact_number: string;
  address: string;
  institution_name: string;
  language_test: string;
  emergency_contact: string;
  mother_name: string;
  father_name: string;
  parent_number: string;
  profile_image: string;
  enrollment_date: string;
}

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [editing, setEditing] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    contact_number: '',
    address: '',
    nationality: '',
    emergency_contact: '',
    mother_name: '',
    father_name: '',
    parent_number: '',
    institution_name: '',
    language_test: '',
  });

  // Profile image state
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await studentProfileAPI.getProfile();
        
        console.log('Profile data:', response.data);
        setProfile(response.data);
        
        // Initialize form data
        setFormData({
          contact_number: response.data.contact_number || '',
          address: response.data.address || '',
          nationality: response.data.nationality || '',
          emergency_contact: response.data.emergency_contact || '',
          mother_name: response.data.mother_name || '',
          father_name: response.data.father_name || '',
          parent_number: response.data.parent_number || '',
          institution_name: response.data.institution_name || '',
          language_test: response.data.language_test || 'None',
        });
        
        if (response.data.profile_image) {
          setPreviewUrl(response.data.profile_image);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError('Unable to load your profile. Please try again later.');
        toast.error('Unable to load your profile. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setProfileImage(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      
      const formPayload = new FormData();
      
      // Append text fields
      Object.entries(formData).forEach(([key, value]) => {
        formPayload.append(key, value);
      });
      
      // Append profile image if changed
      if (profileImage) {
        formPayload.append('profile_image', profileImage);
      }
      
      await studentProfileAPI.updateProfile(formPayload);
      
      setSuccess('Profile updated successfully!');
      toast.success('Profile updated successfully!');
      setEditing(false);
      
      // Refresh profile data
      const response = await studentProfileAPI.getProfile();
      setProfile(response.data);
      
      // Clear success message after a delay
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
      
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('An error occurred while updating your profile. Please try again.');
      toast.error('An error occurred while updating your profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Handle invalid or missing dates
  const formatSafeDate = (dateString: string | undefined | null) => {
    if (!dateString) return 'Not specified';
    
    try {
      return formatDate(dateString);
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  if (loading) {
    return (
      <StudentLayout>
        <div className="container mx-auto px-6 py-12 text-center">
          <div className="flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#153147] mb-4"></div>
            <p className="text-gray-600">Loading your profile...</p>
          </div>
        </div>
      </StudentLayout>
    );
  }

  if (!profile) {
    return (
      <StudentLayout>
        <div className="container mx-auto px-6 py-12 text-center">
          <p className="text-red-600 mb-4">Unable to load your profile. Please try again later.</p>
          <Button onClick={() => navigate('/student')}>Return to Dashboard</Button>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="container mx-auto px-6 py-12">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-[#153147]">My Profile</h1>
          <Button
            onClick={() => setEditing(!editing)}
            className="bg-[#153147] hover:bg-[#153147]/90"
          >
            {editing ? 'Cancel' : 'Edit Profile'}
          </Button>
        </div>
        
        {error && (
          <div className="bg-red-50 text-red-800 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 text-green-800 p-4 rounded-lg mb-6">
            {success}
          </div>
        )}
        
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {/* Profile Header */}
          <div className="p-8 bg-white text-[#153147]">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="relative">
                {editing ? (
                  <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                    {previewUrl ? (
                      <img 
                        src={previewUrl} 
                        alt="Profile preview" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User size={48} className="text-gray-400" />
                    )}
                    <input 
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <p className="text-white text-sm font-medium">Change Photo</p>
                    </div>
                  </div>
                ) : (
                  <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                    {profile?.profile_image ? (
                      <img 
                        src={profile.profile_image} 
                        alt={`${profile.user?.first_name || 'User'} ${profile.user?.last_name || ''}`} 
                        className="w-full h-full object-cover"
                      />
                    ) : user?.first_name ? (
                      <div className="w-full h-full bg-[#285172] flex items-center justify-center text-3xl font-bold text-white">
                        {user.first_name.charAt(0) || ''}
                        {user.last_name?.charAt(0) || ''}
                      </div>
                    ) : (
                      <div className="w-full h-full bg-[#285172] flex items-center justify-center text-3xl font-bold text-white">
                        {profile?.user?.first_name?.charAt(0) || ''}
                        {profile?.user?.last_name?.charAt(0) || ''}
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="text-center md:text-left">
                <h2 className="text-2xl font-bold">
                  {profile?.user?.first_name ? `${profile.user.first_name} ${profile.user.last_name || ''}` : 'User'}
                </h2>
                <p className="text-gray-600 mb-2">Student ID: {profile?.student_id || 'Not assigned'}</p>
                <p className="text-gray-600 flex items-center justify-center md:justify-start gap-2">
                  <MapPin size={16} />
                  {profile?.branch?.name || 'Unknown Branch'}
                </p>
                <p className="text-gray-600 flex items-center justify-center md:justify-start gap-2">
                  <Mail size={16} />
                  {profile?.user?.email || 'No email available'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Personal Information */}
              <div>
                <h3 className="text-xl font-semibold text-[#153147] mb-6">Personal Information</h3>
                
                <div className="space-y-6">
                  <div>
                    <Label className="text-gray-500 mb-1 block">Full Name</Label>
                    <div className="flex items-center gap-2 text-gray-800">
                      <User size={16} className="text-gray-400" />
                      {profile?.user?.first_name ? `${profile.user.first_name} ${profile.user.last_name || ''}` : 'User'}
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-gray-500 mb-1 block">Email</Label>
                    <div className="flex items-center gap-2 text-gray-800">
                      <Mail size={16} className="text-gray-400" />
                      {profile?.user?.email || 'No email available'}
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-gray-500 mb-1 block">Age</Label>
                    <div className="flex items-center gap-2 text-gray-800">
                      <Users size={16} className="text-gray-400" />
                      {profile?.age ? `${profile.age} years old` : 'Not specified'}
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-gray-500 mb-1 block">Gender</Label>
                    <div className="flex items-center gap-2 text-gray-800">
                      <Users size={16} className="text-gray-400" />
                      {profile?.gender || 'Not specified'}
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-gray-500 mb-1 block">Nationality</Label>
                    {editing ? (
                      <Input 
                        name="nationality"
                        value={formData.nationality}
                        onChange={handleChange}
                        className="w-full"
                      />
                    ) : (
                      <div className="flex items-center gap-2 text-gray-800">
                        <MapPin size={16} className="text-gray-400" />
                        {profile?.nationality || 'Not specified'}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <Label className="text-gray-500 mb-1 block">Enrollment Date</Label>
                    <div className="flex items-center gap-2 text-gray-800">
                      <Calendar size={16} className="text-gray-400" />
                      {formatSafeDate(profile?.enrollment_date)}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Contact Information */}
              <div>
                <h3 className="text-xl font-semibold text-[#153147] mb-6">Contact Information</h3>
                
                <div className="space-y-6">
                  <div>
                    <Label className="text-gray-500 mb-1 block">Phone Number</Label>
                    {editing ? (
                      <Input 
                        name="contact_number"
                        value={formData.contact_number}
                        onChange={handleChange}
                        className="w-full"
                      />
                    ) : (
                      <div className="flex items-center gap-2 text-gray-800">
                        <Phone size={16} className="text-gray-400" />
                        {profile?.contact_number || 'Not specified'}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <Label className="text-gray-500 mb-1 block">Emergency Contact</Label>
                    {editing ? (
                      <Input 
                        name="emergency_contact"
                        value={formData.emergency_contact}
                        onChange={handleChange}
                        className="w-full"
                      />
                    ) : (
                      <div className="flex items-center gap-2 text-gray-800">
                        <Phone size={16} className="text-gray-400" />
                        {profile?.emergency_contact || 'Not specified'}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <Label className="text-gray-500 mb-1 block">Address</Label>
                    {editing ? (
                      <Textarea 
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        className="w-full"
                        rows={3}
                      />
                    ) : (
                      <div className="flex items-start gap-2 text-gray-800">
                        <MapPin size={16} className="text-gray-400 mt-1" />
                        <p>{profile?.address || 'Not specified'}</p>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <Label className="text-gray-500 mb-1 block">Parents Information</Label>
                    {editing ? (
                      <div className="space-y-4">
                        <Input 
                          name="father_name"
                          value={formData.father_name}
                          onChange={handleChange}
                          className="w-full"
                          placeholder="Father's Name"
                        />
                        <Input 
                          name="mother_name"
                          value={formData.mother_name}
                          onChange={handleChange}
                          className="w-full"
                          placeholder="Mother's Name"
                        />
                        <Input 
                          name="parent_number"
                          value={formData.parent_number}
                          onChange={handleChange}
                          className="w-full"
                          placeholder="Parent's Contact Number"
                        />
                      </div>
                    ) : (
                      <div className="space-y-2 text-gray-800">
                        <p>Father: {profile?.father_name || 'Not specified'}</p>
                        <p>Mother: {profile?.mother_name || 'Not specified'}</p>
                        <p>Contact: {profile?.parent_number || 'Not specified'}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Educational Information */}
              <div className="md:col-span-2">
                <h3 className="text-xl font-semibold text-[#153147] mb-6">Educational Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-gray-500 mb-1 block">Institution Name</Label>
                    {editing ? (
                      <Input 
                        name="institution_name"
                        value={formData.institution_name}
                        onChange={handleChange}
                        className="w-full"
                      />
                    ) : (
                      <div className="flex items-center gap-2 text-gray-800">
                        <School size={16} className="text-gray-400" />
                        {profile?.institution_name || 'Not specified'}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <Label className="text-gray-500 mb-1 block">Language Test</Label>
                    {editing ? (
                      <select 
                        name="language_test"
                        value={formData.language_test}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-md py-2 px-3"
                      >
                        <option value="None">None</option>
                        <option value="IELTS">IELTS</option>
                        <option value="PTE">PTE</option>
                        <option value="TOEFL">TOEFL</option>
                      </select>
                    ) : (
                      <div className="flex items-center gap-2 text-gray-800">
                        <Book size={16} className="text-gray-400" />
                        {profile?.language_test || 'None'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {editing && (
              <div className="mt-8 flex justify-end gap-4">
                <Button
                  onClick={() => setEditing(false)}
                  variant="outline"
                  className="border-gray-300"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-[#153147] hover:bg-[#153147]/90"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </StudentLayout>
  );
};

export default Profile; 