import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select"

export default function EditBlogModal({ isOpen, onClose, onSuccess, blog }) {
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    author: "",
    status: "Published",
    content: "",
    tags: "",
    publishDate: "",
  })

  const [errors, setErrors] = useState({})

  // Update form data when blog prop changes
  useEffect(() => {
    if (blog && isOpen) {
      setFormData({
        ...blog,
        tags: Array.isArray(blog.tags) ? blog.tags.join(", ") : blog.tags,
      })
    }
  }, [blog, isOpen])

  const handleClose = () => {
    setFormData({
      title: "",
      category: "",
      author: "",
      status: "Published",
      content: "",
      tags: "",
      publishDate: "",
    })
    setErrors({})
    onClose()
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Basic validation
    const newErrors = {}
    if (!formData.title.trim()) newErrors.title = "Title is required"
    if (!formData.category.trim()) newErrors.category = "Category is required"
    if (!formData.author.trim()) newErrors.author = "Author is required"
    if (!formData.content.trim()) newErrors.content = "Content is required"
    if (!formData.tags.trim()) newErrors.tags = "At least one tag is required"

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    // Convert tags string back to array
    const processedData = {
      ...formData,
      tags: formData.tags.split(",").map(tag => tag.trim()).filter(tag => tag),
    }

    // Here you would typically make an API call to update the blog
    console.log("Updating blog:", processedData)
    onSuccess()
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when field is edited
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const RequiredLabel = ({ children }) => (
    <div className="flex items-center gap-1">
      {children}
      <span className="text-red-500">*</span>
    </div>
  )

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Edit Blog</DialogTitle>
          <p className="text-sm text-gray-500 mt-2">Fields marked with <span className="text-red-500">*</span> are mandatory</p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-4">
            {/* Title */}
            <div className="space-y-2">
              <RequiredLabel>
                <Label htmlFor="title">Blog Title</Label>
              </RequiredLabel>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleChange("title", e.target.value)}
                className={errors.title ? "border-red-500" : ""}
              />
              {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
            </div>

            {/* Category */}
            <div className="space-y-2">
              <RequiredLabel>
                <Label htmlFor="category">Category</Label>
              </RequiredLabel>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => handleChange("category", e.target.value)}
                className={errors.category ? "border-red-500" : ""}
              />
              {errors.category && <p className="text-sm text-red-500">{errors.category}</p>}
            </div>

            {/* Author */}
            <div className="space-y-2">
              <RequiredLabel>
                <Label htmlFor="author">Author</Label>
              </RequiredLabel>
              <Input
                id="author"
                value={formData.author}
                onChange={(e) => handleChange("author", e.target.value)}
                className={errors.author ? "border-red-500" : ""}
              />
              {errors.author && <p className="text-sm text-red-500">{errors.author}</p>}
            </div>

            {/* Content */}
            <div className="space-y-2">
              <RequiredLabel>
                <Label htmlFor="content">Content</Label>
              </RequiredLabel>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => handleChange("content", e.target.value)}
                className={`min-h-[200px] ${errors.content ? "border-red-500" : ""}`}
              />
              {errors.content && <p className="text-sm text-red-500">{errors.content}</p>}
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <RequiredLabel>
                <Label htmlFor="tags">Tags (comma-separated)</Label>
              </RequiredLabel>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => handleChange("tags", e.target.value)}
                className={errors.tags ? "border-red-500" : ""}
                placeholder="e.g., React, JavaScript, Frontend"
              />
              {errors.tags && <p className="text-sm text-red-500">{errors.tags}</p>}
            </div>

            {/* Published Date - Read Only */}
            <div className="space-y-2">
              <Label htmlFor="publishDate">Published Date</Label>
              <Input
                id="publishDate"
                value={new Date(formData.publishDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
                disabled
                className="bg-gray-50"
              />
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#1e1b4b] hover:bg-[#1e1b4b]/90 text-white"
            >
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 