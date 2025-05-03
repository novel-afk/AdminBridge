import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './lib/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import AdminDashboard from './pages/admin/Dashboard';
import BranchManagerDashboard from './pages/branch-manager/Dashboard';
import CounsellorDashboard from './pages/counsellor/Dashboard';
import ReceptionistDashboard from './pages/receptionist/Dashboard';
import StudentDashboard from './pages/student/Dashboard';
import BankManagerDashboard from './pages/bank-manager/Dashboard';
import BranchList from './pages/admin/BranchList';
import AddBranch from './pages/admin/AddBranch';
import EditBranch from './pages/admin/EditBranch';
import EmployeeList from './pages/admin/EmployeeList';
import AddEmployee from './pages/admin/AddEmployee';
import EditEmployee from './pages/admin/EditEmployee';
import StudentList from './pages/admin/StudentList';
import AddStudent from './pages/admin/AddStudent';
import EditStudent from './pages/admin/EditStudent';
import ViewStudent from './pages/admin/ViewStudent';
import LeadList from './pages/admin/LeadList';
import BranchManagerLeadList from './pages/branch-manager/LeadList';
import BranchManagerEmployeeList from './pages/branch-manager/EmployeeList';
import BranchManagerStudentList from './pages/branch-manager/StudentList';
import BranchManagerJobPage from './pages/branch-manager/JobPage';
import JobPage from './pages/admin/JobPage';
import Profile from './pages/Profile';
import './App.css'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public route */}
          <Route path="/login" element={<Login />} />
          
          {/* Super Admin Routes */}
          <Route 
            element={
              <ProtectedRoute allowedRoles={['SuperAdmin']} />
            }
          >
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            
            {/* Branch management */}
            <Route path="/admin/branches" element={<BranchList />} />
            <Route path="/admin/branches/add" element={<AddBranch />} />
            <Route path="/admin/branches/edit/:id" element={<EditBranch />} />
            
            {/* Employee management */}
            <Route path="/admin/employees" element={<EmployeeList />} />
            <Route path="/admin/employees/add" element={<AddEmployee />} />
            <Route path="/admin/employees/edit/:id" element={<EditEmployee />} />
            
            {/* Student management */}
            <Route path="/admin/students" element={<StudentList />} />
            <Route path="/admin/students/add" element={<AddStudent />} />
            <Route path="/admin/students/edit/:id" element={<EditStudent />} />
            <Route path="/admin/students/view/:id" element={<ViewStudent />} />
            
            {/* Lead management */}
            <Route path="/admin/leads" element={<LeadList />} />
            
            {/* Job management */}
            <Route path="/admin/jobs" element={<JobPage />} />
          </Route>
          
          {/* Branch Manager Routes */}
          <Route 
            element={
              <ProtectedRoute allowedRoles={['BranchManager']} />
            }
          >
            <Route path="/branch-manager/dashboard" element={<BranchManagerDashboard />} />
            
            {/* Branch manager can manage employees in their branch */}
            <Route path="/branch-manager/employees" element={<BranchManagerEmployeeList />} />
            <Route path="/branch-manager/employees/add" element={<AddEmployee />} />
            <Route path="/branch-manager/employees/edit/:id" element={<EditEmployee />} />
            
            {/* Branch manager can manage students in their branch */}
            <Route path="/branch-manager/students" element={<BranchManagerStudentList />} />
            <Route path="/branch-manager/students/add" element={<AddStudent />} />
            <Route path="/branch-manager/students/edit/:id" element={<EditStudent />} />
            <Route path="/branch-manager/students/view/:id" element={<ViewStudent />} />
            
            {/* Branch manager can see and create leads */}
            <Route path="/branch-manager/leads" element={<BranchManagerLeadList />} />
            
            {/* Branch manager can manage jobs in their branch */}
            <Route path="/branch-manager/jobs" element={<BranchManagerJobPage />} />
          </Route>
          
          {/* Counsellor Routes */}
          <Route 
            element={
              <ProtectedRoute allowedRoles={['Counsellor']} />
            }
          >
            <Route path="/counsellor/dashboard" element={<CounsellorDashboard />} />
          </Route>
          
          {/* Receptionist Routes */}
          <Route 
            element={
              <ProtectedRoute allowedRoles={['Receptionist']} />
            }
          >
            <Route path="/receptionist/dashboard" element={<ReceptionistDashboard />} />
          </Route>
          
          {/* Student Routes */}
          <Route 
            element={
              <ProtectedRoute allowedRoles={['Student']} />
            }
          >
            <Route path="/student/dashboard" element={<StudentDashboard />} />
          </Route>
          
          {/* Bank Manager Routes */}
          <Route 
            element={
              <ProtectedRoute allowedRoles={['BankManager']} />
            }
          >
            <Route path="/bank-manager/dashboard" element={<BankManagerDashboard />} />
          </Route>
          
          {/* Shared Routes */}
          <Route 
            element={
              <ProtectedRoute allowedRoles={['SuperAdmin', 'BranchManager', 'Counsellor', 'Receptionist', 'Student', 'BankManager']} />
            }
          >
            <Route path="/profile" element={<Profile />} />
          </Route>
          
          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
