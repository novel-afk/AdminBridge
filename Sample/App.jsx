import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Leads from './pages/Leads';
import Login from './pages/Login';
import Employees from './pages/Employees';
import Branch from './pages/Branch';
import Job from './pages/Job';
import Blog from './pages/Blog';
import JobResponse from './pages/JobResponse';
import AlternativeHome from './components/AlternativeHome';
import AlternativeJobs from './pages/AlternativeJobs';
import AlternativeBlogs from './pages/AlternativeBlogs';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Layout><Dashboard /></Layout>} />
        <Route path="/home2" element={<AlternativeHome />} />
        <Route path="/home2/jobs" element={<AlternativeJobs />} />
        <Route path="/home2/blogs" element={<AlternativeBlogs />} />
        <Route path="/students" element={<Layout><Students /></Layout>} />
        <Route path="/leads" element={<Layout><Leads /></Layout>} />
        <Route path="/employees" element={<Layout><Employees /></Layout>} />
        <Route path="/branch" element={<Layout><Branch /></Layout>} />
        <Route path="/jobs" element={<Layout><Job /></Layout>} />
        <Route path="/blogs" element={<Layout><Blog /></Layout>} />
        <Route path="/job-responses" element={<Layout><JobResponse /></Layout>} />
      </Routes>
    </Router>
  );
}

export default App; 