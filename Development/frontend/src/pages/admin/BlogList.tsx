import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MagnifyingGlassIcon, 
  PlusIcon, 
  ArrowDownTrayIcon, 
  TrashIcon, 
  EyeIcon, 
  PencilIcon,
  CalendarIcon,
  UserIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Checkbox } from '../../components/ui/checkbox';
import { Badge } from '../../components/ui/badge';
import ConfirmationModal from '../../components/ConfirmationModal';
import AddBlogModal from '../../components/AddBlogModal';
import EditBlogModal from '../../components/EditBlogModal';
import ViewBlogModal from '../../components/ViewBlogModal';
import { blogAPI } from '../../lib/api';
import { useAuth } from '../../lib/AuthContext';

// This is the type from the API response
interface ApiBlog {
  id: number;
  title: string;
  content: string;
  featured_image: string | null;
  branch: number;
  branch_name: string;
  author: number;
  author_name: string;
  created_at: string;
  updated_at: string;
  status: 'draft' | 'published';
  is_published?: boolean;
  published_date?: string | null;
  slug: string;
  tags: string[];
}

// This type is used by the components (with thumbnail_image instead of featured_image)
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

const columns = [
  { key: "select", label: "" },
  { key: "sNo", label: "S.No" },
  { key: "title", label: "Title" },
  { key: "branch", label: "Branch" },
  { key: "author", label: "Author" },
  { key: "status", label: "Status" },
  { key: "created", label: "Created At" },
  { key: "updated", label: "Updated At" },
  { key: "actions", label: "Actions" },
];

const BlogList = () => {
  const [blogs, setBlogs] = useState<ApiBlog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // UI state variables
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedBlogs, setSelectedBlogs] = useState<number[]>([]);
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9; // Changed from 10 to 9 for better grid layout (3x3)
  
  // Confirmation modal states
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'success' as 'success' | 'warning' | 'danger',
    confirmText: 'Confirm'
  });

  // Helper function to convert from ApiBlog to Blog type
  const convertApiBlogToBlog = (apiBlog: ApiBlog): Blog => {
    return {
      ...apiBlog,
      thumbnail_image: apiBlog.featured_image,
      // Ensure all fields from Blog interface are present
      slug: apiBlog.slug || '',
      tags: apiBlog.tags || [],
      status: apiBlog.status || (apiBlog.is_published ? 'published' : 'draft')
    };
  };

  const showConfirmation = (config: Partial<typeof confirmationModal>) => {
    setConfirmationModal({
      ...confirmationModal,
      isOpen: true,
      ...config,
    });
  };
  
  // Function to fetch blogs from API
  const fetchBlogs = async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError('');
      
      // Make API call
      const response = await blogAPI.getAll();
      
      setBlogs(response.data);
      setLoading(false);
      setRefreshing(false);
    } catch (err: any) {
      console.error('Error fetching blogs:', err);
      setError(err.response?.data?.detail || 'Failed to fetch blogs. Please try again.');
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    // Check if user is logged in
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      navigate('/login');
      return;
    }

    fetchBlogs();
  }, [navigate]);

  // Filtered blogs based on search query
  const filteredBlogs = blogs.filter((blog) =>
    blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    blog.branch_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    blog.author_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (blog.status?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredBlogs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentBlogs = filteredBlogs.slice(startIndex, endIndex);

  const handleSelectBlog = (id: number) => {
    setSelectedBlogs((prev) => {
      if (prev.includes(id)) {
        return prev.filter((blogId) => blogId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allBlogIds = currentBlogs.map((blog) => blog.id);
      setSelectedBlogs(allBlogIds);
    } else {
      setSelectedBlogs([]);
    }
  };

  const handleExport = () => {
    // Convert blogs to CSV
    const headers = columns.filter(col => col.key !== 'select' && col.key !== 'actions').map(col => col.label);
    
    const rows = selectedBlogs.length > 0 
      ? filteredBlogs.filter(blog => selectedBlogs.includes(blog.id)) 
      : filteredBlogs;
    
    const csvRows = rows.map(blog => {
      return [
        '',
        blog.id,
        blog.title,
        blog.branch_name,
        blog.author_name,
        blog.status || (blog.is_published ? 'published' : 'draft'),
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

  const handleDeleteSelected = () => {
    if (selectedBlogs.length === 0) return;
    
    showConfirmation({
      title: 'Delete Selected Blogs',
      message: `Are you sure you want to delete ${selectedBlogs.length} selected blog${selectedBlogs.length > 1 ? 's' : ''}?`,
      type: 'danger',
      confirmText: 'Delete',
      onConfirm: async () => {
        try {
          // Delete each selected blog
          for (const blogId of selectedBlogs) {
            await blogAPI.delete(blogId);
          }
          
          // Refresh blog list
          fetchBlogs(true);
          setSelectedBlogs([]);
          
          // Show success message
          showConfirmation({
            title: 'Success',
            message: `${selectedBlogs.length} blog${selectedBlogs.length > 1 ? 's were' : ' was'} deleted successfully.`,
            type: 'success',
            confirmText: 'OK',
            onConfirm: () => setConfirmationModal(prev => ({ ...prev, isOpen: false }))
          });
        } catch (err: any) {
          console.error('Error deleting blogs:', err);
          // Show error message
          showConfirmation({
            title: 'Error',
            message: err.response?.data?.detail || 'Failed to delete blogs. Please try again.',
            type: 'danger',
            confirmText: 'OK',
            onConfirm: () => setConfirmationModal(prev => ({ ...prev, isOpen: false }))
          });
        }
      }
    });
  };

  const handleDeleteSingle = (blog: ApiBlog) => {
    showConfirmation({
      title: 'Delete Blog',
      message: `Are you sure you want to delete the blog "${blog.title}"?`,
      type: 'danger',
      confirmText: 'Delete',
      onConfirm: async () => {
        try {
          await blogAPI.delete(blog.id);
          
          // Refresh blog list
          fetchBlogs(true);
          
          // Show success message
          showConfirmation({
            title: 'Success',
            message: 'Blog was deleted successfully.',
            type: 'success',
            confirmText: 'OK',
            onConfirm: () => setConfirmationModal(prev => ({ ...prev, isOpen: false }))
          });
        } catch (err: any) {
          console.error('Error deleting blog:', err);
          // Show error message
          showConfirmation({
            title: 'Error',
            message: err.response?.data?.detail || 'Failed to delete blog. Please try again.',
            type: 'danger',
            confirmText: 'OK',
            onConfirm: () => setConfirmationModal(prev => ({ ...prev, isOpen: false }))
          });
        }
      }
    });
  };

  const handleView = (blog: ApiBlog) => {
    setSelectedBlog(convertApiBlogToBlog(blog));
    setIsViewModalOpen(true);
  };

  const handleEdit = (blog: ApiBlog) => {
    setSelectedBlog(convertApiBlogToBlog(blog));
    setIsEditModalOpen(true);
  };

  const handleAddSuccess = () => {
    fetchBlogs(true);
    setIsAddModalOpen(false);
  };

  const handleEditSuccess = () => {
    fetchBlogs(true);
    setIsEditModalOpen(false);
  };

  // Function to generate a placeholder image if featured image is missing
  const getImageUrl = (blog: ApiBlog) => {
    if (blog.featured_image) return blog.featured_image;
    
    // Use a deterministic placeholder based on blog ID
    const imageId = (blog.id % 10) + 1; // 1-10 range
    return `https://source.unsplash.com/collection/1346951/800x450?sig=${imageId}`;
  };
  
  // Function to truncate text
  const truncateText = (text: string, maxLength: number) => {
    if (!text) return '';
    const strippedText = text.replace(/<[^>]*>?/gm, '');
    return strippedText.length > maxLength ? strippedText.slice(0, maxLength) + '...' : strippedText;
  };

  // Get blog status (handle different API field names)
  const getBlogStatus = (blog: ApiBlog): string => {
    if (blog.status) return blog.status;
    return blog.is_published ? 'published' : 'draft';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Blogs</h1>
        <div className="flex space-x-2">
          <Button onClick={() => setIsAddModalOpen(true)} className="bg-blue-600 hover:bg-blue-700">
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Blog
          </Button>
        </div>
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
          
          <div className="flex space-x-2">
            <Button 
              onClick={handleExport}
              variant="outline" 
              className="border-gray-300 text-gray-700 hover:bg-gray-100"
              disabled={blogs.length === 0}
            >
              <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
              Export
            </Button>
            
            <Button
              onClick={handleDeleteSelected}
              variant="outline"
              className="border-red-300 text-red-700 hover:bg-red-50"
              disabled={selectedBlogs.length === 0}
            >
              <TrashIcon className="h-5 w-5 mr-2" />
              Delete Selected
            </Button>
          </div>
        </div>

        {/* Select All Checkbox */}
        <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center">
          <Checkbox
            checked={currentBlogs.length > 0 && selectedBlogs.length === currentBlogs.length}
            onCheckedChange={handleSelectAll}
            className="mr-2"
          />
          <span className="text-sm text-gray-600">
            {selectedBlogs.length > 0 ? 
              `${selectedBlogs.length} blog${selectedBlogs.length > 1 ? 's' : ''} selected` : 
              'Select all blogs on this page'
            }
          </span>
        </div>

        {/* Blog Cards Grid View */}
        <div className="p-6">
          {currentBlogs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentBlogs.map((blog) => (
                <div 
                  key={blog.id}
                  className={`rounded-lg border overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 ${
                    selectedBlogs.includes(blog.id) ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'
                  }`}
                >
                  {/* Blog Image */}
                  <div className="h-48 relative">
                    <img 
                      src={getImageUrl(blog)} 
                      alt={blog.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2">
                      <Checkbox
                        checked={selectedBlogs.includes(blog.id)}
                        onCheckedChange={() => handleSelectBlog(blog.id)}
                        className="bg-white/80 text-blue-500 shadow-sm border-gray-300"
                      />
                    </div>
                    <div className="absolute top-2 right-2">
                      <Badge 
                        className={`${
                          getBlogStatus(blog) === 'published' 
                            ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                            : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                        } px-2 py-1 text-xs font-semibold`}
                      >
                        {getBlogStatus(blog).charAt(0).toUpperCase() + getBlogStatus(blog).slice(1)}
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Blog Content */}
                  <div className="p-4">
                    <h3 className="font-semibold text-lg text-gray-800 mb-2 line-clamp-1">{blog.title}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {truncateText(blog.content, 100)}
                    </p>
                    
                    <div className="space-y-2 text-sm text-gray-500 mb-4">
                      <div className="flex items-center">
                        <UserIcon className="h-4 w-4 mr-2" />
                        <span>{blog.author_name}</span>
                      </div>
                      <div className="flex items-center">
                        <BuildingOfficeIcon className="h-4 w-4 mr-2" />
                        <span>{blog.branch_name}</span>
                      </div>
                      <div className="flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        <span>{new Date(blog.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-2 pt-2 border-t border-gray-100">
                      <Button 
                        onClick={() => handleView(blog)} 
                        size="sm"
                        variant="ghost"
                        className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                      >
                        <EyeIcon className="h-4 w-4 mr-1" /> View
                      </Button>
                      
                      <Button 
                        onClick={() => handleEdit(blog)} 
                        size="sm"
                        variant="ghost"
                        className="text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50"
                      >
                        <PencilIcon className="h-4 w-4 mr-1" /> Edit
                      </Button>
                      
                      <Button 
                        onClick={() => handleDeleteSingle(blog)} 
                        size="sm"
                        variant="ghost"
                        className="text-red-600 hover:text-red-800 hover:bg-red-50"
                      >
                        <TrashIcon className="h-4 w-4 mr-1" /> Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              {error ? (
                <div className="text-red-500">
                  <div className="text-4xl mb-4">⚠️</div>
                  <p>{error}</p>
                </div>
              ) : blogs.length === 0 ? (
                <div>
                  <div className="text-4xl mb-4">📝</div>
                  <p className="text-gray-500 mb-4">No blogs found. Create your first blog!</p>
                  <Button onClick={() => setIsAddModalOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Add Blog
                  </Button>
                </div>
              ) : (
                <div>
                  <div className="text-4xl mb-4">🔍</div>
                  <p className="text-gray-500">No blogs match your search criteria.</p>
                </div>
              )}
            </div>
          )}
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

      {/* Modals */}
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        title={confirmationModal.title}
        message={confirmationModal.message}
        confirmText={confirmationModal.confirmText}
        type={confirmationModal.type}
        onConfirm={confirmationModal.onConfirm}
        onClose={() => setConfirmationModal(prev => ({ ...prev, isOpen: false }))}
      />
      
      <AddBlogModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleAddSuccess}
      />
      
      <EditBlogModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={handleEditSuccess}
        blog={selectedBlog}
      />
      
      <ViewBlogModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        blog={selectedBlog}
      />
    </div>
  );
};

export default BlogList; 