import { useState } from "react"
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
import { ImagePlus, X } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select"

export default function AddBlogModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    author: "",
    status: "Published",
    content: "",
    tags: "",
    publishDate: new Date().toISOString().split('T')[0],
    picture: null,
    picturePreview: null,
  })

  const [errors, setErrors] = useState({})

  const handleClose = () => {
    setFormData({
      title: "",
      category: "",
      author: "",
      status: "Published",
      content: "",
      tags: "",
      publishDate: new Date().toISOString().split('T')[0],
      picture: null,
      picturePreview: null,
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
    if (!formData.picture) newErrors.picture = "Blog picture is required"

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    // Convert tags string to array
    const processedData = {
      ...formData,
      tags: formData.tags.split(",").map(tag => tag.trim()).filter(tag => tag),
    }

    // Here you would typically make an API call to create the blog
    console.log("Creating new blog:", processedData)
    onSuccess()
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when field is edited
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const handlePictureChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          picture: file,
          picturePreview: reader.result
        }))
      }
      reader.readAsDataURL(file)
    }
    if (errors.picture) {
      setErrors(prev => ({ ...prev, picture: undefined }))
    }
  }

  const handleRemovePicture = () => {
    setFormData(prev => ({
      ...prev,
      picture: null,
      picturePreview: null
    }))
  }

  const RequiredLabel = ({ children }) => (
    <div className="flex items-center gap-1">
      {children}
      <span className="text-red-500">*</span>
    </div>
  )

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Add New Blog</DialogTitle>
          <p className="text-sm text-gray-500 mt-2">Fields marked with <span className="text-red-500">*</span> are mandatory</p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-4">
            {/* Blog Picture */}
            <div className="space-y-2">
              <RequiredLabel>
                <Label>Blog Picture</Label>
              </RequiredLabel>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg relative">
                {formData.picturePreview ? (
                  <div className="relative w-full">
                    <img
                      src={formData.picturePreview}
                      alt="Blog preview"
                      className="mx-auto max-h-64 rounded-lg object-cover"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8 bg-white/80 hover:bg-white text-gray-600"
                      onClick={handleRemovePicture}
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-1 text-center">
                    <div className="mx-auto h-12 w-12 text-gray-400">
                      <ImagePlus className="mx-auto h-12 w-12" />
                    </div>
                    <div className="flex text-sm text-gray-600">
                      <label className="relative cursor-pointer rounded-md bg-white font-medium text-[#1e1b4b] focus-within:outline-none focus-within:ring-2 focus-within:ring-[#1e1b4b] focus-within:ring-offset-2 hover:text-[#1e1b4b]/80">
                        <span>Upload a file</span>
                        <input
                          type="file"
                          className="sr-only"
                          accept="image/*"
                          onChange={handlePictureChange}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                  </div>
                )}
              </div>
              {errors.picture && <p className="text-sm text-red-500">{errors.picture}</p>}
            </div>

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
                placeholder="Enter blog title"
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
                placeholder="Enter blog category"
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
                placeholder="Enter author name"
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
                placeholder="Write your blog content here..."
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
              Create Blog
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 