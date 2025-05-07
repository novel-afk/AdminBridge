import React, { useRef, useEffect } from 'react';
import { X, Calendar, Clock, Tag, Share2, User, ArrowLeft } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

interface Blog {
  id: number;
  title: string;
  content: string;
  author: {
    first_name: string;
    last_name: string;
  };
  featured_image: string | null;
  published_date: string;
  created_at: string;
  branch?: {
    name: string;
  };
}

interface BlogModalProps {
  blog: Blog | null;
  isOpen: boolean;
  onClose: () => void;
}

const BlogModal: React.FC<BlogModalProps> = ({ blog, isOpen, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close modal
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    
    function handleEscKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscKey);
      // Disable body scrolling when modal is open
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscKey);
      // Re-enable body scrolling when modal is closed
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Generate random tags for demonstration purposes
  const getRandomTags = (blogId: number) => {
    const allTags = [
      'React', 'JavaScript', 'TypeScript', 'Frontend', 'Backend', 
      'Web', 'Development', 'Design', 'UI', 'UX', 'AI', 'Machine Learning',
      'DevOps', 'Cloud', 'Database', 'Mobile', 'Technology'
    ];
    
    // Use blogId as seed for pseudo-randomness
    const seed = blogId;
    const numTags = Math.min(3, (seed % 3) + 1);
    const selectedTags = [];
    
    for (let i = 0; i < numTags; i++) {
      const tagIndex = (seed * (i + 1)) % allTags.length;
      selectedTags.push(allTags[tagIndex]);
    }
    
    return selectedTags;
  };

  // Estimate reading time based on content length
  const calculateReadingTime = (content: string): number => {
    if (!content) return 1;
    const wordsPerMinute = 200;
    const words = content.split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return Math.max(1, minutes); // Minimum 1 minute reading time
  };
  
  // Get placeholder image if featured image is missing
  const getImageUrl = (blog: Blog | null) => {
    if (!blog) return '';
    if (blog.featured_image) return blog.featured_image;
    
    // Use a deterministic placeholder based on blog ID
    const imageId = (blog.id % 10) + 1; // 1-10 range
    return `https://source.unsplash.com/collection/1346951/800x450?sig=${imageId}`;
  };

  if (!isOpen || !blog) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 bg-black/50 overflow-auto animate-fadeIn">
      <div className="relative w-full max-w-6xl mx-auto my-8 bg-white shadow-2xl animate-fadeInScale">
        {/* Hero section with image */}
        <div className="w-full h-80 md:h-96 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-transparent z-10"></div>
          <img 
            src={getImageUrl(blog)} 
            alt={blog.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-0 left-0 right-0 p-6 z-20 flex justify-between items-center">
            <Button 
              variant="outline"
              className="bg-white/20 backdrop-blur-sm border-white/40 text-white hover:bg-white/30"
              onClick={onClose}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Blogs
            </Button>
            <Button 
              variant="outline"
              size="icon"
              className="rounded-full bg-white/20 backdrop-blur-sm border-white/40 text-white hover:bg-white/30"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
        </div>
        
        <div className="max-w-4xl mx-auto px-6 py-12 -mt-20 relative z-20" ref={modalRef}>
          <div className="bg-white rounded-xl shadow-md p-8 md:p-12">
            <div className="flex flex-wrap gap-2 mb-4">
              {getRandomTags(blog?.id || 0).map((tag, index) => (
                <Badge 
                  key={index} 
                  variant="outline" 
                  className="bg-white text-[#153147] border-[#153147]"
                >
                  {tag}
                </Badge>
              ))}
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-[#153147] mb-6">{blog.title}</h1>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-6 mb-8 pb-8 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#153147] flex items-center justify-center text-white font-semibold">
                  {blog?.author?.first_name?.[0] || ''}
                  {blog?.author?.last_name?.[0] || ''}
                </div>
                <div>
                  <p className="font-medium">
                    {blog?.author?.first_name || 'Unknown'} {blog?.author?.last_name || ''}
                  </p>
                  <p className="text-sm text-gray-500">{blog?.branch?.name || 'Head Office'}</p>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {formatDate(blog?.published_date || blog?.created_at || new Date().toISOString())}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {calculateReadingTime(blog?.content || '')} min read
                </div>
              </div>
            </div>
            
            <div className="prose prose-lg max-w-none mb-8">
              {(blog?.content || '').split('\n\n').map((paragraph, index) => (
                <p key={index} className="mb-6 text-gray-700 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
            
            <div className="flex justify-between items-center py-6 border-t border-gray-100">
              <p className="font-medium text-[#153147]">Share this article</p>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="rounded-full w-10 h-10 border-gray-200"
                  onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(blog?.title || 'Check out this article')}`, '_blank')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="rounded-full w-10 h-10 border-gray-200"
                  onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=`, '_blank')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="rounded-full w-10 h-10 border-gray-200"
                  onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/`, '_blank')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogModal; 