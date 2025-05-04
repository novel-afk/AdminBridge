import { useState, useEffect } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from './ui/select';
import { Switch } from './ui/switch';
import { blogAPI, branchAPI } from '../lib/api';
import { useAuth } from '../lib/AuthContext';

interface Branch {
  id: number;
  name: string;
}

interface Blog {
  id: number;
  title: string;
  content: string;
  thumbnail_image: string | null;
  branch: number;
  branch_name: string;
  author: number;
  author_name: string;
  created_at: string;
  updated_at: string;
  status: 'draft' | 'published';
  slug: string;
  tags: string[];
}

interface EditBlogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  blog: Blog | null;
}

const EditBlogModal = ({ isOpen, onClose, onSuccess, blog }: EditBlogModalProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [branches, setBranches] = useState<Branch[]>([]);
  
  // Form state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [featuredImage, setFeaturedImage] = useState<File | null>(null);
  const [isPublished, setIsPublished] = useState(false);
  const [branchId, setBranchId] = useState<number | null>(null);
  
  // Preview image
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [existingImage, setExistingImage] = useState<string | null>(null);
  const [removeExistingImage, setRemoveExistingImage] = useState(false);
  
  // Fetch branches for SuperAdmin
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await branchAPI.getAll();
        setBranches(response.data);
      } catch (err) {
        console.error('Error fetching branches:', err);
        setError('Failed to fetch branches. Please try again.');
      }
    };
    
    if (user?.role === 'SuperAdmin' && isOpen) {
      fetchBranches();
    }
  }, [user, isOpen]);
  
  // Set form data when blog changes
  useEffect(() => {
    if (blog) {
      setTitle(blog.title);
      setContent(blog.content);
      setIsPublished(blog.status === 'published');
      setBranchId(blog.branch);
      setExistingImage(blog.thumbnail_image);
      setRemoveExistingImage(false);
    }
  }, [blog]);
  
  // Handle file change
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setFeaturedImage(file);
      setRemoveExistingImage(true);
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setFeaturedImage(null);
      setPreviewImage(null);
    }
  };
  
  // Handle form reset
  const handleReset = () => {
    if (blog) {
      setTitle(blog.title);
      setContent(blog.content);
      setIsPublished(blog.status === 'published');
      setBranchId(blog.branch);
      setFeaturedImage(null);
      setPreviewImage(null);
      setExistingImage(blog.thumbnail_image);
      setRemoveExistingImage(false);
    }
    setError("");
  };
  
  // Handle close modal
  const handleCloseModal = () => {
    handleReset();
    onClose();
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!blog) return;
    
    // Validation
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    
    if (!content.trim()) {
      setError('Content is required');
      return;
    }
    
    if (!branchId) {
      setError('Branch is required');
      return;
    }
    
    try {
      setLoading(true);
      setError("");
      
      // Create form data for file upload
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      formData.append('branch', branchId.toString());
      
      // Set publish status field
      if (isPublished) {
        formData.append('is_published', 'true');
      } else {
        formData.append('is_published', 'false');
      }
      
      // Handle image scenarios
      if (featuredImage && featuredImage instanceof File) {
        formData.append('featured_image', featuredImage, featuredImage.name);
        console.log('Uploading file:', featuredImage.name, featuredImage.type, featuredImage.size);
      } else if (removeExistingImage) {
        formData.append('remove_featured_image', 'true');
      }
      
      // Make API call with correct headers
      const response = await blogAPI.update(blog.id, formData);
      console.log('Blog updated successfully:', response);
      
      // Success handling
      setLoading(false);
      onSuccess();
    } catch (err: any) {
      console.error('Error updating blog:', err);
      if (err.response?.data) {
        console.log('Server error details:', err.response.data);
      }
      setError(err.response?.data?.detail || 'Failed to update blog. Please try again.');
      setLoading(false);
    }
  };
  
  // Can't render if no blog is selected
  if (!blog) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={handleCloseModal}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Edit Blog</DialogTitle>
          <DialogDescription className="sr-only">
            Edit blog post details
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4" encType="multipart/form-data">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title <span className="text-red-500">*</span></Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter blog title"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="content">Content <span className="text-red-500">*</span></Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter blog content"
                rows={8}
                required
                className="bg-white text-gray-900 border-gray-300 focus:border-blue-500 focus:ring-blue-500 !bg-white !text-gray-900"
                style={{ backgroundColor: 'white', color: '#1f2937' }}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="featured-image">Featured Image</Label>
              <Input
                id="featured-image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="cursor-pointer"
              />
              
              {/* Show new uploaded image */}
              {previewImage && (
                <div className="mt-2 relative">
                  <img 
                    src={previewImage} 
                    alt="Preview" 
                    className="h-40 object-cover rounded-md" 
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setFeaturedImage(null);
                      setPreviewImage(null);
                      setRemoveExistingImage(false);
                    }}
                    className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              )}
              
              {/* Show existing image if no new image uploaded */}
              {!previewImage && existingImage && !removeExistingImage && (
                <div className="mt-2 relative">
                  <img 
                    src={existingImage} 
                    alt="Current Featured Image" 
                    className="h-40 object-cover rounded-md" 
                  />
                  <button
                    type="button"
                    onClick={() => setRemoveExistingImage(true)}
                    className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
            
            {/* Branch selection for SuperAdmin */}
            {user?.role === 'SuperAdmin' && (
              <div className="space-y-2">
                <Label htmlFor="branch">Branch <span className="text-red-500">*</span></Label>
                <Select 
                  value={branchId?.toString() || ''} 
                  onValueChange={(value) => setBranchId(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a branch" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {branches.map((branch) => (
                        <SelectItem key={branch.id} value={branch.id.toString()}>
                          {branch.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div className="flex items-center space-x-2 pt-2">
              <Switch 
                id="published" 
                checked={isPublished}
                onCheckedChange={setIsPublished}
                className="data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-slate-200"
                style={{ backgroundColor: isPublished ? '#2563eb' : '#e2e8f0' }}
              />
              <Label htmlFor="published" className="text-gray-700">Published</Label>
            </div>
          </div>
          
          <DialogFooter className="mt-6 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleCloseModal}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? 'Updating...' : 'Update Blog'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditBlogModal; 