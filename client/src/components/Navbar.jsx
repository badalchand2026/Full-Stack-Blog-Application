
import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import {
    Menu,
    X,
    BookOpen,
    ArrowRight,
    LayoutDashboard,
    LogOut,
    UserRound,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);

    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();

    const navClass = ({ isActive }) =>
        `text-sm font-medium transition-colors ${
            isActive
                ? "text-indigo-600"
                : "text-gray-600 hover:text-indigo-600"
        }`;

    const dashboardPath =
        user?.role === "ADMIN"
            ? "/admin/dashboard"
            : "/dashboard";

    const handleLogout = async () => {
        try {
            setLoggingOut(true);
            await logout();

            setMenuOpen(false);
            toast.success("Logged out successfully!");
            navigate("/");
        } catch {
            toast.error("Something went wrong while logging out.");
        } finally {
            setLoggingOut(false);
        }
    };

    const closeMenu = () => setMenuOpen(false);

    return (
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100">
            <nav className="container-app h-20 flex items-center justify-between">

                {/* Logo */}
                <Link
                    to="/"
                    onClick={closeMenu}
                    className="flex items-center gap-2"
                >
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                        <BookOpen className="text-white" size={22} />
                    </div>

                    <span className="text-2xl font-extrabold tracking-tight text-gray-900">
                        Blog<span className="text-indigo-600">App.</span>
                    </span>
                </Link>

                {/* Desktop Navigation */}


                {/* Desktop Authentication */}
                <div className="hidden md:flex items-center gap-5">

                    {isAuthenticated ? (
                        <>
                            <div className="flex items-center gap-2">
                                <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                                    <UserRound size={19} />
                                </div>

                                <span className="text-sm font-semibold text-gray-700 max-w-32 truncate">
                                    {user?.full_name || user?.email || "User"}
                                </span>
                            </div>

                            <Link
                                to={dashboardPath}
                                className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-indigo-600"
                            >
                                <LayoutDashboard size={17} />
                                Dashboard
                            </Link>

                            <button
                                onClick={handleLogout}
                                disabled={loggingOut}
                                className="flex items-center gap-2 bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-60"
                            >
                                <LogOut size={17} />
                                {loggingOut ? "Logging out..." : "Logout"}
                            </button>
                        </>
                    ) : (
                        <>
                            <Link
                                to="/login"
                                className="text-sm font-semibold text-gray-700 hover:text-indigo-600"
                            >
                                Login
                            </Link>

                            <Link
                                to="/register"
                                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-indigo-100"
                            >
                                Get Started
                                <ArrowRight size={16} />
                            </Link>
                        </>
                    )}

                </div>

                {/* Mobile Menu Button */}
                <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="md:hidden p-2 rounded-lg hover:bg-gray-100"
                    aria-label="Toggle navigation menu"
                >
                    {menuOpen ? <X size={25} /> : <Menu size={25} />}
                </button>
            </nav>

            {/* Mobile Navigation */}
            {menuOpen && (
                <div className="md:hidden bg-white border-t border-gray-100 px-6 py-5 space-y-5">

                    <NavLink
                        onClick={closeMenu}
                        to="/"
                        className="block text-gray-700 font-medium"
                    >
                        Home
                    </NavLink>

                    <a
                        onClick={closeMenu}
                        href="/#articles"
                        className="block text-gray-700 font-medium"
                    >
                        Articles
                    </a>

                    <a
                        onClick={closeMenu}
                        href="/#categories"
                        className="block text-gray-700 font-medium"
                    >
                        Categories
                    </a>

                    <a
                        onClick={closeMenu}
                        href="/#about"
                        className="block text-gray-700 font-medium"
                    >
                        About
                    </a>

                    {isAuthenticated ? (
                        <div className="border-t border-gray-100 pt-5 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                                    <UserRound size={20} />
                                </div>

                                <div>
                                    <p className="font-semibold text-gray-900">
                                        {user?.full_name || "User"}
                                    </p>

                                    <p className="text-xs text-gray-500">
                                        {user?.email}
                                    </p>
                                </div>
                            </div>

                            <Link
                                onClick={closeMenu}
                                to={dashboardPath}
                                className="flex items-center gap-2 text-gray-700 font-semibold"
                            >
                                <LayoutDashboard size={18} />
                                Dashboard
                            </Link>

                            <button
                                onClick={handleLogout}
                                disabled={loggingOut}
                                className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 py-3 rounded-xl font-semibold disabled:opacity-60"
                            >
                                <LogOut size={18} />
                                {loggingOut ? "Logging out..." : "Logout"}
                            </button>
                        </div>
                    ) : (
                        <div className="flex gap-3 pt-3 border-t border-gray-100">
                            <Link
                                onClick={closeMenu}
                                to="/login"
                                className="flex-1 text-center py-3 border rounded-xl font-semibold"
                            >
                                Login
                            </Link>

                            <Link
                                onClick={closeMenu}
                                to="/register"
                                className="flex-1 text-center py-3 bg-indigo-600 text-white rounded-xl font-semibold"
                            >
                                Register
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </header>
    );
}

export default Navbar;
