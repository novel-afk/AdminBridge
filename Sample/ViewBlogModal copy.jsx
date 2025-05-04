import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog"
import { Badge } from "./ui/badge"
import { CalendarDays, User, BookOpen, Tag, Clock, Hash } from "lucide-react"

export default function ViewBlogModal({ isOpen, onClose, blog }) {
  if (!blog) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Blog Picture */}
        <div className="relative w-full h-[300px] -mt-6 -mx-6 mb-4">
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-transparent z-10" />
          <img
            src={blog.picture || "https://images.unsplash.com/photo-1432821596592-e2c18b78144f?q=80&w=2070"}
            alt={blog.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-4 left-6 right-6 z-20">
            <h1 className="text-3xl font-bold text-white mb-2">{blog.title}</h1>
            <div className="flex items-center gap-2">
              <Badge 
                variant="outline" 
                className={
                  blog.status === 'Published' 
                    ? 'bg-[#1e1b4b]/90 text-white border-[#1e1b4b]/20'
                    : 'bg-yellow-500/90 text-white border-yellow-200/20'
                }
              >
                {blog.status}
              </Badge>
              <Badge variant="outline" className="bg-white/90 text-gray-800 border-white/20">
                {blog.category}
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6 mt-8">
          {/* Left Column - Metadata */}
          <div className="space-y-6">
            {/* Author Info */}
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[#1e1b4b]/5 flex items-center justify-center">
                <User className="h-5 w-5 text-[#1e1b4b]" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Author</p>
                <p className="text-base font-medium text-gray-900">{blog.author}</p>
              </div>
            </div>

            {/* Publish Date */}
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[#1e1b4b]/5 flex items-center justify-center">
                <CalendarDays className="h-5 w-5 text-[#1e1b4b]" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Published Date</p>
                <p className="text-base font-medium text-gray-900">
                  {new Date(blog.publishDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>

            {/* Reading Time (estimated) */}
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[#1e1b4b]/5 flex items-center justify-center">
                <Clock className="h-5 w-5 text-[#1e1b4b]" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Reading Time</p>
                <p className="text-base font-medium text-gray-900">
                  {Math.max(1, Math.ceil(blog.content.split(' ').length / 200))} min read
                </p>
              </div>
            </div>

            {/* Category */}
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[#1e1b4b]/5 flex items-center justify-center">
                <Hash className="h-5 w-5 text-[#1e1b4b]" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Category</p>
                <p className="text-base font-medium text-gray-900">{blog.category}</p>
              </div>
            </div>

            {/* Tags */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Tag className="h-5 w-5 text-[#1e1b4b]" />
                <p className="text-sm text-gray-500">Tags</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {blog.tags.map((tag, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="bg-[#1e1b4b]/5 text-[#1e1b4b] border-[#1e1b4b]/20"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Content */}
          <div className="col-span-2 prose prose-lg max-w-none">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="h-5 w-5 text-[#1e1b4b]" />
              <h2 className="text-xl font-semibold text-gray-900 m-0">Content</h2>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                {blog.content}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 