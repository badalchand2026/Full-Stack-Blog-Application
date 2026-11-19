
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Clock3, LoaderCircle, RefreshCw } from "lucide-react";
import { toast } from "react-toastify";

import api from "../services/api";

function getExcerpt(content, maxLength = 160) {
    if (!content) return "Discover this article and explore more ideas.";

    const plainText = content.replace(/<[^>]*>/g, "").trim();

    if (plainText.length <= maxLength) {
        return plainText;
    }

    return `${plainText.slice(0, maxLength).trim()}...`;
}

function getReadingTime(content) {
    if (!content) return "1 min read";

    const words = content.trim().split(/\s+/).length;
    const minutes = Math.max(1, Math.ceil(words / 200));

    return `${minutes} min read`;
}

function formatDate(date) {
    if (!date) return "Recently published";

    return new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

function Meta({ article }) {
    return (
        <div className="flex flex-wrap items-center gap-3 text-sm text-stone-500">
            <span>{formatDate(article.published_at || article.created_at)}</span>
            <span aria-hidden="true">•</span>
            <span className="inline-flex items-center gap-1.5">
                <Clock3 size={14} />
                {getReadingTime(article.content)}
            </span>
        </div>
    );
}

function Home() {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const fetchArticles = async () => {
        try {
            setLoading(true);
            setError(false);

            const response = await api.get("/blogs/");
            const data = response.data;

            const blogList = Array.isArray(data)
                ? data
                : data.results || [];

            const sortedArticles = [...blogList].sort(
                (a, b) =>
                    new Date(b.published_at || b.created_at) -
                    new Date(a.published_at || a.created_at)
            );

            setArticles(sortedArticles);
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

    const featured = articles[0];
    const remainingArticles = articles.slice(1, 3);

    return (
        <div className="bg-stone-50 text-stone-900">

            {/* Hero Section */}
            <section className="max-w-6xl mx-auto px-4 pt-16 pb-20 md:pt-24 grid md:grid-cols-2 gap-12 items-center">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-700 mb-5">
                        Welcome to BlogApp
                    </p>

                    <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight">
                        Read and share ideas that matter.
                    </h1>

                    <p className="mt-6 text-lg text-stone-600 leading-8 max-w-md">
                        Discover useful articles, learn new things, and
                        share your knowledge with a community of readers.
                    </p>

                    <div className="mt-8 flex flex-wrap gap-3">
                        <Link
                            to="/blogs"
                            className="inline-flex items-center gap-2 bg-stone-900 hover:bg-stone-700 text-white px-6 py-3 rounded-full font-medium transition"
                        >
                            Explore articles
                            <ArrowRight size={18} />
                        </Link>

                        <Link
                            to="/register"
                            className="inline-flex items-center border border-stone-300 hover:border-stone-900 px-6 py-3 rounded-full font-medium transition"
                        >
                            Start writing
                        </Link>
                    </div>
                </div>

                <div className="relative">
                    <img
                        src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200"
                        alt="Person working on a laptop"
                        className="w-full h-72 md:h-[420px] object-cover rounded-3xl"
                    />

                    <div className="absolute -bottom-5 -left-3 md:-left-6 bg-white shadow-lg rounded-2xl px-5 py-4">
                        <p className="text-sm text-stone-500">
                            Discover and share
                        </p>
                        <p className="font-bold text-stone-900 mt-1">
                            Ideas that inspire.
                        </p>
                    </div>
                </div>
            </section>

            {/* Latest Articles */}
            <section
                id="articles"
                className="max-w-6xl mx-auto px-4 py-16 scroll-mt-20"
            >
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 border-b border-stone-200 pb-5">
                    <div>
                        <p className="text-sm font-semibold text-indigo-700 uppercase tracking-wider">
                            From the community
                        </p>

                        <h2 className="font-serif text-3xl md:text-4xl font-bold mt-2">
                            Latest articles
                        </h2>
                    </div>

                    <Link
                        to="/blogs"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-700 hover:gap-3 transition-all"
                    >
                        View all articles
                        <ArrowRight size={17} />
                    </Link>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="flex flex-col items-center justify-center py-24">
                        <LoaderCircle
                            size={38}
                            className="animate-spin text-indigo-600"
                        />
                        <p className="mt-4 text-sm text-stone-500">
                            Loading latest articles...
                        </p>
                    </div>
                )}

                {/* Error State */}
                {!loading && error && (
                    <div className="text-center py-20">
                        <h3 className="text-xl font-bold">
                            Something went wrong
                        </h3>

                        <p className="text-stone-500 mt-2">
                            We couldn't load the articles. Please try again.
                        </p>

                        <button
                            onClick={fetchArticles}
                            className="inline-flex items-center gap-2 mt-6 bg-stone-900 text-white px-5 py-3 rounded-full hover:bg-stone-700 transition"
                        >
                            <RefreshCw size={16} />
                            Try again
                        </button>
                    </div>
                )}

                {/* Empty State */}
                {!loading && !error && articles.length === 0 && (
                    <div className="text-center py-24 border border-dashed border-stone-300 rounded-2xl mt-8">
                        <h3 className="font-serif text-2xl font-bold">
                            No articles published yet.
                        </h3>

                        <p className="text-stone-500 mt-3">
                            Be the first to share something with the community.
                        </p>

                        <Link
                            to="/register"
                            className="inline-flex items-center gap-2 mt-6 bg-indigo-700 text-white px-6 py-3 rounded-full hover:bg-indigo-800 transition"
                        >
                            Start writing
                            <ArrowRight size={17} />
                        </Link>
                    </div>
                )}

                {/* Articles */}
                {!loading && !error && featured && (
                    <>
                        {/* Featured Article */}
                        <Link
                            to={`/blogs/${featured.slug}`}
                            className="group mt-10 grid md:grid-cols-2 gap-8 items-center"
                        >
                            <div className="overflow-hidden rounded-2xl bg-stone-200">
                                {featured.featured_image ? (
                                    <img
                                        src={featured.featured_image}
                                        alt={featured.title}
                                        className="w-full h-64 md:h-80 object-cover group-hover:scale-105 transition duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-64 md:h-80 flex items-center justify-center text-stone-500">
                                        No featured image
                                    </div>
                                )}
                            </div>

                            <div>
                                <span className="text-sm font-semibold text-indigo-700">
                                    Featured Article
                                </span>

                                <h3 className="mt-3 font-serif text-3xl md:text-4xl font-bold leading-tight group-hover:text-indigo-700 transition">
                                    {featured.title}
                                </h3>

                                <p className="mt-4 text-stone-600 leading-7">
                                    {getExcerpt(featured.content, 200)}
                                </p>

                                <p className="mt-4 text-sm text-stone-500">
                                    By {featured.author_name || "Unknown author"}
                                </p>

                                <div className="mt-5">
                                    <Meta article={featured} />
                                </div>

                                <span className="inline-flex items-center gap-2 mt-6 font-semibold text-indigo-700">
                                    Read article
                                    <ArrowRight size={17} />
                                </span>
                            </div>
                        </Link>

                        {/* Other Articles */}
                        {remainingArticles.length > 0 && (
                            <div className="mt-16 grid sm:grid-cols-2 gap-10">
                                {remainingArticles.map((article) => (
                                    <Link
                                        key={article.id}
                                        to={`/blogs/${article.slug}`}
                                        className="group block"
                                    >
                                        <div className="overflow-hidden rounded-2xl bg-stone-200">
                                            {article.featured_image ? (
                                                <img
                                                    src={article.featured_image}
                                                    alt={article.title}
                                                    className="w-full h-52 object-cover group-hover:scale-105 transition duration-500"
                                                />
                                            ) : (
                                                <div className="w-full h-52 flex items-center justify-center text-stone-500">
                                                    No featured image
                                                </div>
                                            )}
                                        </div>

                                        <h3 className="mt-5 font-serif text-2xl font-bold leading-snug group-hover:text-indigo-700 transition">
                                            {article.title}
                                        </h3>

                                        <p className="mt-2 text-stone-600 leading-7">
                                            {getExcerpt(article.content)}
                                        </p>

                                        <p className="mt-3 text-sm text-stone-500">
                                            By {article.author_name || "Unknown author"}
                                        </p>

                                        <div className="mt-3">
                                            <Meta article={article} />
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}

                        {/* View All */}
                        <div className="text-center mt-14">
                            <Link
                                to="/blogs"
                                className="inline-flex items-center gap-2 border border-stone-300 hover:border-stone-900 px-7 py-3 rounded-full font-medium transition"
                            >
                                Explore all articles
                                <ArrowRight size={18} />
                            </Link>
                        </div>
                    </>
                )}
            </section>

            {/* About Section */}
            <section
                id="about"
                className="bg-white border-y border-stone-200 scroll-mt-20"
            >
                <div className="max-w-6xl mx-auto px-4 py-20 grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <p className="text-sm font-semibold text-indigo-700 uppercase tracking-wider">
                            About BlogApp
                        </p>

                        <h2 className="font-serif text-3xl md:text-4xl font-bold mt-3 leading-tight">
                            A place for ideas, knowledge, and stories.
                        </h2>
                    </div>

                    <div>
                        <p className="text-stone-600 leading-8">
                            BlogApp brings readers and writers together.
                            Explore articles from the community, learn from
                            different perspectives, and share your own
                            experiences with the world.
                        </p>

                        <Link
                            to="/blogs"
                            className="inline-flex items-center gap-2 mt-6 font-semibold text-indigo-700 hover:gap-3 transition-all"
                        >
                            Discover articles
                            <ArrowRight size={17} />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Join Section */}
            <section className="max-w-6xl mx-auto px-4 py-20">
                <div className="rounded-3xl bg-indigo-700 text-white px-6 py-14 md:px-16 text-center">
                    <h2 className="font-serif text-3xl md:text-4xl font-bold">
                        Have something to share?
                    </h2>

                    <p className="mt-4 text-indigo-100 leading-8 max-w-xl mx-auto">
                        Create an account, publish your first article,
                        and become part of our writing community.
                    </p>

                    <Link
                        to="/register"
                        className="inline-flex items-center gap-2 mt-8 bg-white text-indigo-800 hover:bg-indigo-50 px-7 py-3 rounded-full font-medium transition"
                    >
                        Create an account
                        <ArrowRight size={17} />
                    </Link>
                </div>
            </section>
        </div>
    );
}

export default Home;
