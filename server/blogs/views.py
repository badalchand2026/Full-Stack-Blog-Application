
from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAuthenticated

from .models import Blog
from .serializers import BlogSerializer
from users.permissions import IsAdminUser
from .models import Comment

from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.exceptions import PermissionDenied

from .models import Blog, Comment
from .serializers import BlogSerializer, CommentSerializer

from users.permissions import IsAdminUser

from django.shortcuts import get_object_or_404

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .models import Like

from .models import Blog, Comment, Like
from django.db.models import Count



# Public API: View published blogs
class BlogListView(generics.ListAPIView):
    serializer_class = BlogSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return Blog.objects.filter(status=Blog.Status.PUBLISHED)


# Public API: View a single published blog
class BlogDetailView(generics.RetrieveAPIView):
    serializer_class = BlogSerializer
    permission_classes = [AllowAny]
    lookup_field = "slug"

    def get_queryset(self):
        return Blog.objects.filter(status=Blog.Status.PUBLISHED)


# Admin API: View all blogs, including drafts
class AdminBlogListView(generics.ListAPIView):
    serializer_class = BlogSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]

    queryset = Blog.objects.all()


# Admin API: Create a blog
class BlogCreateView(generics.CreateAPIView):
    serializer_class = BlogSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)


# Admin API: Update a blog
class BlogUpdateView(generics.UpdateAPIView):
    serializer_class = BlogSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    queryset = Blog.objects.all()
    lookup_field = "slug"


# Admin API: Delete a blog
class BlogDeleteView(generics.DestroyAPIView):
    permission_classes = [IsAuthenticated, IsAdminUser]
    queryset = Blog.objects.all()
    lookup_field = "slug"



# Public API: View comments for a published blog
class CommentListView(generics.ListAPIView):
    serializer_class = CommentSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return Comment.objects.filter(
            blog__slug=self.kwargs["slug"],
            blog__status=Blog.Status.PUBLISHED
        )


# Authenticated API: Create a comment
class CommentCreateView(generics.CreateAPIView):
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        blog = generics.get_object_or_404(
            Blog,
            slug=self.kwargs["slug"],
            status=Blog.Status.PUBLISHED
        )

        serializer.save(
            blog=blog,
            author=self.request.user
        )


# Authenticated API: Update or delete a comment
class CommentDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Comment.objects.select_related("author", "blog")

    def get_object(self):
        comment = super().get_object()

        if (
            comment.author_id != self.request.user.id
            and self.request.user.role != "ADMIN"
        ):
            raise PermissionDenied(
                "You can only modify your own comments."
            )

        return comment



# API: Like and unlike a published blog
class BlogLikeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, slug):
        blog = get_object_or_404(
            Blog,
            slug=slug,
            status=Blog.Status.PUBLISHED
        )

        like, created = Like.objects.get_or_create(
            blog=blog,
            user=request.user
        )

        if created:
            message = "Blog liked successfully."
        else:
            message = "You have already liked this blog."

        return Response(
            {
                "success": True,
                "message": message,
                "liked": True,
                "likes_count": blog.likes.count()
            },
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK
        )

    def delete(self, request, slug):
        blog = get_object_or_404(
            Blog,
            slug=slug,
            status=Blog.Status.PUBLISHED
        )

        deleted_count, _ = Like.objects.filter(
            blog=blog,
            user=request.user
        ).delete()

        if deleted_count:
            message = "Blog unliked successfully."
        else:
            message = "You have not liked this blog."

        return Response(
            {
                "success": True,
                "message": message,
                "liked": False,
                "likes_count": blog.likes.count()
            },
            status=status.HTTP_200_OK
        )


# Public API: View blog like count
class BlogLikeCountView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, slug):
        blog = get_object_or_404(
            Blog,
            slug=slug,
            status=Blog.Status.PUBLISHED
        )

        return Response(
            {
                "success": True,
                "blog": blog.title,
                "likes_count": blog.likes.count()
            },
            status=status.HTTP_200_OK
        )




# ==========================================
# ADMIN: LIKE MANAGEMENT
# ==========================================


class AdminLikeOverviewView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        blogs = Blog.objects.annotate(
            likes_count=Count("likes")
        ).values(
            "id",
            "title",
            "slug",
            "likes_count"
        )

        total_likes = Like.objects.count()

        return Response(
            {
                "success": True,
                "total_likes": total_likes,
                "blogs": list(blogs)
            },
            status=status.HTTP_200_OK
        )


# ==========================================
# ADMIN: COMMENT MANAGEMENT
# ==========================================

class AdminCommentListView(generics.ListAPIView):
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]

    queryset = Comment.objects.select_related(
        "author",
        "blog"
    ).all()


class AdminCommentDeleteView(generics.DestroyAPIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    queryset = Comment.objects.all()
