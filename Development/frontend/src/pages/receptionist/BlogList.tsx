import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MagnifyingGlassIcon, 
  ArrowDownTrayIcon, 
  EyeIcon 
} from '@heroicons/react/24/outline';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import ViewBlogModal from '../../components/ViewBlogModal';
import { blogAPI } from '../../lib/api';
import { useAuth } from '../../lib/AuthContext';

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

const ReceptionistBlogList = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // UI state variables
  const [searchQuery, setSearchQuery] = useState("");
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Function to fetch blogs from API
  const fetchBlogs = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Try to fetch all published blogs if branch information is missing
      if (!user?.branch) {
        console.warn('Branch information not available, fetching published blogs instead');
        const response = await blogAPI.getPublished();
        setBlogs(response.data);
        setLoading(false);
        return;
      }
      
      // Make API call filtered by branch
      const response = await blogAPI.getByBranch(user.branch);
      
      setBlogs(response.data);
      setLoading(false);
    } catch (err: any) {
      console.error('Error fetching blogs:', err);
      setError(err.response?.data?.detail || 'Failed to fetch blogs. Please try again.');
      setLoading(false);
      
      // Fallback to published blogs on error
      try {
        const response = await blogAPI.getPublished();
        setBlogs(response.data);
        setError('');
      } catch (fallbackErr) {
        console.error('Error fetching fallback blogs:', fallbackErr);
      }
    }
  };

  useEffect(() => {
    // Check if user is logged in and is a Receptionist
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      navigate('/login');
      return;
    }
    
    if (user?.role !== 'Receptionist') {
      navigate('/login');
      return;
    }

    fetchBlogs();
  }, [navigate, user]);

  // Filtered blogs based on search query
  const filteredBlogs = blogs.filter((blog) =>
    blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    blog.author_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    blog.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredBlogs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentBlogs = filteredBlogs.slice(startIndex, endIndex);

  const handleView = (blog: Blog) => {
    setSelectedBlog(blog);
    setIsViewModalOpen(true);
  };

  const handleExport = () => {
    // Convert blogs to CSV
    const headers = ['S.No', 'Title', 'Author', 'Status', 'Created At', 'Updated At'];
    
    const csvRows = filteredBlogs.map((blog, index) => {
      return [
        index + 1,
        blog.title,
        blog.author_name,
        blog.status,
        new Date(blog.created_at).toLocaleString(),
        new Date(blog.updated_at).toLocaleString(),
      ].join(',');
    });
    
    const csvContent = `${headers.join(',')}\n${csvRows.join('\n')}`;
    
    // Create a blob and download
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'blogs_export.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Branch Blogs</h1>
        {blogs.length > 0 && (
          <div className="flex space-x-2">
            <Button 
              onClick={handleExport}
              variant="outline" 
              className="border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
              Export
            </Button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex flex-wrap justify-between items-center gap-4">
          <div className="flex flex-1 min-w-[260px]">
            <div className="relative w-full">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <Input
                type="text"
                placeholder="Search blogs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-[#153147]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  S.No
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Author
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Created At
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Updated At
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentBlogs.length > 0 ? (
                currentBlogs.map((blog, index) => (
                  <tr key={blog.id} className="hover:bg-gray-50 transition-colors duration-150 ease-in-out">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {startIndex + index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {blog.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {blog.author_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge 
                        className={`${
                          blog.status === 'published' 
                            ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                            : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                        } px-2 py-1 text-xs`}
                      >
                        {blog.status ? blog.status.charAt(0).toUpperCase() + blog.status.slice(1) : 'Unknown'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(blog.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(blog.updated_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Button 
                          onClick={() => handleView(blog)} 
                          size="sm"
                          variant="ghost"
                          className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    {error ? 
                      <div className="text-red-500">{error}</div> :
                      blogs.length === 0 ? 
                        user?.branch ? "No blogs found in your branch." : "No blogs available at this time." : 
                        "No blogs match your search criteria."
                    }
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center border-t border-gray-200 px-4 py-3 sm:px-6">
            <div className="flex items-center">
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
                <span className="font-medium">
                  {Math.min(endIndex, filteredBlogs.length)}
                </span>{" "}
                of <span className="font-medium">{filteredBlogs.length}</span> results
              </p>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="text-sm rounded"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="text-sm rounded"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
      
      {/* View Blog Modal */}
      <ViewBlogModal
        isOpen={isViewModalOpen}
        blog={selectedBlog}
        onClose={() => setIsViewModalOpen(false)}
      />
    </div>
  );
};

export default ReceptionistBlogList; 