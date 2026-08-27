import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

// Single-vendor: admin capabilities belong to the business owner.
const ProtectedAdminRoute = ({ children }) => {
  const { loading, isAuthenticated, user } = useSelector((state) => state.user);
  if (loading === false) {
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    } else if (user.role !== "business_owner") {
      return <Navigate to="/" replace />;
    }
    return children;
  }
  return null;
};

export default ProtectedAdminRoute;
