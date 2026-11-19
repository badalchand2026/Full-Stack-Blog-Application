
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { AuthProvider } from "./context/AuthContext";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import BlogDetails from "./pages/BlogDetails";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";
import UserDashboard from "./pages/UserDashboard";

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <div className="min-h-screen flex flex-col">
                    <Navbar />

                    <main className="flex-1">
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/blogs/:slug" element={<BlogDetails />} />
                            <Route path="/admin/dashboard" element={<AdminDashboard />} />
                            <Route path="*" element={<NotFound />} />
                            <Route path="/dashboard" element={<UserDashboard />} />
                        </Routes>
                    </main>

                    <Footer />
                </div>

                <ToastContainer
                    position="top-right"
                    autoClose={3000}
                    theme="colored"
                />
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
