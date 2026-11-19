
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { ArrowRight, Search, CalendarDays, LoaderCircle } from "lucide-react";

import api from "../services/api";

function AllBlogs() {
    const [blogs, setBlogs] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const response = await api.get("/blogs/");

                // Support both normal and paginated DRF responses.
                const data = response.data;
                const blogList = Array.isArray(data)
                    ? data
                    : data.results || [];

                setBlogs(blogList);
            } catch (error) {
                console.error("Failed to fetch blogs:", error);
                toast.error("Unable to load articles. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchBlogs();
    }, []);

    const filteredBlogs = useMemo(() => {
        return blogs.filter((blog) =>
            blog.title?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [blogs, searchTerm]);

    const formatDate = (date) => {
        if (!date) return "Recently published";

        return new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    return (
        <div className="bg-white min-h-screen">
            {/* Page Header */}
            <section className="bg-slate-50 border-b border-slate-100">
                <div className="container-app py-20 md:py-28">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600 mb-5">
                        The Blog
                    </p>

                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900 max-w-3xl leading-tight">
                        Ideas, stories and insights worth reading.
                    </h1>

                    <p className="mt-6 text-gray-500 text-lg max-w-2xl leading-relaxed">
                        Explore articles, learn something new, and discover
                        fresh perspectives from our community.
                    </p>
                </div>
            </section>

            {/* Articles Section */}
            <section className="container-app py-16 md:py-20">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                            All Articles
                        </h2>
                        <p className="text-gray-500 mt-2">
                            {blogs.length} articles available
                        </p>
                    </div>

                    {/* Search */}
                    <div className="relative w-full md:max-w-sm">
                        <Search
                            size={20}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                        />

                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(event) =>
                                setSearchTerm(event.target.value)
                            }
                            placeholder="Search articles..."
                            className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 bg-white outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition"
                        />
                    </div>
                </div>

                {/* Loading */}
                {loading ? (
                    <div className="flex justify-center items-center py-28">
                        <LoaderCircle
                            size={36}
                            className="animate-spin text-indigo-600"
                        />
                    </div>
                ) : filteredBlogs.length === 0 ? (
                    /* Empty State */
                    <div className="text-center py-24 border border-dashed border-gray-200 rounded-2xl">
                        <h3 className="text-xl font-semibold text-gray-900">
                            No articles found
                        </h3>

                        <p className="text-gray-500 mt-2">
                            {searchTerm
                                ? "Try searching with a different title."
                                : "There are no published articles yet."}
                        </p>
                    </div>
                ) : (
                    /* Blog Cards */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredBlogs.map((blog) => (
                            <article
                                key={blog.id}
                                className="group rounded-2xl overflow-hidden border border-gray-100 bg-white hover:shadow-xl hover:shadow-gray-200/60 transition duration-300"
                            >
                                <Link
                                    to={`/blogs/${blog.slug}`}
                                    className="block overflow-hidden aspect-[16/10] bg-slate-100"
                                >
                                    {blog.featured_image ? (
                                        <img
                                            src={blog.featured_image}
                                            alt={blog.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                            No image available
                                        </div>
                                    )}
                                </Link>

                                <div className="p-6">
                                    <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                                        <CalendarDays size={15} />
                                        <span>
                                            {formatDate(
                                                blog.published_at ||
                                                blog.created_at
                                            )}
                                        </span>
                                    </div>

                                    <Link to={`/blogs/${blog.slug}`}>
                                        <h3 className="text-xl font-bold text-gray-900 leading-snug group-hover:text-indigo-600 transition line-clamp-2">
                                            {blog.title}
                                        </h3>
                                    </Link>

                                    <p className="mt-3 text-sm text-gray-500">
                                        By {blog.author_name || "Unknown author"}
                                    </p>

                                    <Link
                                        to={`/blogs/${blog.slug}`}
                                        className="inline-flex items-center gap-2 mt-6 text-sm font-semibold text-indigo-600 hover:gap-3 transition-all"
                                    >
                                        Read article
                                        <ArrowRight size={16} />
                                    </Link>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}

export default AllBlogs;
