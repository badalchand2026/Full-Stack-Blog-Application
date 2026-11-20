import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Toaster } from "react-hot-toast";

import { AuthProvider } from "./context/AuthContext";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import BlogDetails from "./pages/BlogDetails";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";
import AllBlogs from "./pages/AllBlogs";

function AppLayout() {
    const { pathname } = useLocation();
    const isAdminPage = pathname.startsWith("/admin");

    return (
        <div className="min-h-screen flex flex-col">
            {!isAdminPage && <Navbar />}

            <main className="flex-1">
                <Routes>
                    {/* Public routes */}
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/blogs/:slug" element={<BlogDetails />} />
                    <Route path="/blogs" element={<AllBlogs />} />

                    {/* Normal user routes */}
                    <Route element={<ProtectedRoute allowedRole="USER" />}>
                        <Route path="/dashboard" element={<UserDashboard />} />
                    </Route>

                    {/* Admin-only routes */}
                    <Route element={<ProtectedRoute allowedRole="ADMIN" />}>
                        <Route path="/admin/dashboard" element={<AdminDashboard />} />
                    </Route>

                    {/* Not found */}
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </main>

            {!isAdminPage && <Footer />}
        </div>
    );
}

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <AppLayout />

                <ToastContainer position="bottom-right" autoClose={3000} theme="colored" />
                <Toaster position="top-right" />
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;