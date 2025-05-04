import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Calendar, User, Tag, Clock } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { StudentLayout } from '../../components/Layout';
import { blogAPI } from '../../lib/api'; // Import API method

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
        const response = await blogAPI.getPublished();
        
        let blogsData: Blog[] = [];
        if (response.data.results && Array.isArray(response.data.results)) {
          blogsData = response.data.results;
        } else if (Array.isArray(response.data)) {
          blogsData = response.data;
        }
        
        console.log('Blogs data:', blogsData);
        setBlogs(blogsData);
        setFilteredBlogs(blogsData);
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

  // Function to truncate text
  const truncateText = (text: string, maxLength: number) => {
    if (!text) return '';
    // Remove HTML tags for clean display
    const strippedText = text.replace(/<[^>]*>?/gm, '');
    return strippedText.length > maxLength ? strippedText.slice(0, maxLength) + '...' : strippedText;
  };

  // Get placeholder image if featured image is missing
  const getImageUrl = (blog: Blog) => {
    if (blog.featured_image) return blog.featured_image;
    
    // Use a deterministic placeholder based on blog ID
    const imageId = (blog.id % 10) + 1; // 1-10 range
    return `https://source.unsplash.com/collection/1346951/800x450?sig=${imageId}`;
  };

  // Get reading time estimate
  const getReadingTime = (content: string) => {
    if (!content) return '1 min read';
    const wordsPerMinute = 200;
    const words = content.replace(/<[^>]*>?/gm, '').split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return `${minutes} min read`;
  };

  return (
    <StudentLayout>
      <div className="bg-gray-50 min-h-screen">
        {/* Hero section */}
        <div className="bg-gradient-to-r from-[#153147] to-[#0e2336] py-16">
          <div className="container mx-auto px-6">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Our Blog</h1>
            <p className="text-xl text-gray-200 mb-8 max-w-2xl">
              Stay updated with the latest insights, tips, and news from our team
            </p>
            
            <div className="relative max-w-xl">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Search articles..."
                className="pl-10 py-3 w-full rounded-lg border-0 focus:ring-2 focus:ring-[#3b82f6]"
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>
          </div>
        </div>
        
        <div className="container mx-auto px-6 py-12">
          {loading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 border-4 border-t-[#153147] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-[#153147] font-medium">Loading articles...</p>
              </div>
            </div>
          ) : filteredBlogs.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <div className="text-7xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold text-[#153147] mb-2">No articles found</h3>
              <p className="text-gray-600">Try adjusting your search criteria</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-12">
              {/* Featured post (first post) */}
              {filteredBlogs.length > 0 && (
                <div className="bg-white rounded-xl overflow-hidden shadow-md">
                  <div className="md:flex">
                    <div className="md:w-2/5 h-64 md:h-auto">
                      <img 
                        src={getImageUrl(filteredBlogs[0])} 
                        alt={filteredBlogs[0].title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="md:w-3/5 p-8">
                      <div className="flex flex-wrap gap-2 mb-4">
                        <Badge className="bg-[#153147] hover:bg-[#0e2336] text-white">Featured</Badge>
                        {getRandomTags(filteredBlogs[0].id).map((tag, index) => (
                          <Badge 
                            key={index} 
                            variant="outline" 
                            className="bg-[#153147]/5 text-[#153147] border-[#153147]/20"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      
                      <h2 className="text-3xl font-bold text-[#153147] mb-4">{filteredBlogs[0].title}</h2>
                      
                      <p className="text-gray-600 mb-6">
                        {truncateText(filteredBlogs[0].content || "", 280)}
                      </p>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-full bg-[#153147] flex items-center justify-center text-white font-semibold">
                            {filteredBlogs[0].author.first_name[0]}{filteredBlogs[0].author.last_name[0]}
                          </div>
                          <span className="text-sm font-medium">{filteredBlogs[0].author.first_name} {filteredBlogs[0].author.last_name}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Calendar className="h-4 w-4" />
                            {formatDate(filteredBlogs[0].published_date || filteredBlogs[0].created_at)}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Clock className="h-4 w-4" />
                            {getReadingTime(filteredBlogs[0].content)}
                          </div>
                        </div>
                      </div>
                      
                      <Link to={`/student/blogs/${filteredBlogs[0].id}`}>
                        <Button 
                          className="bg-[#153147] hover:bg-[#0e2336]"
                        >
                          Read full article
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Blog grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredBlogs.slice(1).map((blog) => (
                  <div 
                    key={blog.id}
                    className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col"
                  >
                    <div className="h-48 overflow-hidden">
                      <img 
                        src={getImageUrl(blog)} 
                        alt={blog.title}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex flex-wrap gap-2 mb-3">
                        {getRandomTags(blog.id).map((tag, index) => (
                          <Badge 
                            key={index} 
                            variant="outline" 
                            className="bg-[#153147]/5 text-[#153147] border-[#153147]/20 text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      
                      <h2 className="text-xl font-bold text-[#153147] mb-3 line-clamp-2">{blog.title}</h2>
                      
                      <p className="text-gray-600 mb-4 text-sm line-clamp-3">
                        {truncateText(blog.content || "", 120)}
                      </p>
                      
                      <div className="mt-auto">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-[#153147] flex items-center justify-center text-white text-xs font-semibold">
                              {blog.author.first_name[0]}{blog.author.last_name[0]}
                            </div>
                            <span className="text-xs">{blog.author.first_name} {blog.author.last_name}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Clock className="h-3 w-3" />
                            {getReadingTime(blog.content)}
                          </div>
                        </div>
                        
                        <Link to={`/student/blogs/${blog.id}`} className="block">
                          <Button 
                            variant="outline"
                            className="w-full border-[#153147] text-[#153147] hover:bg-[#153147] hover:text-white"
                          >
                            Read article
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </StudentLayout>
  );
};

export default Blogs; 