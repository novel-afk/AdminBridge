import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { UserRole } from './ProtectedRoute';

interface RoleRouteProps {
  role: UserRole;
  component: React.ReactNode;
}

/**
 * Route component that only renders content if the user has the specified role
 */
const RoleRoute = ({
  role, 
  component
}: RoleRouteProps) => {
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
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user doesn't have required role, redirect to their appropriate dashboard
  if (user.role !== role) {
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

  // If user has the required role, render the component
  return <>{component}</>;
};

export default RoleRoute;