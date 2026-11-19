
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
import { Toaster } from "react-hot-toast";



function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <div className="min-h-screen flex flex-col">
                    <Navbar />

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
                                <Route
                                    path="/dashboard"
                                    element={<UserDashboard />}
                                />
                            </Route>

                            {/* Admin-only routes */}
                            <Route element={<ProtectedRoute allowedRole="ADMIN" />}>
                                <Route
                                    path="/admin/dashboard"
                                    element={<AdminDashboard />}
                                />
                            </Route>

                            {/* Not found */}
                            <Route path="*" element={<NotFound />} />
                        </Routes>
                    </main>

                    <Footer />
                </div>

                <ToastContainer
                    position="bottom-right"
                    autoClose={3000}
                    theme="colored"
                />
                <Toaster position="top-right" />
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
