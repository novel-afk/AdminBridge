import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Calendar, User, ArrowLeft, Clock, Tag, Share2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { StudentLayout } from '../../components/Layout';
import { blogAPI } from '../../lib/api';

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
  is_published: boolean;
  created_at: string;
  branch: {
    name: string;
  };
}

const BlogDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [relatedBlogs, setRelatedBlogs] = useState<Blog[]>([]);

  useEffect(() => {
    const fetchBlogDetail = async () => {
      try {
        setLoading(true);
        const response = await blogAPI.getById(Number(id));
        setBlog(response.data);
        
        // Fetch related blogs
        const relatedResponse = await blogAPI.getPublished();
        let blogsData: Blog[] = [];
        if (relatedResponse.data.results && Array.isArray(relatedResponse.data.results)) {
          blogsData = relatedResponse.data.results;
        } else if (Array.isArray(relatedResponse.data)) {
          blogsData = relatedResponse.data;
        }
        
        // Filter out current blog and take up to 3 blogs
        const filteredBlogs = blogsData.filter(blog => blog.id !== Number(id)).slice(0, 3);
        setRelatedBlogs(filteredBlogs);
      } catch (error) {
        console.error('Error fetching blog details:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBlogDetail();
    }
  }, [id]);

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

  // Function to truncate text
  const truncateText = (text: string, maxLength: number) => {
    if (!text) return '';
    // Remove HTML tags for clean display
    const strippedText = text.replace(/<[^>]*>?/gm, '');
    return strippedText.length > maxLength ? strippedText.slice(0, maxLength) + '...' : strippedText;
  };

  return (
    <StudentLayout>
      <div className="bg-gray-50 min-h-screen">
        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 border-4 border-t-[#153147] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-[#153147] font-medium">Loading article...</p>
            </div>
          </div>
        ) : !blog ? (
          <div className="container mx-auto px-6 py-16 text-center">
            <div className="max-w-lg mx-auto bg-white rounded-xl shadow-md p-12">
              <div className="text-7xl mb-6">📄</div>
              <h2 className="text-2xl font-bold text-[#153147] mb-4">Article Not Found</h2>
              <p className="text-gray-600 mb-8">This article may have been removed or is no longer available.</p>
              <Button 
                onClick={() => navigate('/student/blogs')}
                className="bg-[#153147] hover:bg-[#0e2336]"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Blog
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Hero section with image */}
            <div className="w-full h-80 md:h-96 relative">
              <div className="absolute inset-0 bg-gradient-to-b from-[#153147]/80 to-[#153147]/30 z-10"></div>
              <img 
                src={getImageUrl(blog)} 
                alt={blog.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-0 left-0 p-6 z-20">
                <Button 
                  variant="outline"
                  className="bg-white/20 backdrop-blur-sm border-white/40 text-white hover:bg-white/30"
                  onClick={() => navigate('/student/blogs')}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Blog
                </Button>
              </div>
            </div>
            
            <div className="container mx-auto px-6 py-12">
              <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md p-8 md:p-12 -mt-20 relative z-20">
                <div className="flex flex-wrap gap-2 mb-4">
                  {getRandomTags(blog.id).map((tag, index) => (
                    <Badge 
                      key={index} 
                      variant="outline" 
                      className="bg-[#153147]/5 text-[#153147] border-[#153147]/20"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
                
                <h1 className="text-3xl md:text-4xl font-bold text-[#153147] mb-6">{blog.title}</h1>
                
                <div className="flex flex-col sm:flex-row sm:items-center gap-6 mb-8 pb-8 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[#153147] flex items-center justify-center text-white font-semibold">
                      {blog.author.first_name[0]}{blog.author.last_name[0]}
                    </div>
                    <div>
                      <p className="font-medium">{blog.author.first_name} {blog.author.last_name}</p>
                      <p className="text-sm text-gray-500">{blog.branch?.name || 'Head Office'}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatDate(blog.published_date || blog.created_at)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {calculateReadingTime(blog.content)} min read
                    </div>
                  </div>
                </div>
                
                <div className="prose prose-lg max-w-none mb-8">
                  {blog.content.split('\n\n').map((paragraph, index) => (
                    <p key={index} className="mb-6 text-gray-700 leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
                
                <div className="flex justify-between items-center py-6 border-t border-gray-100 mb-8">
                  <p className="font-medium text-[#153147]">Share this article</p>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="rounded-full w-10 h-10 border-gray-200"
                      onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(blog.title)}&url=${encodeURIComponent(window.location.href)}`, '_blank')}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="rounded-full w-10 h-10 border-gray-200"
                      onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank')}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="rounded-full w-10 h-10 border-gray-200"
                      onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`, '_blank')}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Related articles */}
              {relatedBlogs.length > 0 && (
                <div className="max-w-4xl mx-auto mt-16">
                  <h2 className="text-2xl font-bold text-[#153147] mb-6">Related Articles</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {relatedBlogs.map(relatedBlog => (
                      <div 
                        key={relatedBlog.id}
                        className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col"
                      >
                        <div className="h-40 overflow-hidden">
                          <img 
                            src={getImageUrl(relatedBlog)} 
                            alt={relatedBlog.title}
                            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                          />
                        </div>
                        <div className="p-5 flex-1 flex flex-col">
                          <h3 className="text-lg font-bold text-[#153147] mb-2 line-clamp-2">{relatedBlog.title}</h3>
                          
                          <p className="text-gray-600 mb-4 text-sm line-clamp-2">
                            {truncateText(relatedBlog.content || "", 80)}
                          </p>
                          
                          <div className="mt-auto">
                            <Button 
                              variant="outline"
                              className="w-full border-[#153147] text-[#153147] hover:bg-[#153147] hover:text-white"
                              onClick={() => navigate(`/student/blogs/${relatedBlog.id}`)}
                            >
                              Read article
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </StudentLayout>
  );
};

export default BlogDetail; 