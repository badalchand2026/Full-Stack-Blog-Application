import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";

import api from "../services/api";

/* ---------- Helpers ---------- */

function getExcerpt(content, maxLength = 260) {
    if (!content) return "";

    const plainText = content.replace(/<[^>]*>/g, "").trim();

    return plainText.length <= maxLength
        ? plainText
        : `${plainText.slice(0, maxLength).trim()}…`;
}

function formatDate(date) {
    if (!date) return "Recently";

    return new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

// Works whether the API sends `category: "art"` or `category: { name: "Art" }`
function getCategory(article) {
    const value = article.category ?? article.cat;

    if (!value) return "";

    return (typeof value === "object" ? value.name : value) || "";
}

/* ---------- Post row ---------- */

function PostRow({ article, index }) {
    const reversed = index % 2 === 1;

    return (
        <article
            className={`flex flex-col md:flex-row ${
                reversed ? "md:flex-row-reverse" : ""
            } items-center gap-10 md:gap-20 py-12 md:py-16`}
        >
            {/* Image with offset color block */}
            <div className="relative w-full md:flex-1 px-4">
                <div
                    aria-hidden="true"
                    className={`absolute inset-x-4 inset-y-0 bg-teal-100 translate-y-4 ${
                        reversed ? "translate-x-4" : "-translate-x-4"
                    }`}
                />

                {article.featured_image ? (
                    <img
                        src={article.featured_image}
                        alt=""
                        className="relative w-full h-64 md:h-96 object-cover"
                    />
                ) : (
                    <div className="relative w-full h-64 md:h-96 bg-stone-200" />
                )}
            </div>

            {/* Text */}
            <div className="w-full md:flex-1">
                {getCategory(article) && (
                    <p className="text-sm font-medium text-teal-700 mb-2">
                        {getCategory(article)}
                    </p>
                )}

                <Link to={`/blogs/${article.slug}`}>
                    <h2 className="text-3xl md:text-4xl font-bold text-stone-900 leading-tight hover:text-teal-700 transition">
                        {article.title}
                    </h2>
                </Link>

                <p className="mt-5 text-stone-600 leading-7">
                    {getExcerpt(article.content)}
                </p>

                <p className="mt-4 text-sm text-stone-500">
                    {article.author_name || "Unknown author"} ·{" "}
                    {formatDate(article.published_at || article.created_at)}
                </p>

                <Link
                    to={`/blogs/${article.slug}`}
                    className="inline-block mt-6 border border-teal-700 text-teal-700 hover:bg-teal-700 hover:text-white px-6 py-2 transition"
                >
                    Read more
                </Link>
            </div>
        </article>
    );
}

function PostSkeleton() {
    return (
        <div className="animate-pulse space-y-16 py-12">
            {[1, 2].map((item) => (
                <div key={item} className="flex flex-col md:flex-row gap-10 md:gap-20">
                    <div className="w-full md:flex-1 h-64 md:h-96 bg-stone-200" />
                    <div className="w-full md:flex-1 space-y-4">
                        <div className="h-8 w-3/4 bg-stone-200" />
                        <div className="h-4 w-full bg-stone-200" />
                        <div className="h-4 w-5/6 bg-stone-200" />
                        <div className="h-10 w-32 bg-stone-200" />
                    </div>
                </div>
            ))}
        </div>
    );
}

/* ---------- Page ---------- */

function Home() {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    // Category filter lives in the URL: /?cat=art
    const [searchParams] = useSearchParams();
    const activeCategory = (searchParams.get("cat") || "").toLowerCase();

    const fetchArticles = async () => {
        try {
            setLoading(true);
            setError(false);

            const response = await api.get("/blogs/");
            const data = response.data;
            const blogList = Array.isArray(data) ? data : data.results || [];

            setArticles(
                [...blogList].sort(
                    (a, b) =>
                        new Date(b.published_at || b.created_at) -
                        new Date(a.published_at || a.created_at)
                )
            );
        } catch (err) {
            console.error("Failed to load homepage articles:", err);
            setError(true);
            toast.error("Unable to load the latest articles.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchArticles();
    }, []);

    // Build the category list from the articles themselves
    const categories = [
        ...new Set(articles.map(getCategory).filter(Boolean)),
    ];

    const visibleArticles = activeCategory
        ? articles.filter(
              (article) => getCategory(article).toLowerCase() === activeCategory
          )
        : articles;

    return (
        <div className="bg-white text-stone-900">
            <div className="max-w-6xl mx-auto px-4">

                {/* Category filter (only shown if your articles have categories) */}
                {categories.length > 0 && (
                    <nav
                        id="categories"
                        aria-label="Categories"
                        className="flex flex-wrap items-center gap-x-6 gap-y-2 py-5 border-b border-stone-200 scroll-mt-20"
                    >
                        <Link
                            to="/"
                            className={`text-sm font-medium ${
                                !activeCategory
                                    ? "text-teal-700 underline underline-offset-8"
                                    : "text-stone-600 hover:text-teal-700"
                            }`}
                        >
                            All
                        </Link>

                        {categories.map((name) => (
                            <Link
                                key={name}
                                to={`/?cat=${encodeURIComponent(name.toLowerCase())}`}
                                className={`text-sm font-medium ${
                                    activeCategory === name.toLowerCase()
                                        ? "text-teal-700 underline underline-offset-8"
                                        : "text-stone-600 hover:text-teal-700"
                                }`}
                            >
                                {name}
                            </Link>
                        ))}
                    </nav>
                )}

                {/* Posts */}
                <section id="articles" className="scroll-mt-20">
                    {loading && <PostSkeleton />}

                    {!loading && error && (
                        <div className="py-24 text-center">
                            <h2 className="text-2xl font-bold">We couldn't load the articles</h2>
                            <p className="mt-2 text-stone-600">
                                Check your connection and try again.
                            </p>
                            <button
                                type="button"
                                onClick={fetchArticles}
                                className="mt-6 border border-teal-700 text-teal-700 hover:bg-teal-700 hover:text-white px-6 py-2 transition"
                            >
                                Try again
                            </button>
                        </div>
                    )}

                    {!loading && !error && visibleArticles.length === 0 && (
                        <div className="py-24 text-center">
                            <h2 className="text-2xl font-bold">
                                {activeCategory ? "No articles in this category" : "No articles yet"}
                            </h2>
                            <p className="mt-2 text-stone-600">
                                {activeCategory
                                    ? "Try another category."
                                    : "Be the first to publish something here."}
                            </p>
                            <Link
                                to={activeCategory ? "/" : "/register"}
                                className="inline-block mt-6 border border-teal-700 text-teal-700 hover:bg-teal-700 hover:text-white px-6 py-2 transition"
                            >
                                {activeCategory ? "View all articles" : "Start writing"}
                            </Link>
                        </div>
                    )}

                    {!loading && !error && visibleArticles.length > 0 && (
                        <div className="divide-y divide-stone-200">
                            {visibleArticles.map((article, index) => (
                                <PostRow key={article.id} article={article} index={index} />
                            ))}
                        </div>
                    )}
                </section>

                {/* About */}
                <p
                    id="about"
                    className="py-12 border-t border-stone-200 text-sm text-stone-500 text-center scroll-mt-20"
                >
                    BlogApp is a place for readers and writers to share knowledge and ideas.
                </p>
            </div>
        </div>
    );
}

export default Home;