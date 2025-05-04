import { useState } from "react"
import { Plus, Search, Download, Trash, Eye, Pencil, Calendar, User } from "lucide-react"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Checkbox } from "../components/ui/checkbox"
import { Badge } from "../components/ui/badge"
import ConfirmationModal from "../components/ConfirmationModal"
import ViewBlogModal from "../components/ViewBlogModal"
import EditBlogModal from "../components/EditBlogModal"
import AddBlogModal from "../components/AddBlogModal"

// Dummy data generator
const blogs = Array.from({ length: 8 }, (_, index) => ({
  id: index + 1,
  title: [
    "Getting Started with React",
    "The Future of AI",
    "Web Development Trends 2024",
    "Understanding TypeScript",
    "Modern UI Design Principles",
    "DevOps Best Practices",
    "Mobile App Development Guide",
    "Cloud Computing Essentials"
  ][index],
  category: [
    "Development",
    "Technology",
    "Web Development",
    "Programming",
    "Design",
    "DevOps",
    "Mobile",
    "Cloud"
  ][index],
  author: [
    "John Doe",
    "Jane Smith",
    "Mike Johnson",
    "Sarah Wilson",
    "David Brown",
    "Emily Davis",
    "Chris Taylor",
    "Anna White"
  ][index],
  status: ["Published", "Published", "Published", "Published", "Published", "Published", "Published", "Published"][index],
  publishDate: [
    "2024-03-15",
    "2024-03-14",
    "2024-03-13",
    "2024-03-12",
    "2024-03-11",
    "2024-03-10",
    "2024-03-09",
    "2024-03-08"
  ][index],
  content: [
    "Learn the basics of React and how to build modern web applications...",
    "Explore the latest developments in artificial intelligence...",
    "Discover the trending technologies in web development...",
    "Master TypeScript and improve your JavaScript development...",
    "Learn about modern UI design principles and best practices...",
    "Implement DevOps practices in your development workflow...",
    "Build robust mobile applications with the latest technologies...",
    "Understanding cloud computing fundamentals and services..."
  ][index],
  tags: [
    ["React", "JavaScript", "Frontend"],
    ["AI", "Machine Learning", "Technology"],
    ["Web", "Development", "Trends"],
    ["TypeScript", "JavaScript", "Programming"],
    ["UI", "Design", "UX"],
    ["DevOps", "CI/CD", "Automation"],
    ["Mobile", "Apps", "Development"],
    ["Cloud", "AWS", "Infrastructure"]
  ][index],
}));

export default function BlogPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedBlogs, setSelectedBlogs] = useState([])
  const [selectedBlog, setSelectedBlog] = useState(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  // Confirmation modal states
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'success',
  })

  const showConfirmation = (config) => {
    setConfirmationModal({
      isOpen: true,
      ...config,
    })
  }

  const filteredBlogs = blogs.filter((blog) =>
    Object.values(blog).some((value) => 
      value.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
      (Array.isArray(value) && value.some(v => v.toString().toLowerCase().includes(searchQuery.toLowerCase())))
    )
  )

  const handleSelectBlog = (id) => {
    setSelectedBlogs((prev) => {
      if (prev.includes(id)) {
        return prev.filter((blogId) => blogId !== id)
      } else {
        return [...prev, id]
      }
    })
  }

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedBlogs(filteredBlogs.map((blog) => blog.id))
    } else {
      setSelectedBlogs([])
    }
  }

  const handleDelete = () => {
    showConfirmation({
      title: 'Delete Selected Blogs',
      message: `Are you sure you want to delete ${selectedBlogs.length} selected blog(s)? This action cannot be undone.`,
      type: 'danger',
      confirmText: 'Delete',
      onConfirm: () => {
        console.log("Deleting blogs:", selectedBlogs)
        setSelectedBlogs([])
        // Add your delete logic here
      },
    })
  }

  const handleDeleteSingle = (blog) => {
    showConfirmation({
      title: 'Delete Blog',
      message: `Are you sure you want to delete "${blog.title}"? This action cannot be undone.`,
      type: 'danger',
      confirmText: 'Delete',
      onConfirm: () => {
        console.log("Deleting single blog:", blog)
        // Add your delete logic here
      },
    })
  }

  const handleView = (blog) => {
    setSelectedBlog(blog)
    setIsViewModalOpen(true)
  }

  const handleEdit = (blog) => {
    setSelectedBlog(blog)
    setIsEditModalOpen(true)
  }

  const handleEditSuccess = () => {
    setIsEditModalOpen(false)
    setSelectedBlog(null)
    // Here you would typically refresh the blogs data
    console.log("Blog updated successfully")
  }

  const handleAddSuccess = () => {
    setIsAddModalOpen(false)
    // Here you would typically refresh the blogs data
    console.log("Blog added successfully")
  }

  const handleExport = () => {
    showConfirmation({
      title: 'Export Blogs Data',
      message: 'Are you sure you want to export the blogs data?',
      type: 'warning',
      onConfirm: () => {
        console.log("Exporting data...")
        // Add your export logic here
      },
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Blogs</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your blog posts</p>

        <div className="flex justify-between items-center mt-8">
          <Button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-[#153147] hover:bg-[#153147]/90 text-white px-4 py-2 rounded-md flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Add Blog
          </Button>

          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              onClick={handleExport} 
              disabled={filteredBlogs.length === 0}
              className="flex items-center gap-2 text-gray-700 hover:bg-gray-100"
            >
              <Download className="h-5 w-5" />
              Export
            </Button>
            <Button 
              onClick={handleDelete} 
              disabled={selectedBlogs.length === 0}
              className="bg-red-50 text-red-600 hover:bg-red-100 flex items-center gap-2"
              variant="ghost"
            >
              <Trash className="h-5 w-5" />
              Delete
            </Button>
            <div className="relative">
              <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <Input
                type="text"
                placeholder="Search blogs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-[300px] bg-white rounded-md border-[#ADB8BB] focus:border-[#153147] focus:ring-1 focus:ring-[#153147] transition-all duration-200"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {filteredBlogs.map((blog) => (
          <div 
            key={blog.id}
            className="group relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300 border-2 border-[#153147]"
          >
            {/* Checkbox for selection */}
            <div className="absolute top-3 left-3 z-10">
              <Checkbox
                checked={selectedBlogs.includes(blog.id)}
                onCheckedChange={() => handleSelectBlog(blog.id)}
                className="data-[state=checked]:bg-[#153147] data-[state=checked]:border-[#153147]"
                aria-label={`Select ${blog.title}`}
              />
            </div>

            <div className="p-5">
              {/* Header */}
              <div className="flex justify-between items-start">
                <div className="pl-7">
                  <h3 className="text-base font-semibold text-[#153147] group-hover:text-[#232A2F] transition-colors line-clamp-1">
                    {blog.title}
                  </h3>
                  <Badge 
                    variant="outline" 
                    className="mt-1.5 text-xs bg-green-50 text-green-700 border-green-200"
                  >
                    {blog.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-[#153147] hover:text-[#153147] hover:bg-[#153147]/5 rounded-lg"
                    onClick={() => handleView(blog)}
                    title="View Details"
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-[#153147] hover:text-[#153147] hover:bg-[#153147]/5 rounded-lg"
                    onClick={() => handleEdit(blog)}
                    title="Edit Blog"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg"
                    onClick={() => handleDeleteSingle(blog)}
                    title="Delete Blog"
                  >
                    <Trash className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {/* Author and Category Info */}
              <div className="mt-4 pl-7 space-y-2">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-[#F9F8F7] flex items-center justify-center">
                    <User className="h-3.5 w-3.5 text-[#153147]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#153147] truncate">{blog.author}</p>
                    <p className="text-xs text-[#232A2F]">{blog.category}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-[#F9F8F7] flex items-center justify-center">
                    <Calendar className="h-3.5 w-3.5 text-[#153147]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-[#232A2F]">
                      {new Date(blog.publishDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="mt-4 pl-7">
                <div className="flex flex-wrap gap-2">
                  {blog.tags.map((tag, index) => {
                    const tagColors = [
                      "bg-blue-50 text-blue-700 border-blue-200",
                      "bg-purple-50 text-purple-700 border-purple-200",
                      "bg-pink-50 text-pink-700 border-pink-200",
                      "bg-orange-50 text-orange-700 border-orange-200",
                      "bg-teal-50 text-teal-700 border-teal-200"
                    ];
                    const colorIndex = index % tagColors.length;
                    return (
                      <Badge
                        key={index}
                        variant="outline"
                        className={`text-xs ${tagColors[colorIndex]}`}
                      >
                        {tag}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Selection overlay */}
            {selectedBlogs.includes(blog.id) && (
              <div className="absolute inset-0 bg-[#153147]/5 pointer-events-none" />
            )}
          </div>
        ))}
      </div>

      <ViewBlogModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false)
          setSelectedBlog(null)
        }}
        blog={selectedBlog}
      />
      <EditBlogModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedBlog(null)
        }}
        onSuccess={handleEditSuccess}
        blog={selectedBlog}
      />
      <AddBlogModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleAddSuccess}
      />
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={() => setConfirmationModal({ ...confirmationModal, isOpen: false })}
        title={confirmationModal.title}
        message={confirmationModal.message}
        onConfirm={confirmationModal.onConfirm}
        type={confirmationModal.type}
        confirmText={confirmationModal.confirmText}
      />
    </div>
  )
} 