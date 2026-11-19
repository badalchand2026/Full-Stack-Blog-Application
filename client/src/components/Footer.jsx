
import { Link } from "react-router-dom";
import {
    BookOpen,
    Globe,
    Mail,
    MessageCircle,
    ArrowRight,
} from "lucide-react";

function Footer() {
    const socialIcons = [Globe, Mail, MessageCircle];

    return (
        <footer className="bg-gray-950 text-gray-300">
            <div className="container-app pt-16 pb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 pb-12 border-b border-gray-800">
                    <div>
                        <Link to="/" className="flex items-center gap-2 text-white">
                            <div className="bg-indigo-600 p-2 rounded-lg">
                                <BookOpen size={21} />
                            </div>
                            <span className="text-2xl font-bold">
                                Blog<span className="text-indigo-400">App.</span>
                            </span>
                        </Link>

                        <p className="text-gray-400 text-sm leading-7 mt-5 max-w-xs">
                            Discover new perspectives, share your ideas,
                            and explore stories that inspire you.
                        </p>

                        <div className="flex gap-4 mt-6">
                            {socialIcons.map((Icon, index) => (
                                <a
                                    key={index}
                                    href="/"
                                    aria-label="Social link"
                                    className="p-2 bg-gray-900 rounded-lg hover:bg-indigo-600 transition"
                                >
                                    <Icon size={18} />
                                </a>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-white font-bold mb-5">Explore</h3>
                        <div className="space-y-3 text-sm text-gray-400">
                            <Link className="block hover:text-white" to="/">Home</Link>
                            <a className="block hover:text-white" href="/#articles">Articles</a>
                            <a className="block hover:text-white" href="/#categories">Categories</a>
                            <a className="block hover:text-white" href="/#about">About Us</a>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-white font-bold mb-5">Account</h3>
                        <div className="space-y-3 text-sm text-gray-400">
                            <Link className="block hover:text-white" to="/login">Login</Link>
                            <Link className="block hover:text-white" to="/register">Create Account</Link>
                            <Link className="block hover:text-white" to="/admin/dashboard">Dashboard</Link>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-white font-bold mb-5">Stay Updated</h3>
                        <p className="text-sm text-gray-400 leading-6 mb-5">
                            Explore fresh ideas and interesting stories from our community.
                        </p>
                        <a
                            href="/#articles"
                            className="inline-flex items-center gap-2 text-indigo-400 font-semibold text-sm hover:text-indigo-300"
                        >
                            Explore Articles <ArrowRight size={16} />
                        </a>
                    </div>
                </div>

                <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
                    <p>© {new Date().getFullYear()} BlogApp. All rights reserved.</p>
                    <p>Designed for curious minds.</p>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
