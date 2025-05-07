import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog"
import { Button } from "./ui/button"
import { AlertTriangle, CheckCircle, XCircle } from "lucide-react"

export default function ConfirmationModal({ 
  isOpen, 
  onClose, 
  title, 
  message, 
  onConfirm, 
  type = "success", 
  confirmText = "Confirm" 
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {type === "success" && <CheckCircle className="h-5 w-5 text-green-500" />}
            {type === "warning" && <AlertTriangle className="h-5 w-5 text-amber-500" />}
            {type === "danger" && <XCircle className="h-5 w-5 text-red-500" />}
            {title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <p className="text-sm text-gray-600">{message}</p>
        </div>
        
        <div className="flex justify-end gap-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button 
            type="button" 
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`
              ${type === "success" ? "bg-green-600 hover:bg-green-700" : ""}
              ${type === "warning" ? "bg-amber-600 hover:bg-amber-700" : ""}
              ${type === "danger" ? "bg-red-600 hover:bg-red-700" : ""}
              ${!["success", "warning", "danger"].includes(type) ? "bg-[#1e1b4b] hover:bg-[#1e1b4b]/90" : ""}
            `}
          >
            {confirmText}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 