import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog"
import { Badge } from "./ui/badge"
import { CalendarDays, Briefcase, MapPin, Building2, DollarSign, GraduationCap, FileText, ClipboardList } from "lucide-react"

export default function ViewJobModal({ isOpen, onClose, job }) {
  if (!job) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{job.title}</DialogTitle>
          <div className="flex items-center gap-2 mt-2">
            <Badge 
              variant="outline" 
              className={
                job.status === 'Open' 
                  ? 'bg-[#1e1b4b]/5 text-[#1e1b4b] border-[#1e1b4b]/20'
                  : job.status === 'Draft'
                  ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                  : 'bg-red-50 text-red-700 border-red-200'
              }
            >
              {job.status}
            </Badge>
            <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
              {job.type}
            </Badge>
          </div>
        </DialogHeader>

        <div className="mt-6 space-y-6">
          {/* Branch */}
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[#1e1b4b]/5 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-[#1e1b4b]" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Branch</p>
              <p className="text-base font-medium text-gray-900">{job.branch}</p>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[#1e1b4b]/5 flex items-center justify-center">
              <MapPin className="h-5 w-5 text-[#1e1b4b]" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Location</p>
              <p className="text-base font-medium text-gray-900">{job.location}</p>
            </div>
          </div>

          {/* Required Experience */}
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[#1e1b4b]/5 flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-[#1e1b4b]" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Required Experience</p>
              <p className="text-base font-medium text-gray-900">{job.experience}</p>
            </div>
          </div>

          {/* Salary Range */}
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[#1e1b4b]/5 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-[#1e1b4b]" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Salary Range</p>
              <p className="text-base font-medium text-gray-900">{job.salary}</p>
            </div>
          </div>

          {/* Job Description */}
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[#1e1b4b]/5 flex items-center justify-center">
              <FileText className="h-5 w-5 text-[#1e1b4b]" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Job Description</p>
              <p className="text-base text-gray-900 mt-1 whitespace-pre-wrap">{job.description}</p>
            </div>
          </div>

          {/* Job Requirements */}
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[#1e1b4b]/5 flex items-center justify-center">
              <ClipboardList className="h-5 w-5 text-[#1e1b4b]" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Job Requirements</p>
              <p className="text-base text-gray-900 mt-1 whitespace-pre-wrap">{job.requirements}</p>
            </div>
          </div>

          {/* Posted Date */}
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[#1e1b4b]/5 flex items-center justify-center">
              <CalendarDays className="h-5 w-5 text-[#1e1b4b]" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Posted Date</p>
              <p className="text-base font-medium text-gray-900">
                {new Date(job.postedDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 