import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
    Plus,
    Pencil,
    Trash2,
    X,
    FileText,
    Eye,
    LoaderCircle,
    ImagePlus,
    Heart,
    MessageCircle,
    RefreshCw,
} from "lucide-react";

import api from "../services/api";

/* ---------- Constants & helpers ---------- */

const initialForm = {
    title: "",
    content: "",
    status: "DRAFT",
    featured_image: null,
};

const inputClass =
    "w-full rounded-lg border border-stone-300 bg-white px-4 py-3 text-stone-900 placeholder:text-stone-400 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/20";

const toList = (data, key) =>
    Array.isArray(data) ? data : data?.results || data?.[key] || [];

const formatDate = (date) => {
    if (!date) return "Not available";

    return new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
};

/* ---------- Small components ---------- */

function StatusBadge({ status }) {
    const published = status === "PUBLISHED";

    return (
        <span
            className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                published ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"
            }`}
        >
            {status || "UNKNOWN"}
        </span>
    );
}

function StatCard({ icon: Icon, label, value, iconClass = "text-stone-400" }) {
    return (
        <div className="bg-white border border-stone-200 rounded-2xl p-6">
            <div className="flex items-center gap-3 text-stone-500">
                <Icon size={20} className={iconClass} />
                <span className="text-sm font-medium">{label}</span>
            </div>
            <p className="text-3xl font-bold text-stone-900 mt-4">{value}</p>
        </div>
    );
}

function Section({ title, description, action, children }) {
    return (
        <section className="bg-white border border-stone-200 rounded-2xl p-6 mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-lg font-bold text-stone-900">{title}</h2>
                    {description && (
                        <p className="text-sm text-stone-500 mt-1">{description}</p>
                    )}
                </div>
                {action}
            </div>
            {children}
        </section>
    );
}

function Spinner({ size = 30 }) {
    return (
        <div className="flex justify-center py-10">
            <LoaderCircle size={size} className="animate-spin text-indigo-600" />
        </div>
    );
}

function EmptyState({ icon: Icon, title, text }) {
    return (
        <div className="text-center py-12 px-6">
            <Icon size={38} className="mx-auto text-stone-300" />
            <h3 className="font-semibold text-stone-900 mt-4">{title}</h3>
            {text && <p className="text-sm text-stone-500 mt-2">{text}</p>}
        </div>
    );
}

function ArticleFormModal({ editing, form, saving, onChange, onSubmit, onClose }) {
    return (
        <div className="fixed inset-0 z-50 bg-stone-950/50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl">
                <div className="flex items-center justify-between p-6 border-b border-stone-200">
                    <div>
                        <h2 className="text-xl font-bold text-stone-900">
                            {editing ? "Edit article" : "Create new article"}
                        </h2>
                        <p className="text-sm text-stone-500 mt-1">
                            Add your article information below.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close"
                        className="p-2 rounded-lg hover:bg-stone-100 text-stone-500"
                    >
                        <X size={21} />
                    </button>
                </div>

                <form onSubmit={onSubmit} className="p-6 space-y-6">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-stone-700 mb-1.5">
                            Title
                        </label>
                        <input
                            id="title"
                            type="text"
                            name="title"
                            value={form.title}
                            onChange={onChange}
                            placeholder="Enter article title"
                            className={inputClass}
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="content" className="block text-sm font-medium text-stone-700 mb-1.5">
                            Content
                        </label>
                        <textarea
                            id="content"
                            name="content"
                            value={form.content}
                            onChange={onChange}
                            placeholder="Write your article content..."
                            rows={12}
                            className={`${inputClass} resize-y`}
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="featured_image" className="block text-sm font-medium text-stone-700 mb-1.5">
                            Featured image
                        </label>
                        <input
                            id="featured_image"
                            type="file"
                            name="featured_image"
                            accept="image/*"
                            onChange={onChange}
                            className="block w-full text-sm text-stone-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:text-indigo-700 file:font-semibold hover:file:bg-indigo-100"
                        />
                        <p className="text-xs text-stone-400 mt-2">
                            Leave empty to keep the existing image when editing.
                        </p>
                    </div>

                    <div>
                        <label htmlFor="status" className="block text-sm font-medium text-stone-700 mb-1.5">
                            Status
                        </label>
                        <select
                            id="status"
                            name="status"
                            value={form.status}
                            onChange={onChange}
                            className={inputClass}
                        >
                            <option value="DRAFT">Draft</option>
                            <option value="PUBLISHED">Published</option>
                        </select>
                    </div>

                    <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-stone-200">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={saving}
                            className="px-6 py-3 rounded-full border border-stone-300 hover:border-stone-900 font-medium transition disabled:opacity-60"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={saving}
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-stone-900 hover:bg-stone-700 text-white font-medium transition disabled:opacity-60"
                        >
                            {saving ? (
                                <>
                                    <LoaderCircle size={18} className="animate-spin" />
                                    Saving...
                                </>
                            ) : editing ? (
                                "Update article"
                            ) : (
                                "Create article"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

/* ---------- Page ---------- */

function AdminDashboard() {
    // Articles
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);

    // Form
    const [showForm, setShowForm] = useState(false);
    const [editingBlog, setEditingBlog] = useState(null);
    const [form, setForm] = useState(initialForm);
    const [saving, setSaving] = useState(false);

    // Engagement
    const [likesData, setLikesData] = useState({ total_likes: 0, blogs: [] });
    const [comments, setComments] = useState([]);
    const [engagementLoading, setEngagementLoading] = useState(true);
    const [deletingCommentId, setDeletingCommentId] = useState(null);

    /* ----- Data loading ----- */

    const fetchBlogs = async () => {
        try {
            setLoading(true);
            const response = await api.get("/blogs/admin/");
            setBlogs(toList(response.data, "blogs"));
        } catch (error) {
            console.error("Failed to load admin blogs:", error);
            toast.error(error.response?.data?.detail || "Unable to load blog articles.");
        } finally {
            setLoading(false);
        }
    };

    const fetchLikes = async () => {
        try {
            const response = await api.get("/blogs/admin/likes/");
            setLikesData({
                total_likes: response.data.total_likes || 0,
                blogs: response.data.blogs || [],
            });
        } catch (error) {
            console.error("Failed to load likes:", error);
            toast.error("Unable to load likes overview.");
        }
    };

    const fetchComments = async () => {
        try {
            const response = await api.get("/blogs/admin/comments/");
            setComments(toList(response.data, "comments"));
        } catch (error) {
            console.error("Failed to load comments:", error);
            toast.error("Unable to load comments.");
        }
    };

    const fetchEngagement = async () => {
        try {
            setEngagementLoading(true);
            await Promise.all([fetchLikes(), fetchComments()]);
        } finally {
            setEngagementLoading(false);
        }
    };

    useEffect(() => {
        fetchBlogs();
        fetchEngagement();
    }, []);

    /* ----- Form handlers ----- */

    const openCreateForm = () => {
        setEditingBlog(null);
        setForm(initialForm);
        setShowForm(true);
    };

    const openEditForm = (blog) => {
        setEditingBlog(blog);
        setForm({
            title: blog.title || "",
            content: blog.content || "",
            status: blog.status || "DRAFT",
            featured_image: null,
        });
        setShowForm(true);
    };

    const closeForm = () => {
        setShowForm(false);
        setEditingBlog(null);
        setForm(initialForm);
    };

    const handleChange = (event) => {
        const { name, value, files } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: name === "featured_image" ? files[0] || null : value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!form.title.trim() || !form.content.trim()) {
            toast.error("Please enter both title and content.");
            return;
        }

        try {
            setSaving(true);

            const formData = new FormData();
            formData.append("title", form.title.trim());
            formData.append("content", form.content);
            formData.append("status", form.status);

            if (form.featured_image) {
                formData.append("featured_image", form.featured_image);
            }

            if (editingBlog) {
                await api.patch(`/blogs/admin/${editingBlog.slug}/update/`, formData);
                toast.success("Article updated successfully.");
            } else {
                await api.post("/blogs/admin/create/", formData);
                toast.success("Article created successfully.");
            }

            closeForm();
            await fetchBlogs();
        } catch (error) {
            console.error("Failed to save article:", error);

            const errorData = error.response?.data;
            toast.error(
                errorData?.detail ||
                    errorData?.message ||
                    "Unable to save article. Please check your information."
            );
        } finally {
            setSaving(false);
        }
    };

    /* ----- Delete handlers ----- */

    const handleDelete = async (blog) => {
        if (!window.confirm(`Are you sure you want to delete "${blog.title}"?`)) return;

        try {
            await api.delete(`/blogs/admin/${blog.slug}/delete/`);
            setBlogs((previous) => previous.filter((item) => item.id !== blog.id));
            toast.success("Article deleted successfully.");
        } catch (error) {
            console.error("Failed to delete article:", error);
            toast.error(error.response?.data?.detail || "Unable to delete this article.");
        }
    };

    const handleDeleteComment = async (comment) => {
        if (!window.confirm("Are you sure you want to delete this comment?")) return;

        try {
            setDeletingCommentId(comment.id);
            await api.delete(`/blogs/admin/comments/${comment.id}/delete/`);
            setComments((previous) => previous.filter((item) => item.id !== comment.id));
            toast.success("Comment deleted successfully.");
        } catch (error) {
            console.error("Failed to delete comment:", error);
            toast.error(error.response?.data?.detail || "Unable to delete this comment.");
        } finally {
            setDeletingCommentId(null);
        }
    };

    /* ----- Derived data ----- */

    const totalCount = blogs.length;
    const publishedCount = blogs.filter((blog) => blog.status === "PUBLISHED").length;
    const draftCount = blogs.filter((blog) => blog.status === "DRAFT").length;
    const publishedPercentage =
        totalCount > 0 ? Math.round((publishedCount / totalCount) * 100) : 0;

    const recentBlogs = [...blogs]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5);

    const sortedLikes = [...likesData.blogs].sort(
        (a, b) => (b.likes_count || 0) - (a.likes_count || 0)
    );

    const getCommentBlogTitle = (comment) => {
        const blogId = typeof comment.blog === "object" ? comment.blog?.id : comment.blog;
        const blog = blogs.find((item) => String(item.id) === String(blogId));

        return blog?.title || comment.blog?.title || "Unknown article";
    };

    /* ----- Render ----- */

    return (
        <div className="min-h-screen bg-stone-50 text-stone-900">
            <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-10">
                    <div>
                        <h1 className="font-serif text-3xl md:text-4xl font-bold">
                            Blog management
                        </h1>
                        <p className="text-stone-600 mt-2">
                            Create, manage and publish your articles.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={openCreateForm}
                        className="inline-flex items-center justify-center gap-2 bg-stone-900 hover:bg-stone-700 text-white px-6 py-3 rounded-full font-medium transition"
                    >
                        <Plus size={19} />
                        Create article
                    </button>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 mb-8">
                    <StatCard icon={FileText} label="Total articles" value={totalCount} />
                    <StatCard icon={Eye} label="Published" value={publishedCount} />
                    <StatCard icon={FileText} label="Drafts" value={draftCount} />
                    <StatCard
                        icon={Heart}
                        label="Total likes"
                        value={likesData.total_likes}
                        iconClass="text-rose-500"
                    />
                    <StatCard
                        icon={MessageCircle}
                        label="Total comments"
                        value={comments.length}
                        iconClass="text-indigo-500"
                    />
                </div>

                {/* Publication overview */}
                <Section
                    title="Publication overview"
                    description="How many of your articles are published."
                >
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-stone-600">Published articles</span>
                        <span className="text-sm font-bold">{publishedPercentage}%</span>
                    </div>

                    <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                            style={{ width: `${publishedPercentage}%` }}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-6">
                        <div className="p-4 rounded-xl bg-green-50">
                            <p className="text-sm text-green-700">Published</p>
                            <p className="text-2xl font-bold text-green-800 mt-1">{publishedCount}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-amber-50">
                            <p className="text-sm text-amber-700">Drafts</p>
                            <p className="text-2xl font-bold text-amber-800 mt-1">{draftCount}</p>
                        </div>
                    </div>
                </Section>

                {/* Recent articles */}
                <Section
                    title="Recently created"
                    description="Your five most recently created articles."
                >
                    {recentBlogs.length === 0 ? (
                        <p className="text-sm text-stone-500 py-4 text-center">
                            No recent articles available.
                        </p>
                    ) : (
                        <div className="divide-y divide-stone-100">
                            {recentBlogs.map((blog) => (
                                <div
                                    key={blog.id}
                                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-4 first:pt-0 last:pb-0"
                                >
                                    <div>
                                        <h3 className="font-semibold">{blog.title}</h3>
                                        <p className="text-sm text-stone-500 mt-1">
                                            {blog.author_name || "Admin"} · {formatDate(blog.created_at)}
                                        </p>
                                    </div>
                                    <StatusBadge status={blog.status} />
                                </div>
                            ))}
                        </div>
                    )}
                </Section>

                {/* All articles */}
                <section className="bg-white border border-stone-200 rounded-2xl overflow-hidden mb-8">
                    <div className="p-6 border-b border-stone-200">
                        <h2 className="text-lg font-bold">All articles</h2>
                        <p className="text-sm text-stone-500 mt-1">Manage your existing blog posts.</p>
                    </div>

                    {loading ? (
                        <Spinner size={34} />
                    ) : blogs.length === 0 ? (
                        <EmptyState
                            icon={FileText}
                            title="No articles yet"
                            text="Create your first article to get started."
                        />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-stone-50 text-stone-500 text-sm">
                                    <tr>
                                        <th className="px-6 py-4 font-medium">Article</th>
                                        <th className="px-6 py-4 font-medium">Author</th>
                                        <th className="px-6 py-4 font-medium">Status</th>
                                        <th className="px-6 py-4 font-medium">Date</th>
                                        <th className="px-6 py-4 font-medium text-right">Actions</th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-stone-100">
                                    {blogs.map((blog) => (
                                        <tr key={blog.id} className="hover:bg-stone-50 transition">
                                            <td className="px-6 py-4 min-w-64">
                                                <div className="flex items-center gap-4">
                                                    {blog.featured_image ? (
                                                        <img
                                                            src={blog.featured_image}
                                                            alt=""
                                                            className="w-14 h-12 rounded-lg object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-14 h-12 rounded-lg bg-stone-100 flex items-center justify-center">
                                                            <ImagePlus size={20} className="text-stone-400" />
                                                        </div>
                                                    )}

                                                    <div>
                                                        <p className="font-semibold line-clamp-2">{blog.title}</p>
                                                        <p className="text-xs text-stone-400 mt-1">{blog.slug}</p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 text-sm text-stone-600">
                                                {blog.author_name || "Admin"}
                                            </td>

                                            <td className="px-6 py-4">
                                                <StatusBadge status={blog.status} />
                                            </td>

                                            <td className="px-6 py-4 text-sm text-stone-500 whitespace-nowrap">
                                                {formatDate(blog.published_at || blog.created_at)}
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="flex justify-end items-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => openEditForm(blog)}
                                                        title="Edit article"
                                                        aria-label={`Edit ${blog.title}`}
                                                        className="p-2 rounded-lg text-indigo-700 hover:bg-indigo-50 transition"
                                                    >
                                                        <Pencil size={18} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(blog)}
                                                        title="Delete article"
                                                        aria-label={`Delete ${blog.title}`}
                                                        className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>

                {/* Likes overview */}
                <Section
                    title="Likes overview"
                    description="See how readers are engaging with your articles."
                    action={
                        <button
                            type="button"
                            onClick={fetchEngagement}
                            disabled={engagementLoading}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full border border-stone-300 hover:border-stone-900 text-sm font-medium transition disabled:opacity-50"
                        >
                            <RefreshCw size={16} className={engagementLoading ? "animate-spin" : ""} />
                            Refresh
                        </button>
                    }
                >
                    {engagementLoading ? (
                        <Spinner size={28} />
                    ) : sortedLikes.length === 0 ? (
                        <EmptyState icon={Heart} title="No like information available" />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-stone-50 text-stone-500 text-sm">
                                    <tr>
                                        <th className="px-5 py-3 font-medium">Article</th>
                                        <th className="px-5 py-3 font-medium">Likes</th>
                                        <th className="px-5 py-3 font-medium">Share of all likes</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-100">
                                    {sortedLikes.map((blog) => (
                                        <tr key={blog.id}>
                                            <td className="px-5 py-4 font-semibold">{blog.title}</td>
                                            <td className="px-5 py-4">
                                                <span className="inline-flex items-center gap-2 text-rose-600 font-semibold">
                                                    <Heart size={16} />
                                                    {blog.likes_count || 0}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-sm text-stone-500">
                                                {likesData.total_likes > 0
                                                    ? Math.round(
                                                          ((blog.likes_count || 0) / likesData.total_likes) * 100
                                                      )
                                                    : 0}
                                                %
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Section>

                {/* Comments management */}
                <Section
                    title="Comments"
                    description="View and manage comments submitted by readers."
                    action={
                        <span className="px-4 py-2 rounded-full bg-indigo-50 text-indigo-700 text-sm font-semibold">
                            {comments.length} {comments.length === 1 ? "comment" : "comments"}
                        </span>
                    }
                >
                    {engagementLoading ? (
                        <Spinner size={28} />
                    ) : comments.length === 0 ? (
                        <EmptyState
                            icon={MessageCircle}
                            title="No comments yet"
                            text="Comments from readers will appear here."
                        />
                    ) : (
                        <div className="space-y-4">
                            {comments.map((comment) => (
                                <div
                                    key={comment.id}
                                    className="border border-stone-200 rounded-xl p-5 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4"
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="font-semibold">
                                                {comment.author_name || "Unknown user"}
                                            </span>
                                            <span className="text-xs text-stone-400">
                                                · {formatDate(comment.created_at)}
                                            </span>
                                        </div>

                                        <p className="text-sm text-indigo-700 font-medium mt-2">
                                            Article: {getCommentBlogTitle(comment)}
                                        </p>

                                        <p className="text-sm text-stone-600 leading-7 mt-3 whitespace-pre-wrap break-words">
                                            {comment.content}
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => handleDeleteComment(comment)}
                                        disabled={deletingCommentId === comment.id}
                                        className="self-start inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition disabled:opacity-50"
                                    >
                                        {deletingCommentId === comment.id ? (
                                            <LoaderCircle size={16} className="animate-spin" />
                                        ) : (
                                            <Trash2 size={16} />
                                        )}
                                        Delete
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </Section>
            </div>

            {showForm && (
                <ArticleFormModal
                    editing={editingBlog}
                    form={form}
                    saving={saving}
                    onChange={handleChange}
                    onSubmit={handleSubmit}
                    onClose={closeForm}
                />
            )}
        </div>
    );
}

export default AdminDashboard;