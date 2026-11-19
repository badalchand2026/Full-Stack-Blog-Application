
import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "react-toastify";

import {
    ArrowLeft,
    CalendarDays,
    Clock3,
    Heart,
    MessageCircle,
    Send,
    UserRound,
    LoaderCircle,
} from "lucide-react";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function BlogDetails() {
    const { slug } = useParams();
    const { user, isAuthenticated } = useAuth();

    const [blog, setBlog] = useState(null);
    const [comments, setComments] = useState([]);
    const [likesCount, setLikesCount] = useState(0);
    const [liked, setLiked] = useState(false);

    const [commentContent, setCommentContent] = useState("");
    const [loading, setLoading] = useState(true);
    const [submittingComment, setSubmittingComment] = useState(false);
    const [liking, setLiking] = useState(false);

    const formatDate = (date) => {
        if (!date) return "Date unavailable";

        return new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const fetchBlog = useCallback(async () => {
        const response = await api.get(`/blogs/${slug}/`);
        setBlog(response.data);
    }, [slug]);

    const fetchComments = useCallback(async () => {
        const response = await api.get(`/blogs/${slug}/comments/`);

        // Support both normal arrays and paginated DRF responses.
        const data = response.data;
        setComments(Array.isArray(data) ? data : data.results || []);
    }, [slug]);

    const fetchLikes = useCallback(async () => {
        const response = await api.get(`/blogs/${slug}/likes/`);

        setLikesCount(response.data.likes_count || 0);
    }, [slug]);

    useEffect(() => {
        let isMounted = true;

        const loadBlogData = async () => {
            try {
                setLoading(true);

                const [blogResponse, commentsResponse, likesResponse] =
                    await Promise.all([
                        api.get(`/blogs/${slug}/`),
                        api.get(`/blogs/${slug}/comments/`),
                        api.get(`/blogs/${slug}/likes/`),
                    ]);

                if (!isMounted) return;

                setBlog(blogResponse.data);

                const commentData = commentsResponse.data;
                setComments(
                    Array.isArray(commentData)
                        ? commentData
                        : commentData.results || []
                );

                setLikesCount(likesResponse.data.likes_count || 0);
            } catch (error) {
                if (isMounted) {
                    toast.error(
                        error.response?.data?.detail ||
                        "Unable to load this article."
                    );
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        loadBlogData();

        return () => {
            isMounted = false;
        };
    }, [slug]);

    const handleLike = async () => {
        if (!isAuthenticated) {
            toast.info("Please log in to like this article.");
            return;
        }

        try {
            setLiking(true);

            if (liked) {
                await api.delete(`/blogs/${slug}/like/`);
                setLiked(false);
                setLikesCount((previous) => Math.max(0, previous - 1));
                toast.success("Like removed.");
            } else {
                await api.post(`/blogs/${slug}/like/`);
                setLiked(true);
                setLikesCount((previous) => previous + 1);
                toast.success("Article liked!");
            }
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                error.response?.data?.detail ||
                "Unable to update your like."
            );
        } finally {
            setLiking(false);
        }
    };

    const handleCommentSubmit = async (event) => {
        event.preventDefault();

        if (!isAuthenticated) {
            toast.info("Please log in to comment.");
            return;
        }

        if (!commentContent.trim()) {
            toast.error("Please enter a comment.");
            return;
        }

        try {
            setSubmittingComment(true);

            const response = await api.post(
                `/blogs/${slug}/comments/create/`,
                {
                    content: commentContent.trim(),
                }
            );

            setComments((previous) => [...previous, response.data]);
            setCommentContent("");

            toast.success("Comment added successfully!");
        } catch (error) {
            toast.error(
                error.response?.data?.detail ||
                "Unable to add your comment."
            );
        } finally {
            setSubmittingComment(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <LoaderCircle
                    size={40}
                    className="text-indigo-600 animate-spin"
                />
            </div>
        );
    }

    if (!blog) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
                <h1 className="text-3xl font-bold text-gray-900">
                    Article not found
                </h1>

                <p className="text-gray-500 mt-3">
                    This article may have been removed or is unavailable.
                </p>

                <Link to="/" className="btn-primary mt-6">
                    <ArrowLeft size={18} />
                    Back to Home
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-slate-50 min-h-screen">

            {/* Article Header */}
            <section className="bg-white border-b border-gray-100">
                <div className="container-app max-w-5xl py-12">

                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-indigo-600 transition-colors"
                    >
                        <ArrowLeft size={17} />
                        Back to articles
                    </Link>

                    <div className="mt-9">
                        <span className="inline-block bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1.5 rounded-full">
                            Article
                        </span>

                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-gray-900 mt-5">
                            {blog.title}
                        </h1>

                        <div className="flex flex-wrap items-center gap-x-7 gap-y-3 mt-7 text-sm text-gray-500">

                            <div className="flex items-center gap-2">
                                <div className="w-9 h-9 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center">
                                    <UserRound size={18} />
                                </div>

                                <span className="font-semibold text-gray-800">
                                    {blog.author_name || "Anonymous"}
                                </span>
                            </div>

                            <div className="flex items-center gap-2">
                                <CalendarDays size={17} />
                                {formatDate(blog.published_at || blog.created_at)}
                            </div>

                            <div className="flex items-center gap-2">
                                <MessageCircle size={17} />
                                {comments.length} comments
                            </div>

                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Image */}
            {blog.featured_image && (
                <section className="container-app max-w-5xl pt-10">
                    <div className="overflow-hidden rounded-2xl shadow-lg">
                        <img
                            src={blog.featured_image}
                            alt={blog.title}
                            className="w-full max-h-[520px] object-cover"
                        />
                    </div>
                </section>
            )}

            {/* Article Content */}
            <section className="container-app max-w-5xl py-12">

                <article className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-10 lg:p-12 shadow-sm">

                    <div className="text-gray-700 text-base sm:text-lg leading-9 whitespace-pre-wrap break-words">
                        {blog.content}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-4 mt-12 pt-7 border-t border-gray-100">

                        <button
                            onClick={handleLike}
                            disabled={liking}
                            className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold transition-colors disabled:opacity-60 ${
                                liked
                                    ? "bg-red-50 text-red-600"
                                    : "bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-600"
                            }`}
                        >
                            <Heart
                                size={19}
                                fill={liked ? "currentColor" : "none"}
                            />

                            {liking ? "Updating..." : liked ? "Liked" : "Like article"}

                            <span>({likesCount})</span>
                        </button>

                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Clock3 size={17} />
                            Thanks for reading!
                        </div>
                    </div>
                </article>

                {/* Comments */}
                <section className="mt-12">

                    <div className="flex items-center gap-3 mb-7">
                        <div className="w-11 h-11 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                            <MessageCircle size={22} />
                        </div>

                        <div>
                            <h2 className="text-2xl font-extrabold text-gray-900">
                                Discussion
                            </h2>

                            <p className="text-sm text-gray-500">
                                {comments.length} comments on this article
                            </p>
                        </div>
                    </div>

                    {/* Add Comment */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-4">
                            Leave a comment
                        </h3>

                        {isAuthenticated ? (
                            <form onSubmit={handleCommentSubmit}>
                                <textarea
                                    value={commentContent}
                                    onChange={(event) =>
                                        setCommentContent(event.target.value)
                                    }
                                    placeholder="Share your thoughts..."
                                    rows={4}
                                    maxLength={2000}
                                    className="input-field resize-y"
                                />

                                <div className="flex justify-between items-center gap-3 mt-4">
                                    <span className="text-xs text-gray-400">
                                        {commentContent.length}/2000
                                    </span>

                                    <button
                                        type="submit"
                                        disabled={
                                            submittingComment ||
                                            !commentContent.trim()
                                        }
                                        className="btn-primary disabled:opacity-60"
                                    >
                                        {submittingComment
                                            ? "Posting..."
                                            : "Post comment"}

                                        <Send size={17} />
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="bg-indigo-50 rounded-xl p-5">
                                <p className="text-sm text-gray-600">
                                    Please log in to join the discussion.
                                </p>

                                <Link
                                    to="/login"
                                    className="inline-flex items-center text-indigo-600 font-semibold text-sm mt-3"
                                >
                                    Log in to comment
                                    <ArrowLeft size={15} className="ml-2 rotate-180" />
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Comment List */}
                    <div className="space-y-4 mt-7">
                        {comments.length > 0 ? (
                            comments.map((comment) => (
                                <div
                                    key={comment.id}
                                    className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                                            <UserRound size={19} />
                                        </div>

                                        <div>
                                            <p className="font-bold text-gray-900">
                                                {comment.author_name || "Anonymous"}
                                            </p>

                                            <p className="text-xs text-gray-400 mt-0.5">
                                                {formatDate(comment.created_at)}
                                            </p>
                                        </div>
                                    </div>

                                    <p className="text-gray-600 text-sm leading-7 mt-4 whitespace-pre-wrap">
                                        {comment.content}
                                    </p>
                                </div>
                            ))
                        ) : (
                            <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
                                <MessageCircle
                                    size={30}
                                    className="mx-auto text-gray-300"
                                />

                                <h3 className="font-bold text-gray-800 mt-4">
                                    No comments yet
                                </h3>

                                <p className="text-sm text-gray-500 mt-2">
                                    Be the first to share your thoughts.
                                </p>
                            </div>
                        )}
                    </div>

                </section>
            </section>
        </div>
    );
}

export default BlogDetails;
