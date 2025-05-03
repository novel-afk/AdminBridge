import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
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
import Layout from './components/Layout';
import './App.css'

// Layout wrapper component
const AdminLayout = () => {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        
        {/* Admin routes with layout */}
        <Route element={<AdminLayout />}>
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
        </Route>
        
        {/* Role-based dashboards with layout */}
        <Route element={<AdminLayout />}>
          <Route path="/branch-manager/dashboard" element={<BranchManagerDashboard />} />
          <Route path="/counsellor/dashboard" element={<CounsellorDashboard />} />
          <Route path="/receptionist/dashboard" element={<ReceptionistDashboard />} />
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/bank-manager/dashboard" element={<BankManagerDashboard />} />
        </Route>
        
        {/* Default routes */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
