import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import Layout from './Layout';

// Define the role type that matches our backend roles
export type UserRole = 'SuperAdmin' | 'BranchManager' | 'Counsellor' | 'Receptionist' | 'BankManager' | 'Student';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
  redirectTo?: string;
}

/**
 * ProtectedRoute component that checks if user is authenticated
 * and has one of the allowed roles before rendering children
 */
const ProtectedRoute = ({ 
  allowedRoles = [], 
  redirectTo = '/login' 
}: ProtectedRouteProps) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Show loading indicator
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated || !user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // If roles are specified and user doesn't have required role, redirect based on user role
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role as UserRole)) {
    // Redirect to the dashboard page based on user's role
    const roleToRoute = {
      SuperAdmin: '/admin/dashboard',
      BranchManager: '/branch-manager/dashboard',
      Counsellor: '/counsellor/dashboard',
      Receptionist: '/receptionist/dashboard',
      BankManager: '/bank-manager/dashboard',
      Student: '/student/dashboard'
    };

    return <Navigate to={roleToRoute[user.role as UserRole] || '/login'} replace />;
  }

  // If authenticated and has required role, render children within Layout
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
};

export default ProtectedRoute; 