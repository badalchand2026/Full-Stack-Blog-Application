
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
    BookOpen,
    Mail,
    LockKeyhole,
    Eye,
    EyeOff,
    ArrowRight,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            setLoading(true);

            const loggedInUser = await login(
                formData.email,
                formData.password
            );

            toast.success("Login successful!");

            if (loggedInUser.role === "ADMIN") {
                navigate("/admin/dashboard");
            } else {
                navigate("/");
            }
        } catch (error) {
            const errorData = error.response?.data;

            const message =
                errorData?.detail ||
                errorData?.message ||
                "Login failed. Please check your email and password.";

            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="min-h-[80vh] flex items-center justify-center py-16 px-4 bg-slate-50">
            <div className="w-full max-w-md">

                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center gap-2">
                        <div className="w-11 h-11 rounded-xl bg-indigo-600 flex items-center justify-center">
                            <BookOpen size={23} className="text-white" />
                        </div>

                        <span className="text-2xl font-extrabold text-gray-900">
                            Blog<span className="text-indigo-600">App.</span>
                        </span>
                    </Link>

                    <h1 className="text-3xl font-extrabold text-gray-900 mt-7">
                        Welcome back
                    </h1>

                    <p className="text-gray-500 mt-2">
                        Sign in to continue exploring great stories.
                    </p>
                </div>

                <div className="bg-white border border-gray-100 rounded-2xl shadow-xl shadow-gray-200/50 p-7 sm:p-9">
                    <form onSubmit={handleSubmit} className="space-y-5">

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Email address
                            </label>

                            <div className="relative">
                                <Mail
                                    size={19}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                                />

                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Enter your email"
                                    className="input-field pl-12"
                                    required
                                    autoComplete="email"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Password
                            </label>

                            <div className="relative">
                                <LockKeyhole
                                    size={19}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                                />

                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Enter your password"
                                    className="input-field pl-12 pr-12"
                                    required
                                    autoComplete="current-password"
                                />

                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600"
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? (
                                        <EyeOff size={19} />
                                    ) : (
                                        <Eye size={19} />
                                    )}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-primary py-3.5 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {loading ? "Signing in..." : "Sign in"}

                            {!loading && <ArrowRight size={18} />}
                        </button>
                    </form>

                    <div className="relative my-7">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200" />
                        </div>

                        <div className="relative flex justify-center">
                            <span className="bg-white px-4 text-sm text-gray-400">
                                New to BlogApp?
                            </span>
                        </div>
                    </div>

                    <Link
                        to="/register"
                        className="w-full inline-flex justify-center items-center border border-gray-200 rounded-xl py-3 font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        Create an account
                    </Link>
                </div>

                <p className="text-center text-xs text-gray-400 mt-7">
                    By continuing, you agree to use BlogApp responsibly.
                </p>
            </div>
        </section>
    );
}

export default Login;
