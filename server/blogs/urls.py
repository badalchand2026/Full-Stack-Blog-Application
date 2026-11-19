
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
    AdminLikeOverviewView,
    AdminCommentListView,
    AdminCommentDeleteView,
)

urlpatterns = [
    # Public APIs
    path("", BlogListView.as_view(), name="blog-list"),

    # Admin Blog APIs
    path("admin/", AdminBlogListView.as_view(), name="admin-blog-list"),
    path("admin/create/", BlogCreateView.as_view(), name="blog-create"),
    path("admin/<slug:slug>/update/", BlogUpdateView.as_view(), name="blog-update"),
    path("admin/<slug:slug>/delete/", BlogDeleteView.as_view(), name="blog-delete"),

    # Admin Like and Comment APIs
    path("admin/likes/", AdminLikeOverviewView.as_view(), name="admin-like-overview"),
    path("admin/comments/", AdminCommentListView.as_view(), name="admin-comment-list"),
    path(
        "admin/comments/<int:pk>/delete/",
        AdminCommentDeleteView.as_view(),
        name="admin-comment-delete"
    ),

    # Comment APIs
    path("<slug:slug>/comments/", CommentListView.as_view(), name="comment-list"),
    path("<slug:slug>/comments/create/", CommentCreateView.as_view(), name="comment-create"),
    path("comments/<int:pk>/", CommentDetailView.as_view(), name="comment-detail"),

    # Like APIs
    path("<slug:slug>/like/", BlogLikeView.as_view(), name="blog-like"),
    path("<slug:slug>/likes/", BlogLikeCountView.as_view(), name="blog-like-count"),

    # Public Blog Detail
    path("<slug:slug>/", BlogDetailView.as_view(), name="blog-detail"),
]
