
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ allowedRole }) {
    const { user, isAuthenticated } = useAuth();
    const location = useLocation();

    // User must log in first.
    if (!isAuthenticated) {
        return (
            <Navigate
                to="/login"
                replace
                state={{ from: location }}
            />
        );
    }

    // Check whether the user has the required role.
    if (allowedRole && user?.role !== allowedRole) {
        return (
            <Navigate
                to={user?.role === "ADMIN" ? "/admin/dashboard" : "/dashboard"}
                replace
            />
        );
    }

    return <Outlet />;
}

export default ProtectedRoute;
