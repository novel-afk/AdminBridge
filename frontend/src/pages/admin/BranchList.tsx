import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Plus, 
  Search, 
  Download, 
  Trash, 
  Eye, 
  Pencil, 
  MapPin,
  XCircle
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Checkbox } from "../../components/ui/checkbox";
import { Badge } from "../../components/ui/badge";
import ConfirmationModal from "../../components/ConfirmationModal";
import ViewBranchModal from "../../components/ViewBranchModal";
import EditBranchModal from "../../components/EditBranchModal";
import AddBranchModal from "../../components/AddBranchModal";

interface Branch {
  id: number;
  name: string;
  country: string;
  city: string;
  address: string;
}

const BranchList = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBranches, setSelectedBranches] = useState<number[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const navigate = useNavigate();

  // Confirmation modal states
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    type: "success" as "success" | "warning" | "danger",
    confirmText: "Confirm"
  });

  const showConfirmation = (config: Partial<typeof confirmationModal>) => {
    setConfirmationModal({
      ...confirmationModal,
      isOpen: true,
      ...config,
    });
  };

  useEffect(() => {
    // Check if user is logged in
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      navigate('/login');
      return;
    }

    // Fetch branches from API
    const fetchBranches = async () => {
      try {
        setLoading(true);
        
        const response = await axios.get('http://localhost:8000/api/branches/', {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        
        // Use branches data directly from API
        setBranches(response.data);
        setLoading(false);
      } catch (err: any) {
        setError('Failed to fetch branches');
        setLoading(false);
        console.error('Error fetching branches:', err);
      }
    };

    fetchBranches();
  }, [navigate]);

  const filteredBranches = branches.filter((branch) =>
    Object.values(branch).some((value) => 
      value && typeof value === "string" && 
      value.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const handleSelectBranch = (id: number) => {
    setSelectedBranches((prev) => {
      if (prev.includes(id)) {
        return prev.filter((branchId) => branchId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedBranches(filteredBranches.map((branch) => branch.id));
    } else {
      setSelectedBranches([]);
    }
  };

  const handleDeleteBranches = () => {
    showConfirmation({
      title: "Delete Selected Branches",
      message: `Are you sure you want to delete ${selectedBranches.length} selected branch(es)? This action cannot be undone.`,
      type: "danger",
      confirmText: "Delete",
      onConfirm: async () => {
        const accessToken = localStorage.getItem("access_token");
        let hasError = false;
        let errorMessages = [];
        
        try {
          // Delete each selected branch
          for (const id of selectedBranches) {
            try {
              await axios.delete(`http://localhost:8000/api/branches/${id}/`, {
                headers: { Authorization: `Bearer ${accessToken}` }
              });
            } catch (err) {
              hasError = true;
              if (axios.isAxiosError(err) && err.response?.data?.detail) {
                errorMessages.push(`Branch #${id}: ${err.response.data.detail}`);
              } else {
                errorMessages.push(`Branch #${id}: Unknown error occurred.`);
              }
            }
          }
          
          // Refresh branch list
          const response = await axios.get('http://localhost:8000/api/branches/', {
            headers: { Authorization: `Bearer ${accessToken}` }
          });
          setBranches(response.data);
          setSelectedBranches([]);
          
          // Show errors if any occurred
          if (hasError) {
            setError(errorMessages.join('\n'));
          }
        } catch (err) {
          console.error("Error deleting branches:", err);
          setError("Failed to delete branches. Please try again.");
        }
      },
    });
  };

  const handleDeleteSingle = (branch: Branch) => {
    showConfirmation({
      title: "Delete Branch",
      message: `Are you sure you want to delete ${branch.name}? This action cannot be undone.`,
      type: "danger",
      confirmText: "Delete",
      onConfirm: async () => {
        const accessToken = localStorage.getItem("access_token");
        
        try {
          await axios.delete(`http://localhost:8000/api/branches/${branch.id}/`, {
            headers: { Authorization: `Bearer ${accessToken}` }
          });
          
          // Remove the deleted branch from state
          setBranches(branches.filter(b => b.id !== branch.id));
        } catch (err) {
          console.error("Error deleting branch:", err);
          // Check if error is due to branch having associated users
          if (axios.isAxiosError(err) && err.response?.data?.detail) {
            setError(err.response.data.detail);
          } else {
            setError("Failed to delete branch. Please try again.");
          }
        }
      },
    });
  };

  const handleView = (branch: Branch) => {
    setSelectedBranch(branch);
    setIsViewModalOpen(true);
  };

  const handleEdit = (branch: Branch) => {
    setSelectedBranch(branch);
    setIsEditModalOpen(true);
  };

  const handleEditSuccess = () => {
    setIsEditModalOpen(false);
    setSelectedBranch(null);
    
    // Refresh branches data
    const accessToken = localStorage.getItem("access_token");
    if (accessToken) {
      axios.get("http://localhost:8000/api/branches/", {
        headers: { Authorization: `Bearer ${accessToken}` }
      })
      .then(response => {
        setBranches(response.data);
      })
      .catch(err => {
        console.error("Error refreshing branches:", err);
      });
    }
  };

  const handleAddSuccess = () => {
    setIsAddModalOpen(false);
    
    // Refresh branches data
    const accessToken = localStorage.getItem("access_token");
    if (accessToken) {
      axios.get("http://localhost:8000/api/branches/", {
        headers: { Authorization: `Bearer ${accessToken}` }
      })
      .then(response => {
        setBranches(response.data);
      })
      .catch(err => {
        console.error("Error refreshing branches:", err);
      });
    }
  };

  const handleExport = () => {
    showConfirmation({
      title: "Export Branches Data",
      message: "Are you sure you want to export the branches data?",
      type: "warning",
      confirmText: "Export",
      onConfirm: () => {
        console.log("Exporting data...");
        // Export logic to be implemented
        
        // Simple CSV export
        const headers = ["ID", "Name", "City", "Country", "Address"];
        const csvContent = 
          headers.join(",") + 
          "\n" + 
          filteredBranches.map(branch => 
            [
              branch.id,
              branch.name,
              branch.city, 
              branch.country,
              `"${branch.address}"` // Quotes to handle commas in address
            ].join(",")
          ).join("\n");
        
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "branches.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      },
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex justify-center items-center">
        <div className="bg-white rounded-lg shadow-md p-8 flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1e1b4b] mb-4"></div>
          <div className="text-xl text-gray-600">Loading branches...</div>
          <p className="text-sm text-gray-500 mt-2">Please wait while we fetch the data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Branches</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your branch information</p>

        <div className="flex justify-between items-center mt-8">
          <Button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-[#1e1b4b] hover:bg-[#1e1b4b]/90 text-white px-4 py-2 rounded-md flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Add Branch
          </Button>

          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              onClick={handleExport} 
              disabled={filteredBranches.length === 0}
              className="flex items-center gap-2 text-gray-700 hover:bg-gray-100"
            >
              <Download className="h-5 w-5" />
              Export
            </Button>
            <Button 
              onClick={handleDeleteBranches} 
              disabled={selectedBranches.length === 0}
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
                placeholder="Search branches..."
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                className="pl-10 w-[300px] bg-white rounded-md border-gray-300 focus:border-[#1e1b4b] focus:ring-1 focus:ring-[#1e1b4b] transition-all duration-200"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Display error messages */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <div className="whitespace-pre-line">{error}</div>
          <button
            onClick={() => setError('')}
            className="ml-auto text-red-500 hover:text-red-700"
          >
            <XCircle className="h-5 w-5" />
          </button>
        </div>
      )}

      {branches.length === 0 ? (
        <div className="flex-1 flex justify-center items-center">
          <div className="bg-white rounded-lg shadow-md p-8 flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-[#1e1b4b]/10 flex items-center justify-center mb-4">
              <MapPin className="h-8 w-8 text-[#1e1b4b]" />
            </div>
            <p className="text-gray-600 mb-4 text-lg">No branches found.</p>
            <p className="text-gray-500 mb-6">Start by adding your first branch to the system.</p>
            <Button 
              onClick={() => setIsAddModalOpen(true)} 
              className="bg-[#1e1b4b] hover:bg-[#1e1b4b]/90"
            >
              Add Your First Branch
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {filteredBranches.map((branch) => (
            <div 
              key={branch.id}
              className="group relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300"
            >
              {/* Checkbox for selection */}
              <div className="absolute top-3 left-3 z-10">
                <Checkbox
                  checked={selectedBranches.includes(branch.id)}
                  onCheckedChange={() => handleSelectBranch(branch.id)}
                  className="data-[state=checked]:bg-[#1e1b4b] data-[state=checked]:border-[#1e1b4b]"
                  aria-label={`Select ${branch.name}`}
                />
              </div>

              {/* Colored border around the entire card */}
              <div className="absolute inset-0 rounded-xl pointer-events-none border-2 border-[#1e1b4b]/30 group-hover:border-[#1e1b4b]/60 transition-colors" />
              
              {/* Left side accent */}
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#1e1b4b]/50 group-hover:bg-[#1e1b4b] transition-colors" />
              
              {/* Top accent */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#1e1b4b]/50 group-hover:bg-[#1e1b4b] transition-colors" />

              <div className="p-5">
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div className="pl-7">
                    <h3 className="text-base font-semibold text-gray-900 group-hover:text-[#1e1b4b] transition-colors line-clamp-1">
                      {branch.name}
                    </h3>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-[#1e1b4b] hover:text-[#1e1b4b] hover:bg-[#1e1b4b]/5 rounded-lg"
                      onClick={() => handleView(branch)}
                      title="View Details"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-[#1e1b4b] hover:text-[#1e1b4b] hover:bg-[#1e1b4b]/5 rounded-lg"
                      onClick={() => handleEdit(branch)}
                      title="Edit Branch"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg"
                      onClick={() => handleDeleteSingle(branch)}
                      title="Delete Branch"
                    >
                      <Trash className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Location Info */}
                <div className="mt-4 pl-7">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-[#1e1b4b]/5 flex items-center justify-center">
                      <MapPin className="h-3.5 w-3.5 text-[#1e1b4b]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{branch.city}, {branch.country}</p>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{branch.address}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Selection overlay */}
              {selectedBranches.includes(branch.id) && (
                <div className="absolute inset-0 bg-[#1e1b4b]/5 pointer-events-none" />
              )}
            </div>
          ))}
        </div>
      )}

      <ViewBranchModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedBranch(null);
        }}
        branch={selectedBranch}
      />
      
      <EditBranchModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedBranch(null);
        }}
        onSuccess={handleEditSuccess}
        branch={selectedBranch}
      />
      
      <AddBranchModal
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
  );
};

export default BranchList; 