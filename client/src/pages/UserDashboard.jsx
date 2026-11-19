
import { useAuth } from "../context/AuthContext";
import { BookOpen, PenLine } from "lucide-react";
import { Link } from "react-router-dom";

function UserDashboard() {
    const { user } = useAuth();

    return (
        <section className="min-h-screen bg-slate-50 py-12">
            <div className="container-app">

                <div className="mb-10">
                    <p className="text-indigo-600 font-semibold text-sm">
                        YOUR DASHBOARD
                    </p>

                    <h1 className="text-3xl font-extrabold text-gray-900 mt-2">
                        Welcome, {user?.full_name || "User"}!
                    </h1>

                    <p className="text-gray-500 mt-2">
                        Manage your account and explore the BlogApp community.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="surface-card p-7">
                        <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                            <BookOpen size={24} />
                        </div>

                        <h2 className="text-xl font-bold text-gray-900 mt-5">
                            Explore Articles
                        </h2>

                        <p className="text-gray-500 text-sm mt-2">
                            Discover interesting articles and learn from the community.
                        </p>

                        <Link
                            to="/#articles"
                            className="inline-flex items-center text-indigo-600 font-semibold mt-5"
                        >
                            Read articles
                        </Link>
                    </div>

                    <div className="surface-card p-7">
                        <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                            <PenLine size={24} />
                        </div>

                        <h2 className="text-xl font-bold text-gray-900 mt-5">
                            Start Writing
                        </h2>

                        <p className="text-gray-500 text-sm mt-2">
                            Your space to share ideas and publish your own stories.
                        </p>

                        <p className="text-sm text-gray-400 mt-5">
                            Article publishing will be added in a later step.
                        </p>
                    </div>
                </div>

            </div>
        </section>
    );
}

export default UserDashboard;
