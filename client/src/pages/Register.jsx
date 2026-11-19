
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
    BookOpen,
    UserRound,
    Mail,
    LockKeyhole,
    Eye,
    EyeOff,
    ArrowRight,
} from "lucide-react";

import api from "../services/api";

function Register() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        full_name: "",
        email: "",
        password: "",
        confirm_password: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

        if (formData.password !== formData.confirm_password) {
            toast.error("Passwords do not match.");
            return;
        }

        try {
            setLoading(true);

            await api.post("/auth/register/", formData);

            toast.success("Account created successfully!");

            navigate("/login");
        } catch (error) {
            const errorData = error.response?.data;

            let message = "Registration failed. Please try again.";

            if (errorData) {
                if (typeof errorData === "string") {
                    message = errorData;
                } else if (errorData.detail || errorData.message) {
                    message = errorData.detail || errorData.message;
                } else {
                    message = Object.entries(errorData)
                        .map(([field, errors]) => {
                            const errorMessage = Array.isArray(errors)
                                ? errors.join(", ")
                                : String(errors);

                            return `${field.replaceAll("_", " ")}: ${errorMessage}`;
                        })
                        .join(" | ");
                }
            }

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
                        Create your account
                    </h1>

                    <p className="text-gray-500 mt-2">
                        Join our community and start sharing your ideas.
                    </p>
                </div>

                <div className="bg-white border border-gray-100 rounded-2xl shadow-xl shadow-gray-200/50 p-7 sm:p-9">
                    <form onSubmit={handleSubmit} className="space-y-5">

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Full name
                            </label>

                            <div className="relative">
                                <UserRound
                                    size={19}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                                />

                                <input
                                    type="text"
                                    name="full_name"
                                    value={formData.full_name}
                                    onChange={handleChange}
                                    placeholder="Enter your full name"
                                    className="input-field pl-12"
                                    required
                                    autoComplete="name"
                                />
                            </div>
                        </div>

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
                                    placeholder="Create a password"
                                    className="input-field pl-12 pr-12"
                                    required
                                    autoComplete="new-password"
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

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Confirm password
                            </label>

                            <div className="relative">
                                <LockKeyhole
                                    size={19}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                                />

                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    name="confirm_password"
                                    value={formData.confirm_password}
                                    onChange={handleChange}
                                    placeholder="Confirm your password"
                                    className="input-field pl-12 pr-12"
                                    required
                                    autoComplete="new-password"
                                />

                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600"
                                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                                >
                                    {showConfirmPassword ? (
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
                            {loading ? "Creating account..." : "Create account"}

                            {!loading && <ArrowRight size={18} />}
                        </button>
                    </form>

                    <div className="relative my-7">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200" />
                        </div>

                        <div className="relative flex justify-center">
                            <span className="bg-white px-4 text-sm text-gray-400">
                                Already have an account?
                            </span>
                        </div>
                    </div>

                    <Link
                        to="/login"
                        className="w-full inline-flex justify-center items-center border border-gray-200 rounded-xl py-3 font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        Sign in
                    </Link>
                </div>

                <p className="text-center text-xs text-gray-400 mt-7">
                    Join BlogApp and share your ideas with the community.
                </p>
            </div>
        </section>
    );
}

export default Register;
