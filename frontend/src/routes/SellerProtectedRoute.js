import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import Loader from "../components/Layout/Loader";

// Single-vendor: the store dashboard is available only to the business owner.
const SellerProtectedRoute = ({ children }) => {
  const { loading, isAuthenticated, user } = useSelector((state) => state.user);
  const { seller, isLoading: sellerLoading } = useSelector(
    (state) => state.seller
  );

  if (loading || loading === undefined) {
    return <Loader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== "business_owner") {
    return <Navigate to="/" replace />;
  }

  // Owner is authenticated but the store document hasn't finished loading yet.
  if (!seller?._id) {
    return sellerLoading === false ? <Navigate to="/" replace /> : <Loader />;
  }

  return children;
};

export default SellerProtectedRoute;
