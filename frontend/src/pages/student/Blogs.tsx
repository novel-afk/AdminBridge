import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Search, Calendar, User } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import Layout from '../../components/Layout';
import StudentHeader from '../../components/StudentHeader';

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
}

const Blogs: React.FC = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredBlogs, setFilteredBlogs] = useState<Blog[]>([]);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/blogs/?is_published=true');
        setBlogs(response.data.results || []);
        setFilteredBlogs(response.data.results || []);
      } catch (error) {
        console.error('Error fetching blogs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredBlogs(blogs);
    } else {
      const filtered = blogs.filter(blog => 
        blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        blog.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        `${blog.author.first_name} ${blog.author.last_name}`.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredBlogs(filtered);
    }
  }, [searchQuery, blogs]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

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

  return (
    <>
      <StudentHeader />
      <Layout showSidebar={false} showHeader={false}>
        <div className="container mx-auto px-6 py-12">
          <div className="flex flex-col">
            <h1 className="text-3xl font-bold text-[#153147] mb-2">Blog Posts</h1>
            <p className="text-[#ADB8BB] mb-6">Explore our latest articles</p>
            
            <div className="relative mb-8">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Search articles..."
                className="pl-10 py-2 w-full md:w-1/2 border-gray-300 focus:border-[#153147] focus:ring-[#153147]"
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>
            
            {loading ? (
              <div className="text-center py-12">Loading articles...</div>
            ) : filteredBlogs.length === 0 ? (
              <div className="text-center py-12">No articles found matching your search criteria</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBlogs.map((blog) => (
                  <div 
                    key={blog.id}
                    className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
                  >
                    <div className="p-6">
                      <div className="mb-2">
                        <Badge className="bg-green-100 text-green-800 border-0">Published</Badge>
                      </div>
                      <h2 className="text-xl font-semibold text-[#153147] mb-4">{blog.title}</h2>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{blog.author.first_name} {blog.author.last_name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{formatDate(blog.published_date || blog.created_at)}</span>
                        </div>
                      </div>
                      
                      <div className="mb-4 flex flex-wrap gap-2">
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
                      
                      <div className="flex justify-end">
                        <Button
                          variant="default"
                          className="bg-[#153147] hover:bg-[#0e2336]"
                          onClick={() => window.location.href = `/student/blogs/${blog.id}`}
                        >
                          Read article
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Layout>
    </>
  );
};

export default Blogs; 