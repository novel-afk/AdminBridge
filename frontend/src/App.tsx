import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AdminDashboard from './pages/admin/Dashboard';
import BranchList from './pages/admin/BranchList';
import AddBranch from './pages/admin/AddBranch';
import EditBranch from './pages/admin/EditBranch';
import EmployeeList from './pages/admin/EmployeeList';
import AddEmployee from './pages/admin/AddEmployee';
import EditEmployee from './pages/admin/EditEmployee';
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
        
        {/* Default routes */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
