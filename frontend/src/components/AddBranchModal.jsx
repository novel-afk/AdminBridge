import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import axios from "axios"
import { useAuth } from "../lib/AuthContext"

export default function AddBranchModal({ isOpen, onClose, onSuccess }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    city: "",
    country: "",
    address: ""
  })

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Check if user is admin
  const isAdmin = user?.role === 'SuperAdmin';

  // Reset form fields when modal is opened
  useEffect(() => {
    if (isOpen) {
      setFormData({
        id: "",
        name: "",
        city: "",
        country: "",
        address: ""
      });
    }
  }, [isOpen]);

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.name.trim()) newErrors.name = "Branch name is required"
    if (!formData.city.trim()) newErrors.city = "City is required"
    if (!formData.country.trim()) newErrors.country = "Country is required"
    if (!formData.address.trim()) newErrors.address = "Address is required"
    
    // Add error if user is not admin
    if (!isAdmin) {
      newErrors.submit = "Only administrators can create branches"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      const accessToken = localStorage.getItem("access_token")
      if (!accessToken) {
        throw new Error("You must be logged in to perform this action")
      }

      // Prepare data for the API - exclude id for new branch creation
      const apiData = {
        name: formData.name,
        city: formData.city,
        country: formData.country,
        address: formData.address
      }

      await axios.post(
        "http://localhost:8000/api/branches/", 
        apiData,
        { 
          headers: { 
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json"
          } 
        }
      )
      
      // Call onSuccess to refresh the branch list
      onSuccess()
    } catch (error) {
      console.error("Error adding branch:", error)
      // Show error message
      setErrors({ submit: error.response?.data?.detail || "Failed to add branch. Please try again." })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setFormData({
      id: "",
      name: "",
      city: "",
      country: "",
      address: ""
    })
    setErrors({})
    onClose()
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }))
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Branch</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {/* Hidden field for branch ID */}
          <input type="hidden" name="id" value={formData.id} />
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Branch Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => handleChange("city", e.target.value)}
                className={errors.city ? "border-red-500" : ""}
              />
              {errors.city && <p className="text-sm text-red-500">{errors.city}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) => handleChange("country", e.target.value)}
                className={errors.country ? "border-red-500" : ""}
              />
              {errors.country && <p className="text-sm text-red-500">{errors.country}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleChange("address", e.target.value)}
                className={errors.address ? "border-red-500" : ""}
              />
              {errors.address && <p className="text-sm text-red-500">{errors.address}</p>}
            </div>
          </div>

          {errors.submit && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {errors.submit}
            </div>
          )}

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-[#1e1b4b] hover:bg-[#1e1b4b]/90" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Branch"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 