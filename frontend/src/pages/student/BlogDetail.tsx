import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Calendar, User, ArrowLeft, Clock } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { StudentLayout } from '../../components/Layout';

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

  useEffect(() => {
    const fetchBlogDetail = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/blogs/${id}/`);
        setBlog(response.data);
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
    const wordsPerMinute = 200;
    const words = content.split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return Math.max(1, minutes); // Minimum 1 minute reading time
  };

  return (
    <StudentLayout>
      <div className="container mx-auto px-6 py-12">
        {loading ? (
          <div className="text-center py-12">Loading article...</div>
        ) : !blog ? (
          <div className="text-center py-12">
            <p>Article not found or has been removed.</p>
            <Button 
              variant="outline"
              className="mt-4"
              onClick={() => navigate('/student/blogs')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Articles
            </Button>
          </div>
        ) : (
          <div className="flex flex-col max-w-4xl mx-auto">
            <div className="mb-6">
              <Button 
                variant="outline"
                className="mb-6"
                onClick={() => navigate('/student/blogs')}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Articles
              </Button>
              
              <h1 className="text-4xl font-bold text-[#153147] mb-4">{blog.title}</h1>
              
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-700">{blog.author.first_name} {blog.author.last_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-700">{formatDate(blog.published_date || blog.created_at)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-700">{calculateReadingTime(blog.content)} min read</span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-8">
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
              
              {blog.featured_image && (
                <div className="mb-8">
                  <img 
                    src={blog.featured_image} 
                    alt={blog.title} 
                    className="w-full h-auto rounded-xl object-cover"
                    style={{ maxHeight: '400px' }}
                  />
                </div>
              )}
            </div>
            
            <div className="prose prose-lg max-w-none mb-12">
              {blog.content.split('\n\n').map((paragraph, index) => (
                <p key={index} className="mb-6 text-gray-700 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
            
            <div className="border-t border-gray-200 pt-8 mt-8">
              <h3 className="text-lg font-semibold text-[#153147] mb-4">About the Author</h3>
              <div className="flex items-center gap-4">
                <div className="bg-[#153147] text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold">
                  {blog.author.first_name.charAt(0)}
                  {blog.author.last_name.charAt(0)}
                </div>
                <div>
                  <p className="font-medium">{blog.author.first_name} {blog.author.last_name}</p>
                  <p className="text-gray-500 text-sm">{blog.branch.name}</p>
                </div>
              </div>
            </div>
            
            <div className="mt-12 text-center">
              <Button 
                onClick={() => navigate('/student/blogs')}
                className="bg-[#153147] hover:bg-[#0e2336]"
              >
                Read more articles
              </Button>
            </div>
          </div>
        )}
      </div>
    </StudentLayout>
  );
};

export default BlogDetail; 