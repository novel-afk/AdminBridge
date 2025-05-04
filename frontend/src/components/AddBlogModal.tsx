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

interface AddBlogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddBlogModal = ({ isOpen, onClose, onSuccess }: AddBlogModalProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [branches, setBranches] = useState<Branch[]>([]);
  
  // Form state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [featuredImage, setFeaturedImage] = useState<File | null>(null);
  const [isPublished, setIsPublished] = useState(false);
  const [branchId, setBranchId] = useState<number | null>(user?.branch || null);
  
  // Preview image
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
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
  
  // Handle file change
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setFeaturedImage(file);
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
    setTitle("");
    setContent("");
    setFeaturedImage(null);
    setPreviewImage(null);
    setIsPublished(false);
    setBranchId(user?.branch || null);
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
      formData.append('status', isPublished ? 'published' : 'draft');
      
      if (featuredImage) {
        formData.append('thumbnail_image', featuredImage);
      }
      
      // Make API call
      await blogAPI.create(formData);
      
      // Success handling
      setLoading(false);
      handleReset();
      onSuccess();
    } catch (err: any) {
      console.error('Error creating blog:', err);
      setError(err.response?.data?.detail || 'Failed to create blog. Please try again.');
      setLoading(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={handleCloseModal}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Add New Blog</DialogTitle>
          <DialogDescription className="sr-only">
            Create a new blog post
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
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
                    }}
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
              <Label htmlFor="published" className="text-gray-700">Publish immediately</Label>
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
              {loading ? 'Creating...' : 'Create Blog'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddBlogModal; 