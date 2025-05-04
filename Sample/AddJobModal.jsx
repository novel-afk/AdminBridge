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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select"

export default function AddJobModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    title: "",
    status: "Open",
    location: "",
    experience: "",
    branch: "",
    salary: "",
    type: "Full-time",
    description: "",
    requirements: "",
  })

  const [errors, setErrors] = useState({})

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Basic validation
    const newErrors = {}
    if (!formData.title.trim()) newErrors.title = "Job Title is required"
    if (!formData.status) newErrors.status = "Status is required"
    if (!formData.location.trim()) newErrors.location = "Location is required"
    if (!formData.experience.trim()) newErrors.experience = "Required Experience is required"
    if (!formData.branch.trim()) newErrors.branch = "Branch is required"
    if (!formData.salary.trim()) newErrors.salary = "Salary Range is required"
    if (!formData.type) newErrors.type = "Job Type is required"
    if (!formData.description.trim()) newErrors.description = "Job Description is required"
    if (!formData.requirements.trim()) newErrors.requirements = "Job Requirements is required"

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    // Add current date to the form data
    const jobData = {
      ...formData,
      postedDate: new Date().toISOString().split('T')[0],
    }

    // Here you would typically make an API call to create the job
    console.log("Creating job:", jobData)
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Add New Job</DialogTitle>
          <p className="text-sm text-gray-500 mt-2">All fields are mandatory</p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Job Title */}
            <div className="space-y-2">
              <RequiredLabel>
                <Label htmlFor="title">Job Title</Label>
              </RequiredLabel>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleChange("title", e.target.value)}
                className={errors.title ? "border-red-500" : ""}
                placeholder="e.g., Senior Software Engineer"
              />
              {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
            </div>

            {/* Status */}
            <div className="space-y-2">
              <RequiredLabel>
                <Label htmlFor="status">Status</Label>
              </RequiredLabel>
              <Select value={formData.status} onValueChange={(value) => handleChange("status", value)}>
                <SelectTrigger className={errors.status ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Open">Open</SelectItem>
                  <SelectItem value="Closed">Closed</SelectItem>
                  <SelectItem value="Draft">Draft</SelectItem>
                </SelectContent>
              </Select>
              {errors.status && <p className="text-sm text-red-500">{errors.status}</p>}
            </div>

            {/* Location */}
            <div className="space-y-2">
              <RequiredLabel>
                <Label htmlFor="location">Location</Label>
              </RequiredLabel>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleChange("location", e.target.value)}
                className={errors.location ? "border-red-500" : ""}
                placeholder="e.g., New York, USA"
              />
              {errors.location && <p className="text-sm text-red-500">{errors.location}</p>}
            </div>

            {/* Required Experience */}
            <div className="space-y-2">
              <RequiredLabel>
                <Label htmlFor="experience">Required Experience</Label>
              </RequiredLabel>
              <Input
                id="experience"
                value={formData.experience}
                onChange={(e) => handleChange("experience", e.target.value)}
                className={errors.experience ? "border-red-500" : ""}
                placeholder="e.g., 3-5 years"
              />
              {errors.experience && <p className="text-sm text-red-500">{errors.experience}</p>}
            </div>

            {/* Branch */}
            <div className="space-y-2">
              <RequiredLabel>
                <Label htmlFor="branch">Branch</Label>
              </RequiredLabel>
              <Input
                id="branch"
                value={formData.branch}
                onChange={(e) => handleChange("branch", e.target.value)}
                className={errors.branch ? "border-red-500" : ""}
                placeholder="e.g., Main Branch"
              />
              {errors.branch && <p className="text-sm text-red-500">{errors.branch}</p>}
            </div>

            {/* Salary Range */}
            <div className="space-y-2">
              <RequiredLabel>
                <Label htmlFor="salary">Salary Range</Label>
              </RequiredLabel>
              <Input
                id="salary"
                value={formData.salary}
                onChange={(e) => handleChange("salary", e.target.value)}
                className={errors.salary ? "border-red-500" : ""}
                placeholder="e.g., $80,000 - $100,000"
              />
              {errors.salary && <p className="text-sm text-red-500">{errors.salary}</p>}
            </div>

            {/* Job Type */}
            <div className="space-y-2 col-span-2">
              <RequiredLabel>
                <Label htmlFor="type">Job Type</Label>
              </RequiredLabel>
              <Select value={formData.type} onValueChange={(value) => handleChange("type", value)}>
                <SelectTrigger className={errors.type ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select job type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Full-time">Full-time</SelectItem>
                  <SelectItem value="Part-time">Part-time</SelectItem>
                  <SelectItem value="Contract">Contract</SelectItem>
                  <SelectItem value="Internship">Internship</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && <p className="text-sm text-red-500">{errors.type}</p>}
            </div>

            {/* Job Description */}
            <div className="space-y-2 col-span-2">
              <RequiredLabel>
                <Label htmlFor="description">Job Description</Label>
              </RequiredLabel>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.description ? "border-red-500" : "border-input"
                } min-h-[100px]`}
                placeholder="Enter detailed job description..."
              />
              {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
            </div>

            {/* Job Requirements */}
            <div className="space-y-2 col-span-2">
              <RequiredLabel>
                <Label htmlFor="requirements">Job Requirements</Label>
              </RequiredLabel>
              <textarea
                id="requirements"
                value={formData.requirements}
                onChange={(e) => handleChange("requirements", e.target.value)}
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.requirements ? "border-red-500" : "border-input"
                } min-h-[100px]`}
                placeholder="Enter job requirements..."
              />
              {errors.requirements && <p className="text-sm text-red-500">{errors.requirements}</p>}
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-[#1e1b4b] hover:bg-[#1e1b4b]/90 text-white">
              Create Job
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 