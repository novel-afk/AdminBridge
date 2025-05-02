import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import AddLead from './pages/admin/AddLead';
import EditLead from './pages/admin/EditLead';
import ViewLead from './pages/admin/ViewLead';
import JobList from './pages/admin/JobList';
import AddJob from './pages/admin/AddJob';
import EditJob from './pages/admin/EditJob';
import ViewJob from './pages/admin/ViewJob';
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Admin routes */}
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
        <Route path="/admin/leads/add" element={<AddLead />} />
        <Route path="/admin/leads/edit/:id" element={<EditLead />} />
        <Route path="/admin/leads/view/:id" element={<ViewLead />} />
        
        {/* Job management */}
        <Route path="/admin/jobs" element={<JobList />} />
        <Route path="/admin/jobs/add" element={<AddJob />} />
        <Route path="/admin/jobs/edit/:id" element={<EditJob />} />
        <Route path="/admin/jobs/view/:id" element={<ViewJob />} />
        
        {/* Role-based dashboards */}
        <Route path="/branch-manager/dashboard" element={<BranchManagerDashboard />} />
        <Route path="/counsellor/dashboard" element={<CounsellorDashboard />} />
        <Route path="/receptionist/dashboard" element={<ReceptionistDashboard />} />
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/bank-manager/dashboard" element={<BankManagerDashboard />} />
        
        {/* Default routes */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
