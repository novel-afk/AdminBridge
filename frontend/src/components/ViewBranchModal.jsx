import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog"
import { Button } from "./ui/button"
import { Building2 } from "lucide-react"

export default function ViewBranchModal({ isOpen, onClose, branch }) {
  if (!branch) return null

  const fields = [
    { label: "Branch Name", value: branch.name },
    { label: "City", value: branch.city },
    { label: "Country", value: branch.country },
    { label: "Address", value: branch.address }
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Branch Details</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {/* Branch Icon Section */}
          <div className="flex flex-col items-center mb-6 pb-6 border-b border-gray-200">
            <div className="w-full h-full flex items-center justify-center">
              <Building2 className="w-20 h-20 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">{branch.name}</h2>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            {fields.map((field, index) => (
              !["Branch Name"].includes(field.label) && (
                <div key={index} className="col-span-2">
                  <h3 className="font-medium text-sm text-gray-500">{field.label}</h3>
                  <div className="mt-1">
                    <p className="text-sm text-gray-900">{field.value}</p>
                  </div>
                </div>
              )
            ))}
          </div>

          <div className="flex justify-end mt-6">
            <Button onClick={onClose} variant="outline">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 