import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import BlogCard from '../components/BlogCard';
import { API_URL } from '../lib/constants';
import Layout from '../components/Layout';
import ViewBlogModal from '../components/ViewBlogModal';

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

const Blog = () => {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewBlog, setViewBlog] = useState<Blog | null>(null);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/blogs/`);
      
      // Sort blogs by created date, newest first
      const sortedBlogs = response.data.sort((a: Blog, b: Blog) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      
      setBlogs(sortedBlogs);
      setError(null);
    } catch (err: any) {
      setError('Failed to load blogs. Please try again later.');
      console.error('Error fetching blogs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleBlogClick = (blogId: number) => {
    navigate(`/blog/${blogId}`);
  };

  return (
    <Layout showSidebar={false}>
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Blog</h1>
          <p className="mt-2 text-gray-600">Latest updates, news and announcements</p>
        </header>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] text-primary motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
            <p className="mt-2 text-gray-600">Loading blogs...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-500 mb-2">⚠️</div>
            <p>{error}</p>
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No blogs have been published yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map(blog => (
              <BlogCard
                key={blog.id}
                id={blog.id}
                title={blog.title}
                author={blog.author_name}
                authorTitle="Author"
                date={new Date(blog.created_at).toLocaleDateString()}
                isPublished={blog.status === 'published'}
                tags={blog.tags || []}
                onClick={() => handleBlogClick(blog.id)}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* View Blog Modal */}
      <ViewBlogModal
        isOpen={!!viewBlog}
        onClose={() => setViewBlog(null)}
        blog={viewBlog}
      />
    </Layout>
  );
};

export default Blog; 