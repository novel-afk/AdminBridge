import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './lib/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
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
import AddLead from './pages/admin/AddLead';
import EditLead from './pages/admin/EditLead';
import BlogList from './pages/admin/BlogList';
import BranchManagerLeadList from './pages/branch-manager/LeadList';
import BranchManagerEmployeeList from './pages/branch-manager/EmployeeList';
import BranchManagerStudentList from './pages/branch-manager/StudentList';
import BranchManagerJobPage from './pages/branch-manager/JobPage';
import BranchManagerBlogList from './pages/branch-manager/BlogList';
import CounsellorStudentList from './pages/counsellor/StudentList';
import CounsellorLeadList from './pages/counsellor/LeadList';
import CounsellorEmployeeList from './pages/counsellor/EmployeeList';
import CounsellorAddLead from './pages/counsellor/AddLead';
import CounsellorAddStudent from './pages/counsellor/AddStudent';
import ReceptionistStudentList from './pages/receptionist/StudentList';
import ReceptionistLeadList from './pages/receptionist/LeadList';
import ReceptionistAddLead from './pages/receptionist/AddLead';
import ReceptionistEmployeeList from './pages/receptionist/EmployeeList';
import JobPage from './pages/admin/JobPage';
import JobResponsePage from './pages/admin/JobResponsePage';
import AttendancePage from './pages/admin/Attendance';
import Profile from './pages/Profile';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import ViewLead from './pages/admin/ViewLead';
import ViewEmployee from './pages/admin/ViewEmployee';

// Student pages
import StudentJobs from './pages/student/Jobs';
import StudentBlogs from './pages/student/Blogs';
import StudentProfile from './pages/student/Profile';
import StudentJobDetail from './pages/student/JobDetail';
import StudentBlogDetail from './pages/student/BlogDetail';
import JobApplications from './pages/student/JobApplications';

import './App.css'
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <AuthProvider>
        <Router>
          <ToastContainer
            position="top-center"
            autoClose={4000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="dark"
          />
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:id" element={<BlogPost />} />
            
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
              
              {/* Job Applications */}
              <Route path="/admin/job-responses" element={<JobResponsePage />} />
              
              {/* Blog management */}
              <Route path="/admin/blogs" element={<BlogList />} />
              
              {/* Attendance management */}
              <Route path="/admin/attendance" element={<AttendancePage />} />
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
              
              {/* Branch manager can manage job applications in their branch */}
              <Route path="/branch-manager/job-responses" element={<JobResponsePage />} />
              
              {/* Branch manager can manage blogs in their branch */}
              <Route path="/branch-manager/blogs" element={<BranchManagerBlogList />} />
            </Route>
            
            {/* Counsellor Routes */}
            <Route 
              element={
                <ProtectedRoute allowedRoles={['Counsellor']} />
              }
            >
              <Route path="/counsellor/dashboard" element={<CounsellorDashboard />} />
              
              {/* Counsellor can manage students in their branch */}
              <Route path="/counsellor/students" element={<CounsellorStudentList />} />
              <Route path="/counsellor/add-student" element={<CounsellorAddStudent />} />
              <Route path="/counsellor/edit-student/:id" element={<EditStudent />} />
              <Route path="/counsellor/students/view/:id" element={<ViewStudent />} />
              
              {/* Counsellor can manage leads in their branch */}
              <Route path="/counsellor/leads" element={<CounsellorLeadList />} />
              <Route path="/counsellor/add-lead" element={<CounsellorAddLead />} />
              <Route path="/counsellor/edit-lead/:id" element={<EditLead />} />
              <Route path="/counsellor/leads/:id" element={<ViewLead />} />
              
              {/* Counsellor can view employees in their branch */}
              <Route path="/counsellor/employees" element={<CounsellorEmployeeList />} />
              <Route path="/counsellor/employees/view/:id" element={<ViewEmployee />} />
            </Route>
            
            {/* Receptionist Routes */}
            <Route 
              element={
                <ProtectedRoute allowedRoles={['Receptionist']} />
              }
            >
              <Route path="/receptionist/dashboard" element={<ReceptionistDashboard />} />
              
              {/* Receptionist can view students in their branch */}
              <Route path="/receptionist/students" element={<ReceptionistStudentList />} />
              <Route path="/receptionist/students/view/:id" element={<ViewStudent />} />
              
              {/* Receptionist can create and view leads in their branch */}
              <Route path="/receptionist/leads" element={<ReceptionistLeadList />} />
              <Route path="/receptionist/add-lead" element={<ReceptionistAddLead />} />
              <Route path="/receptionist/leads/view/:id" element={<ViewLead />} />
              
              {/* Receptionist can view employees in their branch */}
              <Route path="/receptionist/employees" element={<ReceptionistEmployeeList />} />
              <Route path="/receptionist/employees/view/:id" element={<ViewEmployee />} />
            </Route>
            
            {/* Student Routes */}
            <Route 
              element={
                <ProtectedRoute allowedRoles={['Student']} />
              }
            >
              <Route path="/student/dashboard" element={<StudentDashboard />} />
              <Route path="/student/jobs" element={<StudentJobs />} />
              <Route path="/student/jobs/:id" element={<StudentJobDetail />} />
              <Route path="/student/applications" element={<JobApplications />} />
              <Route path="/student/blogs" element={<StudentBlogs />} />
              <Route path="/student/blogs/:id" element={<StudentBlogDetail />} />
              <Route path="/student/profile" element={<StudentProfile />} />
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
                <ProtectedRoute allowedRoles={['SuperAdmin', 'BranchManager', 'Counsellor', 'Receptionist', 'BankManager']} />
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
    </>
  );
}

export default App;
