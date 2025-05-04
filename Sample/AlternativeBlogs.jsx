import { useState } from "react"
import { Search, Eye, Calendar, User, Tag, Clock, Hash } from "lucide-react"
import { Link } from 'react-router-dom';
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Badge } from "../components/ui/badge"
import ViewBlogModal from "../components/ViewBlogModal"
import SharedHeader from "../components/SharedHeader"

// Reuse the blogs data from the original Blog page
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

export default function AlternativeBlogs() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedBlog, setSelectedBlog] = useState(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)

  const handleView = (blog) => {
    setSelectedBlog(blog)
    setIsViewModalOpen(true)
  }

  const filteredBlogs = blogs.filter((blog) =>
    Object.values(blog).some((value) => 
      value.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
      (Array.isArray(value) && value.some(v => v.toString().toLowerCase().includes(searchQuery.toLowerCase())))
    )
  )

  return (
    <div className="min-h-screen bg-[#F9F8F7]">
      <SharedHeader />

      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-[#153147]">Blog Posts</h2>
          <p className="text-[#232A2F] mt-2">Explore our latest articles</p>

          <div className="flex justify-end items-center mt-8">
            <div className="relative">
              <Search className="h-5 w-5 text-[#ADB8BB] absolute left-3 top-1/2 transform -translate-y-1/2" />
              <Input
                type="text"
                placeholder="Search blogs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-[300px] bg-white rounded-lg border-[#ADB8BB] focus:border-[#153147] focus:ring-1 focus:ring-[#153147]"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBlogs.map((blog) => (
            <div 
              key={blog.id}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-200 border border-[#EDEAE4] group"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-[#153147] group-hover:text-[#232A2F] transition-colors">
                    {blog.title}
                  </h3>
                  <p className="text-[#ADB8BB] mt-1">{blog.category}</p>
                </div>
                <Badge 
                  variant="outline" 
                  className="bg-green-50 text-green-700 border-green-200"
                >
                  {blog.status}
                </Badge>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-[#232A2F]">
                  <User className="h-4 w-4 text-[#ADB8BB]" />
                  <span>{blog.author}</span>
                </div>
                <div className="flex items-center gap-2 text-[#232A2F]">
                  <Calendar className="h-4 w-4 text-[#ADB8BB]" />
                  <span>
                    {new Date(blog.publishDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex flex-wrap gap-2">
                  {blog.tags.map((tag, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="bg-[#153147]/5 text-[#153147] border-[#153147]/20"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#EDEAE4] flex justify-end">
                <Button
                  variant="default"
                  size="sm"
                  className="bg-[#153147] hover:bg-[#232A2F] text-white"
                  onClick={() => handleView(blog)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Read Article
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <ViewBlogModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false)
          setSelectedBlog(null)
        }}
        blog={selectedBlog}
      />
    </div>
  )
} 