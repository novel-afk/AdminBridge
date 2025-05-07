import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

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

interface ViewBlogModalProps {
  isOpen: boolean;
  onClose: () => void;
  blog: Blog | null;
}

const ViewBlogModal = ({ isOpen, onClose, blog }: ViewBlogModalProps) => {
  // Can't render if no blog is selected
  if (!blog) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{blog.title}</DialogTitle>
          <DialogDescription className="sr-only">
            View blog details
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4 space-y-6">
          {/* Featured image */}
          {blog.thumbnail_image && (
            <div className="w-full">
              <img 
                src={blog.thumbnail_image} 
                alt={blog.title} 
                className="w-full h-56 object-cover rounded-lg" 
              />
            </div>
          )}
          
          {/* Blog details */}
          <div className="flex flex-wrap justify-between gap-4 text-sm">
            <div className="space-y-1">
              <p className="text-gray-500">Branch</p>
              <p className="font-medium">{blog.branch_name}</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-gray-500">Author</p>
              <p className="font-medium">{blog.author_name}</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-gray-500">Status</p>
              <Badge 
                className={`${
                  blog.status === 'published' 
                    ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                    : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                }`}
              >
                {blog.status ? blog.status.charAt(0).toUpperCase() + blog.status.slice(1) : 'Unknown'}
              </Badge>
            </div>
            
            <div className="space-y-1">
              <p className="text-gray-500">Created</p>
              <p className="font-medium">{new Date(blog.created_at).toLocaleString()}</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-gray-500">Updated</p>
              <p className="font-medium">{new Date(blog.updated_at).toLocaleString()}</p>
            </div>
          </div>
          
          {/* Blog content */}
          <div className="mt-4">
            <h3 className="font-semibold text-gray-700 mb-2">Content</h3>
            <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap">
              {blog.content}
            </div>
          </div>
          
          {/* Tags */}
          {blog.tags && blog.tags.length > 0 && (
            <div className="mt-4">
              <h3 className="font-semibold text-gray-700 mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {blog.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="bg-blue-50">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter className="mt-6">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ViewBlogModal; 