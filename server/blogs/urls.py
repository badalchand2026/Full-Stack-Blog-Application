from django.urls import path

from .views import (
    BlogListView,
    BlogDetailView,
    AdminBlogListView,
    BlogCreateView,
    BlogUpdateView,
    BlogDeleteView,
    CommentListView,
    CommentCreateView,
    CommentDetailView,
    BlogLikeView,
    BlogLikeCountView,
)

urlpatterns = [
    # Public APIs
    path("", BlogListView.as_view(), name="blog-list"),

    # Admin APIs - keep these before the slug route
    path("admin/", AdminBlogListView.as_view(), name="admin-blog-list"),
    path("admin/create/", BlogCreateView.as_view(), name="blog-create"),
    path("admin/<slug:slug>/update/", BlogUpdateView.as_view(), name="blog-update"),
    path("admin/<slug:slug>/delete/", BlogDeleteView.as_view(), name="blog-delete"),

    # Public blog detail - keep this last
    path("<slug:slug>/", BlogDetailView.as_view(), name="blog-detail"),

    # Comment APIs
    path("<slug:slug>/comments/", CommentListView.as_view(), name="comment-list"),
    path("<slug:slug>/comments/create/", CommentCreateView.as_view(), name="comment-create"),
    path("comments/<int:pk>/", CommentDetailView.as_view(), name="comment-detail"),

    # Like APIs
    path("<slug:slug>/like/", BlogLikeView.as_view(), name="blog-like"),
    path("<slug:slug>/likes/", BlogLikeCountView.as_view(), name="blog-like-count"),

]
