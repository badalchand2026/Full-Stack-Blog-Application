import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
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
    LayoutDashboard,
    Menu,
    Search,
    ChevronLeft,
    ChevronRight,
    PenLine,
} from "lucide-react";

import api from "../services/api";

/* ---------- Constants & helpers ---------- */

const initialForm = {
    title: "",
    content: "",
    status: "DRAFT",
    featured_image: null,
};

// The site <Navbar /> is hidden on admin pages, so nothing is offset.
// If you ever show the navbar here again, set this to its height in px (h-16 = 64).
const NAVBAR_HEIGHT = 0;

const ARTICLES_PER_PAGE = 8;
const COMMENTS_PER_PAGE = 10;

const inputClass =
    "w-full rounded-lg border border-stone-300 bg-white px-4 py-3 text-stone-900 placeholder:text-stone-400 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/20";

const toolbarInputClass =
    "w-full rounded-lg border border-stone-300 bg-white py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/20";

const toList = (data, key) =>
    Array.isArray(data) ? data : data?.results || data?.[key] || [];

const getApiErrorMessage = (error) => {
    const data = error?.response?.data;

    if (!data) {
        return error?.message || "Something went wrong. Please try again.";
    }

    if (typeof data === "string") return data;
    if (data.detail) return data.detail;

    return (
        Object.entries(data)
            .map(([field, messages]) => {
                const message = Array.isArray(messages)
                    ? messages.join(" ")
                    : typeof messages === "string"
                        ? messages
                        : JSON.stringify(messages);

                return `${field}: ${message}`;
            })
            .join(" | ") || "Unable to complete the request."
    );
};

const formatDate = (date) => {
    if (!date) return "Not available";

    return new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
};

const getInitials = (name) =>
    (name || "?")
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("") || "?";

const paginate = (list, page, size) => list.slice((page - 1) * size, page * size);

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
        <div className="bg-white border border-stone-200 rounded-2xl p-5">
            <div className="flex items-center gap-3 text-stone-500">
                <Icon size={19} className={iconClass} />
                <span className="text-sm font-medium">{label}</span>
            </div>
            <p className="text-3xl font-bold text-stone-900 mt-3">{value}</p>
        </div>
    );
}

function Section({ title, description, action, children, className = "" }) {
    return (
        <section className={`bg-white border border-stone-200 rounded-2xl p-6 ${className}`}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
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
        <div className="flex justify-center py-12">
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

function Avatar({ name }) {
    return (
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-xs font-bold text-indigo-700">
            {getInitials(name)}
        </span>
    );
}

function SearchInput({ value, onChange, placeholder }) {
    return (
        <div className="relative flex-1 min-w-0">
            <Search
                size={17}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400"
            />
            <input
                type="search"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className={`${toolbarInputClass} pl-10 pr-4`}
            />
        </div>
    );
}

function Pagination({ page, pageSize, total, onPage }) {
    const pageCount = Math.max(1, Math.ceil(total / pageSize));
    if (total <= pageSize) return null;

    const from = (page - 1) * pageSize + 1;
    const to = Math.min(page * pageSize, total);

    const btn =
        "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-stone-300 text-stone-600 hover:border-stone-900 disabled:opacity-40 disabled:hover:border-stone-300 transition";

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-stone-200 px-6 py-4">
            <p className="text-sm text-stone-500">
                Showing {from}–{to} of {total}
            </p>
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    className={btn}
                    disabled={page <= 1}
                    onClick={() => onPage(page - 1)}
                    aria-label="Previous page"
                >
                    <ChevronLeft size={18} />
                </button>
                <span className="px-2 text-sm text-stone-600">
                    Page {page} of {pageCount}
                </span>
                <button
                    type="button"
                    className={btn}
                    disabled={page >= pageCount}
                    onClick={() => onPage(page + 1)}
                    aria-label="Next page"
                >
                    <ChevronRight size={18} />
                </button>
            </div>
        </div>
    );
}

function ModalShell({ title, subtitle, onClose, children, maxWidth = "max-w-3xl" }) {
    return (
        <div className="fixed inset-0 z-50 bg-stone-950/50 flex items-center justify-center p-4">
            <div
                className={`bg-white w-full ${maxWidth} max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl`}
            >
                <div className="flex items-center justify-between p-6 border-b border-stone-200">
                    <div>
                        <h2 className="text-xl font-bold text-stone-900">{title}</h2>
                        {subtitle && <p className="text-sm text-stone-500 mt-1">{subtitle}</p>}
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
                {children}
            </div>
        </div>
    );
}

function ArticleFormModal({ editing, form, saving, onChange, onSubmit, onClose }) {
    return (
        <ModalShell
            title={editing ? "Edit article" : "Create new article"}
            subtitle="Add your article information below."
            onClose={onClose}
        >
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
        </ModalShell>
    );
}

function CommentDetailModal({ comment, articleTitle, deleting, onDelete, onClose }) {
    return (
        <ModalShell
            title="Comment"
            subtitle={`On "${articleTitle}"`}
            onClose={onClose}
            maxWidth="max-w-xl"
        >
            <div className="p-6">
                <div className="flex items-center gap-3">
                    <Avatar name={comment.author_name} />
                    <div>
                        <p className="font-semibold text-stone-900">
                            {comment.author_name || "Unknown user"}
                        </p>
                        <p className="text-xs text-stone-400">{formatDate(comment.created_at)}</p>
                    </div>
                </div>

                <p className="mt-5 whitespace-pre-wrap break-words text-sm leading-7 text-stone-700">
                    {comment.content}
                </p>

                <div className="mt-6 flex justify-end gap-3 border-t border-stone-200 pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-full border border-stone-300 hover:border-stone-900 text-sm font-medium transition"
                    >
                        Close
                    </button>
                    <button
                        type="button"
                        onClick={onDelete}
                        disabled={deleting}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition disabled:opacity-60"
                    >
                        {deleting ? (
                            <LoaderCircle size={16} className="animate-spin" />
                        ) : (
                            <Trash2 size={16} />
                        )}
                        Delete comment
                    </button>
                </div>
            </div>
        </ModalShell>
    );
}

/* ---------- Sidebar ---------- */

function Sidebar({ items, active, onSelect, stats, open, onClose }) {
    return (
        <>
            {open && (
                <div
                    className="fixed inset-x-0 bottom-0 z-30 bg-stone-950/40 lg:hidden"
                    style={{ top: NAVBAR_HEIGHT }}
                    onClick={onClose}
                    aria-hidden="true"
                />
            )}

            <aside
                style={{ top: NAVBAR_HEIGHT, height: `calc(100vh - ${NAVBAR_HEIGHT}px)` }}
                className={`fixed left-0 z-40 flex w-64 flex-col border-r border-stone-200 bg-white transition-transform duration-200 lg:translate-x-0 ${
                    open ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                <div className="flex h-16 items-center justify-between border-b border-stone-200 px-5">
                    <Link
                        to="/"
                        onClick={onClose}
                        title="Go to home page"
                        className="flex items-center gap-2.5 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600/40"
                    >
                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-stone-900 text-white">
                            <PenLine size={18} />
                        </span>
                        <div className="leading-tight">
                            <p className="font-serif text-base font-bold text-stone-900">Blog Admin</p>
                            <p className="text-xs text-stone-400">Content manager</p>
                        </div>
                    </Link>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close menu"
                        className="rounded-lg p-2 text-stone-500 hover:bg-stone-100 lg:hidden"
                    >
                        <X size={19} />
                    </button>
                </div>

                <nav className="flex-1 overflow-y-auto px-3 py-5">
                    <p className="px-3 pb-2 text-xs font-medium text-stone-400">Menu</p>
                    <ul className="space-y-1">
                        {items.map(({ id, label, icon: Icon, count }) => {
                            const isActive = active === id;

                            return (
                                <li key={id}>
                                    <button
                                        type="button"
                                        onClick={() => onSelect(id)}
                                        aria-current={isActive ? "page" : undefined}
                                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                                            isActive
                                                ? "bg-indigo-50 text-indigo-700"
                                                : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
                                        }`}
                                    >
                                        <Icon size={18} />
                                        <span className="flex-1 text-left">{label}</span>
                                        {count !== undefined && (
                                            <span
                                                className={`min-w-6 rounded-full px-2 py-0.5 text-center text-xs font-semibold ${
                                                    isActive
                                                        ? "bg-indigo-600 text-white"
                                                        : "bg-stone-100 text-stone-600"
                                                }`}
                                            >
                                                {count}
                                            </span>
                                        )}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>

                    <p className="px-3 pb-2 pt-7 text-xs font-medium text-stone-400">At a glance</p>
                    <dl className="space-y-1 px-3 text-sm">
                        {stats.map(({ label, value, dot }) => (
                            <div key={label} className="flex items-center justify-between py-1.5">
                                <dt className="flex items-center gap-2 text-stone-500">
                                    <span className={`h-2 w-2 rounded-full ${dot}`} />
                                    {label}
                                </dt>
                                <dd className="font-semibold text-stone-900">{value}</dd>
                            </div>
                        ))}
                    </dl>
                </nav>
            </aside>
        </>
    );
}

/* ---------- Page ---------- */

const PAGE_TITLES = {
    overview: {
        title: "Overview",
        text: "A summary of your blog's content and reader engagement.",
    },
    articles: { title: "Articles", text: "Create, edit and publish your blog posts." },
    likes: { title: "Likes", text: "See which articles readers like the most." },
    comments: { title: "Comments", text: "Review and moderate comments from readers." },
};

function AdminDashboard() {
    // Navigation
    const [activeTab, setActiveTab] = useState("overview");
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Articles
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [articleSearch, setArticleSearch] = useState("");
    const [articleStatus, setArticleStatus] = useState("ALL");
    const [articlePage, setArticlePage] = useState(1);

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

    // Comment management
    const [commentSearch, setCommentSearch] = useState("");
    const [commentArticle, setCommentArticle] = useState("ALL");
    const [commentSort, setCommentSort] = useState("newest");
    const [commentPage, setCommentPage] = useState(1);
    const [selectedIds, setSelectedIds] = useState([]);
    const [viewingComment, setViewingComment] = useState(null);
    const [bulkDeleting, setBulkDeleting] = useState(false);

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
                total_likes: Number(response.data?.total_likes || 0),
                blogs: Array.isArray(response.data?.blogs) ? response.data.blogs : [],
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

    // Reset to the first page whenever a filter changes
    useEffect(() => setArticlePage(1), [articleSearch, articleStatus]);
    useEffect(() => setCommentPage(1), [commentSearch, commentArticle, commentSort]);

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

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (saving) return;

        const title = form.title.trim();
        const content = form.content.trim();

        if (!title || !content) {
            toast.error("Please enter both the article title and content.");
            return;
        }

        try {
            setSaving(true);

            const formData = new FormData();
            formData.append("title", title);
            formData.append("content", content);
            formData.append("status", form.status);

            if (form.featured_image instanceof File) {
                formData.append("featured_image", form.featured_image);
            }

            const config = {
                headers: {
                    // Overrides a global application/json default.
                    // Axios/browser adds the multipart boundary.
                    "Content-Type": "multipart/form-data",
                },
            };

            if (editingBlog) {
                await api.patch(`/blogs/admin/${editingBlog.slug}/update/`, formData, config);
                toast.success("Article updated successfully.");
            } else {
                await api.post("/blogs/admin/create/", formData, config);
                toast.success("Article created successfully.");
            }

            closeForm();
            await fetchBlogs();
        } catch (error) {
            console.error(
                "Blog submission failed:",
                error.response?.status,
                error.response?.data || error
            );
            toast.error(getApiErrorMessage(error));
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
            setSelectedIds((previous) => previous.filter((id) => id !== comment.id));
            setViewingComment(null);
            toast.success("Comment deleted successfully.");
        } catch (error) {
            console.error("Failed to delete comment:", error);
            toast.error(error.response?.data?.detail || "Unable to delete this comment.");
        } finally {
            setDeletingCommentId(null);
        }
    };

    const handleBulkDeleteComments = async () => {
        if (selectedIds.length === 0) return;

        const count = selectedIds.length;
        if (
            !window.confirm(
                `Delete ${count} selected ${count === 1 ? "comment" : "comments"}? This cannot be undone.`
            )
        ) {
            return;
        }

        try {
            setBulkDeleting(true);

            const results = await Promise.allSettled(
                selectedIds.map((id) => api.delete(`/blogs/admin/comments/${id}/delete/`))
            );

            const deleted = selectedIds.filter((_, index) => results[index].status === "fulfilled");
            const failed = count - deleted.length;

            setComments((previous) => previous.filter((item) => !deleted.includes(item.id)));
            setSelectedIds((previous) => previous.filter((id) => !deleted.includes(id)));

            if (deleted.length) {
                toast.success(
                    `${deleted.length} ${deleted.length === 1 ? "comment" : "comments"} deleted.`
                );
            }
            if (failed) {
                toast.error(`${failed} ${failed === 1 ? "comment" : "comments"} could not be deleted.`);
            }
        } finally {
            setBulkDeleting(false);
        }
    };

    /* ----- Derived data ----- */

    const totalCount = blogs.length;
    const publishedCount = blogs.filter((blog) => blog.status === "PUBLISHED").length;
    const draftCount = blogs.filter((blog) => blog.status === "DRAFT").length;
    const publishedPercentage =
        totalCount > 0 ? Math.round((publishedCount / totalCount) * 100) : 0;

    const recentBlogs = useMemo(
        () =>
            [...blogs]
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                .slice(0, 5),
        [blogs]
    );

    const sortedLikes = useMemo(
        () => [...likesData.blogs].sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0)),
        [likesData.blogs]
    );

    const getCommentBlogId = (comment) =>
        typeof comment.blog === "object" ? comment.blog?.id : comment.blog;

    const getCommentBlogTitle = (comment) => {
        const blog = blogs.find((item) => String(item.id) === String(getCommentBlogId(comment)));
        return blog?.title || comment.blog?.title || "Unknown article";
    };

    // Articles table
    const filteredBlogs = useMemo(() => {
        const query = articleSearch.trim().toLowerCase();

        return blogs.filter((blog) => {
            const matchesStatus = articleStatus === "ALL" || blog.status === articleStatus;
            const matchesQuery =
                !query ||
                (blog.title || "").toLowerCase().includes(query) ||
                (blog.slug || "").toLowerCase().includes(query);

            return matchesStatus && matchesQuery;
        });
    }, [blogs, articleSearch, articleStatus]);

    const visibleBlogs = paginate(filteredBlogs, articlePage, ARTICLES_PER_PAGE);

    // Comments table
    const filteredComments = useMemo(() => {
        const query = commentSearch.trim().toLowerCase();

        return comments
            .filter((comment) => {
                const matchesArticle =
                    commentArticle === "ALL" ||
                    String(getCommentBlogId(comment)) === String(commentArticle);
                const matchesQuery =
                    !query ||
                    (comment.author_name || "").toLowerCase().includes(query) ||
                    (comment.content || "").toLowerCase().includes(query);

                return matchesArticle && matchesQuery;
            })
            .sort((a, b) => {
                const diff = new Date(b.created_at) - new Date(a.created_at);
                return commentSort === "newest" ? diff : -diff;
            });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [comments, commentSearch, commentArticle, commentSort]);

    const visibleComments = paginate(filteredComments, commentPage, COMMENTS_PER_PAGE);
    const visibleCommentIds = visibleComments.map((comment) => comment.id);
    const allVisibleSelected =
        visibleCommentIds.length > 0 && visibleCommentIds.every((id) => selectedIds.includes(id));

    const toggleSelectAllVisible = () => {
        setSelectedIds((previous) =>
            allVisibleSelected
                ? previous.filter((id) => !visibleCommentIds.includes(id))
                : [...new Set([...previous, ...visibleCommentIds])]
        );
    };

    const toggleSelected = (id) => {
        setSelectedIds((previous) =>
            previous.includes(id) ? previous.filter((item) => item !== id) : [...previous, id]
        );
    };

    const commentCountByBlog = useMemo(() => {
        const map = {};
        comments.forEach((comment) => {
            const id = String(getCommentBlogId(comment));
            map[id] = (map[id] || 0) + 1;
        });
        return map;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [comments]);

    // Sidebar data
    const navItems = [
        { id: "overview", label: "Overview", icon: LayoutDashboard },
        { id: "articles", label: "Articles", icon: FileText, count: totalCount },
        { id: "likes", label: "Likes", icon: Heart, count: likesData.total_likes },
        { id: "comments", label: "Comments", icon: MessageCircle, count: comments.length },
    ];

    const sidebarStats = [
        { label: "Total articles", value: totalCount, dot: "bg-stone-400" },
        { label: "Published", value: publishedCount, dot: "bg-green-500" },
        { label: "Drafts", value: draftCount, dot: "bg-amber-500" },
        { label: "Total likes", value: likesData.total_likes, dot: "bg-rose-500" },
        { label: "Total comments", value: comments.length, dot: "bg-indigo-500" },
    ];

    const selectTab = (id) => {
        setActiveTab(id);
        setSidebarOpen(false);
        window.scrollTo({ top: 0 });
    };

    const refreshAction = (
        <button
            type="button"
            onClick={fetchEngagement}
            disabled={engagementLoading}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full border border-stone-300 hover:border-stone-900 text-sm font-medium transition disabled:opacity-50"
        >
            <RefreshCw size={16} className={engagementLoading ? "animate-spin" : ""} />
            Refresh
        </button>
    );

    /* ----- Tab views ----- */

    const overviewView = (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                <StatCard icon={FileText} label="Total articles" value={totalCount} />
                <StatCard icon={Eye} label="Published" value={publishedCount} iconClass="text-green-600" />
                <StatCard icon={Heart} label="Total likes" value={likesData.total_likes} iconClass="text-rose-500" />
                <StatCard
                    icon={MessageCircle}
                    label="Total comments"
                    value={comments.length}
                    iconClass="text-indigo-500"
                />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <Section
                    title="Publication overview"
                    description="How many of your articles are published."
                    className="xl:col-span-1"
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

                <Section
                    title="Recently created"
                    description="Your five newest articles."
                    className="xl:col-span-2"
                    action={
                        <button
                            type="button"
                            onClick={() => selectTab("articles")}
                            className="text-sm font-medium text-indigo-700 hover:underline"
                        >
                            View all articles
                        </button>
                    }
                >
                    {loading ? (
                        <Spinner size={26} />
                    ) : recentBlogs.length === 0 ? (
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
                                    <div className="min-w-0">
                                        <h3 className="font-semibold truncate">{blog.title}</h3>
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
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <Section
                    title="Most liked"
                    description="Your top performing articles."
                    action={
                        <button
                            type="button"
                            onClick={() => selectTab("likes")}
                            className="text-sm font-medium text-indigo-700 hover:underline"
                        >
                            See all
                        </button>
                    }
                >
                    {engagementLoading ? (
                        <Spinner size={26} />
                    ) : sortedLikes.length === 0 ? (
                        <p className="text-sm text-stone-500 py-4 text-center">No likes yet.</p>
                    ) : (
                        <ul className="space-y-4">
                            {sortedLikes.slice(0, 5).map((blog) => {
                                const share =
                                    likesData.total_likes > 0
                                        ? Math.round(((blog.likes_count || 0) / likesData.total_likes) * 100)
                                        : 0;

                                return (
                                    <li key={blog.id}>
                                        <div className="flex items-center justify-between gap-3 text-sm">
                                            <span className="font-medium truncate">{blog.title}</span>
                                            <span className="inline-flex items-center gap-1.5 font-semibold text-rose-600">
                                                <Heart size={14} />
                                                {blog.likes_count || 0}
                                            </span>
                                        </div>
                                        <div className="mt-2 h-2 rounded-full bg-stone-100 overflow-hidden">
                                            <div
                                                className="h-full rounded-full bg-rose-500"
                                                style={{ width: `${share}%` }}
                                            />
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </Section>

                <Section
                    title="Latest comments"
                    description="The newest reader feedback."
                    action={
                        <button
                            type="button"
                            onClick={() => selectTab("comments")}
                            className="text-sm font-medium text-indigo-700 hover:underline"
                        >
                            Manage comments
                        </button>
                    }
                >
                    {engagementLoading ? (
                        <Spinner size={26} />
                    ) : comments.length === 0 ? (
                        <p className="text-sm text-stone-500 py-4 text-center">No comments yet.</p>
                    ) : (
                        <ul className="divide-y divide-stone-100">
                            {[...comments]
                                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                                .slice(0, 4)
                                .map((comment) => (
                                    <li key={comment.id} className="flex gap-3 py-3 first:pt-0 last:pb-0">
                                        <Avatar name={comment.author_name} />
                                        <div className="min-w-0">
                                            <p className="text-sm">
                                                <span className="font-semibold">
                                                    {comment.author_name || "Unknown user"}
                                                </span>
                                                <span className="text-stone-400">
                                                    {" "}
                                                    on {getCommentBlogTitle(comment)}
                                                </span>
                                            </p>
                                            <p className="mt-1 line-clamp-2 text-sm text-stone-600">
                                                {comment.content}
                                            </p>
                                        </div>
                                    </li>
                                ))}
                        </ul>
                    )}
                </Section>
            </div>
        </div>
    );

    const articlesView = (
        <section className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
            <div className="flex flex-col lg:flex-row gap-3 p-4 border-b border-stone-200">
                <SearchInput
                    value={articleSearch}
                    onChange={setArticleSearch}
                    placeholder="Search by title or slug"
                />
                <select
                    value={articleStatus}
                    onChange={(e) => setArticleStatus(e.target.value)}
                    aria-label="Filter by status"
                    className={`${toolbarInputClass} lg:w-48 px-3`}
                >
                    <option value="ALL">All statuses</option>
                    <option value="PUBLISHED">Published</option>
                    <option value="DRAFT">Draft</option>
                </select>
            </div>

            {loading ? (
                <Spinner size={34} />
            ) : blogs.length === 0 ? (
                <EmptyState
                    icon={FileText}
                    title="No articles yet"
                    text="Create your first article to get started."
                />
            ) : filteredBlogs.length === 0 ? (
                <EmptyState
                    icon={Search}
                    title="No matching articles"
                    text="Try a different search or status filter."
                />
            ) : (
                <>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-stone-50 text-stone-500 text-sm">
                                <tr>
                                    <th className="px-6 py-4 font-medium">Article</th>
                                    <th className="px-6 py-4 font-medium">Author</th>
                                    <th className="px-6 py-4 font-medium">Status</th>
                                    <th className="px-6 py-4 font-medium">Comments</th>
                                    <th className="px-6 py-4 font-medium">Date</th>
                                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-stone-100">
                                {visibleBlogs.map((blog) => (
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

                                        <td className="px-6 py-4 text-sm text-stone-600">
                                            {commentCountByBlog[String(blog.id)] || 0}
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

                    <Pagination
                        page={articlePage}
                        pageSize={ARTICLES_PER_PAGE}
                        total={filteredBlogs.length}
                        onPage={setArticlePage}
                    />
                </>
            )}
        </section>
    );

    const likesView = (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <StatCard icon={Heart} label="Total likes" value={likesData.total_likes} iconClass="text-rose-500" />
                <StatCard icon={FileText} label="Articles with likes" value={sortedLikes.filter((b) => (b.likes_count || 0) > 0).length} />
                <StatCard
                    icon={Heart}
                    label="Average per article"
                    value={
                        sortedLikes.length > 0
                            ? (likesData.total_likes / sortedLikes.length).toFixed(1)
                            : 0
                    }
                />
            </div>

            <Section
                title="Likes by article"
                description="Ranked from most to least liked."
                action={refreshAction}
            >
                {engagementLoading ? (
                    <Spinner size={28} />
                ) : sortedLikes.length === 0 ? (
                    <EmptyState icon={Heart} title="No like information available" />
                ) : (
                    <div className="overflow-x-auto -mx-6">
                        <table className="w-full text-left">
                            <thead className="bg-stone-50 text-stone-500 text-sm">
                                <tr>
                                    <th className="px-6 py-3 font-medium">Article</th>
                                    <th className="px-6 py-3 font-medium">Likes</th>
                                    <th className="px-6 py-3 font-medium min-w-48">Share of all likes</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100">
                                {sortedLikes.map((blog) => {
                                    const share =
                                        likesData.total_likes > 0
                                            ? Math.round(
                                                  ((blog.likes_count || 0) / likesData.total_likes) * 100
                                              )
                                            : 0;

                                    return (
                                        <tr key={blog.id}>
                                            <td className="px-6 py-4 font-semibold">{blog.title}</td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center gap-2 text-rose-600 font-semibold">
                                                    <Heart size={16} />
                                                    {blog.likes_count || 0}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-2 flex-1 rounded-full bg-stone-100 overflow-hidden">
                                                        <div
                                                            className="h-full rounded-full bg-rose-500"
                                                            style={{ width: `${share}%` }}
                                                        />
                                                    </div>
                                                    <span className="w-10 text-right text-sm text-stone-500">
                                                        {share}%
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </Section>
        </div>
    );

    const commentsView = (
        <section className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
            {/* Toolbar */}
            <div className="flex flex-col gap-3 p-4 border-b border-stone-200">
                <div className="flex flex-col lg:flex-row gap-3">
                    <SearchInput
                        value={commentSearch}
                        onChange={setCommentSearch}
                        placeholder="Search by reader or comment text"
                    />
                    <select
                        value={commentArticle}
                        onChange={(e) => setCommentArticle(e.target.value)}
                        aria-label="Filter by article"
                        className={`${toolbarInputClass} lg:w-64 px-3`}
                    >
                        <option value="ALL">All articles</option>
                        {blogs.map((blog) => (
                            <option key={blog.id} value={blog.id}>
                                {blog.title}
                            </option>
                        ))}
                    </select>
                    <select
                        value={commentSort}
                        onChange={(e) => setCommentSort(e.target.value)}
                        aria-label="Sort comments"
                        className={`${toolbarInputClass} lg:w-40 px-3`}
                    >
                        <option value="newest">Newest first</option>
                        <option value="oldest">Oldest first</option>
                    </select>
                    {refreshAction}
                </div>

                {selectedIds.length > 0 && (
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-lg bg-indigo-50 px-4 py-2.5">
                        <p className="text-sm font-medium text-indigo-800">
                            {selectedIds.length} selected
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setSelectedIds([])}
                                className="px-3 py-1.5 rounded-lg text-sm font-medium text-stone-600 hover:bg-white transition"
                            >
                                Clear
                            </button>
                            <button
                                type="button"
                                onClick={handleBulkDeleteComments}
                                disabled={bulkDeleting}
                                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-sm font-medium text-white transition disabled:opacity-60"
                            >
                                {bulkDeleting ? (
                                    <LoaderCircle size={15} className="animate-spin" />
                                ) : (
                                    <Trash2 size={15} />
                                )}
                                Delete selected
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {engagementLoading ? (
                <Spinner size={32} />
            ) : comments.length === 0 ? (
                <EmptyState
                    icon={MessageCircle}
                    title="No comments yet"
                    text="Comments from readers will appear here."
                />
            ) : filteredComments.length === 0 ? (
                <EmptyState
                    icon={Search}
                    title="No matching comments"
                    text="Try a different search or article filter."
                />
            ) : (
                <>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-stone-50 text-stone-500 text-sm">
                                <tr>
                                    <th className="w-12 px-4 py-3">
                                        <input
                                            type="checkbox"
                                            checked={allVisibleSelected}
                                            onChange={toggleSelectAllVisible}
                                            aria-label="Select all comments on this page"
                                            className="h-4 w-4 rounded border-stone-300 text-indigo-600 focus:ring-indigo-600"
                                        />
                                    </th>
                                    <th className="px-4 py-3 font-medium">Reader</th>
                                    <th className="px-4 py-3 font-medium min-w-72">Comment</th>
                                    <th className="px-4 py-3 font-medium min-w-48">Article</th>
                                    <th className="px-4 py-3 font-medium whitespace-nowrap">Date</th>
                                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-stone-100">
                                {visibleComments.map((comment) => {
                                    const selected = selectedIds.includes(comment.id);

                                    return (
                                        <tr
                                            key={comment.id}
                                            className={`transition ${
                                                selected ? "bg-indigo-50/60" : "hover:bg-stone-50"
                                            }`}
                                        >
                                            <td className="px-4 py-4 align-top">
                                                <input
                                                    type="checkbox"
                                                    checked={selected}
                                                    onChange={() => toggleSelected(comment.id)}
                                                    aria-label={`Select comment by ${comment.author_name || "unknown user"}`}
                                                    className="h-4 w-4 rounded border-stone-300 text-indigo-600 focus:ring-indigo-600"
                                                />
                                            </td>

                                            <td className="px-4 py-4 align-top">
                                                <div className="flex items-center gap-3">
                                                    <Avatar name={comment.author_name} />
                                                    <span className="text-sm font-semibold whitespace-nowrap">
                                                        {comment.author_name || "Unknown user"}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="px-4 py-4 align-top">
                                                <button
                                                    type="button"
                                                    onClick={() => setViewingComment(comment)}
                                                    className="text-left text-sm leading-6 text-stone-600 line-clamp-2 break-words hover:text-stone-900"
                                                    title="Open full comment"
                                                >
                                                    {comment.content}
                                                </button>
                                            </td>

                                            <td className="px-4 py-4 align-top text-sm text-indigo-700 font-medium">
                                                <span className="line-clamp-2">
                                                    {getCommentBlogTitle(comment)}
                                                </span>
                                            </td>

                                            <td className="px-4 py-4 align-top text-sm text-stone-500 whitespace-nowrap">
                                                {formatDate(comment.created_at)}
                                            </td>

                                            <td className="px-4 py-4 align-top">
                                                <div className="flex justify-end items-center gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => setViewingComment(comment)}
                                                        title="View comment"
                                                        aria-label="View comment"
                                                        className="p-2 rounded-lg text-stone-600 hover:bg-stone-100 transition"
                                                    >
                                                        <Eye size={18} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteComment(comment)}
                                                        disabled={deletingCommentId === comment.id}
                                                        title="Delete comment"
                                                        aria-label="Delete comment"
                                                        className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition disabled:opacity-50"
                                                    >
                                                        {deletingCommentId === comment.id ? (
                                                            <LoaderCircle size={18} className="animate-spin" />
                                                        ) : (
                                                            <Trash2 size={18} />
                                                        )}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    <Pagination
                        page={commentPage}
                        pageSize={COMMENTS_PER_PAGE}
                        total={filteredComments.length}
                        onPage={setCommentPage}
                    />
                </>
            )}
        </section>
    );

    const views = {
        overview: overviewView,
        articles: articlesView,
        likes: likesView,
        comments: commentsView,
    };

    /* ----- Render ----- */

    return (
        <div className="min-h-screen bg-stone-50 text-stone-900">
            <Sidebar
                items={navItems}
                active={activeTab}
                onSelect={selectTab}
                stats={sidebarStats}
                open={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            <div className="lg:pl-64">
                {/* Top bar */}
                <header
                    style={{ top: NAVBAR_HEIGHT }}
                    className="sticky z-20 flex h-16 items-center justify-between gap-4 border-b border-stone-200 bg-white/90 px-4 backdrop-blur md:px-8">
                    <div className="flex items-center gap-3 min-w-0">
                        <button
                            type="button"
                            onClick={() => setSidebarOpen(true)}
                            aria-label="Open menu"
                            className="rounded-lg p-2 text-stone-600 hover:bg-stone-100 lg:hidden"
                        >
                            <Menu size={21} />
                        </button>
                        <h1 className="font-serif text-xl font-bold truncate">
                            {PAGE_TITLES[activeTab].title}
                        </h1>
                    </div>

                    <button
                        type="button"
                        onClick={openCreateForm}
                        className="inline-flex items-center justify-center gap-2 bg-stone-900 hover:bg-stone-700 text-white px-5 py-2.5 rounded-full text-sm font-medium transition"
                    >
                        <Plus size={18} />
                        <span className="hidden sm:inline">Create article</span>
                        <span className="sm:hidden">New</span>
                    </button>
                </header>

                <main className="mx-auto max-w-6xl px-4 py-8 md:px-8">
                    <p className="mb-6 text-stone-600">{PAGE_TITLES[activeTab].text}</p>
                    {views[activeTab]}
                </main>
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

            {viewingComment && (
                <CommentDetailModal
                    comment={viewingComment}
                    articleTitle={getCommentBlogTitle(viewingComment)}
                    deleting={deletingCommentId === viewingComment.id}
                    onDelete={() => handleDeleteComment(viewingComment)}
                    onClose={() => setViewingComment(null)}
                />
            )}
        </div>
    );
}

export default AdminDashboard;