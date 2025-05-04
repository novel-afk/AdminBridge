import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../lib/constants';
import Layout from '../components/Layout';
import { Badge } from '../components/ui/badge';

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

const BlogPost = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/blogs/${id}/`);
        setBlog(response.data);
        setError(null);
      } catch (err: any) {
        setError('Failed to load blog. Please try again later.');
        console.error('Error fetching blog:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBlog();
    }
  }, [id]);

  return (
    <Layout showSidebar={false}>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] text-primary motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
            <p className="mt-2 text-gray-600">Loading blog post...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-500 mb-2">⚠️</div>
            <p>{error}</p>
            <button 
              className="mt-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
              onClick={() => navigate('/blog')}
            >
              Back to Blog List
            </button>
          </div>
        ) : blog ? (
          <article className="bg-white rounded-lg shadow-md overflow-hidden">
            {blog.thumbnail_image && (
              <div className="w-full">
                <img 
                  src={blog.thumbnail_image} 
                  alt={blog.title} 
                  className="w-full h-64 object-cover" 
                />
              </div>
            )}
            
            <div className="p-6">
              <div className="flex flex-wrap gap-2 mb-4">
                {blog.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="bg-blue-50">
                    {tag}
                  </Badge>
                ))}
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{blog.title}</h1>
              
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 mr-3">
                  {blog.author_name.charAt(0)}
                </div>
                <div>
                  <p className="font-medium">{blog.author_name}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(blog.created_at).toLocaleDateString()} • {blog.branch_name}
                  </p>
                </div>
              </div>
              
              <div className="prose prose-lg max-w-none">
                {blog.content.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-4">{paragraph}</p>
                ))}
              </div>
              
              <div className="mt-8 pt-6 border-t border-gray-200">
                <button
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
                  onClick={() => navigate('/blog')}
                >
                  Back to Blog List
                </button>
              </div>
            </div>
          </article>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">Blog post not found.</p>
            <button 
              className="mt-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
              onClick={() => navigate('/blog')}
            >
              Back to Blog List
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default BlogPost; 