
from django.contrib import admin
from .models import Blog
from .models import Comment
from .models import Like


@admin.register(Blog)
class BlogAdmin(admin.ModelAdmin):

    list_display = [
        "title",
        "author",
        "status",
        "created_at",
        "published_at",
    ]

    list_filter = [
        "status",
        "created_at",
    ]

    search_fields = [
        "title",
        "content",
        "author__email",
    ]

    prepopulated_fields = {
        "slug": ("title",)
    }

    readonly_fields = [
        "created_at",
        "updated_at",
        "published_at",
    ]

    ordering = ["-created_at"]



@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ["id", "blog", "author", "created_at"]
    search_fields = ["content", "author__email", "blog__title"]
    list_filter = ["created_at"]
    readonly_fields = ["created_at", "updated_at"]





@admin.register(Like)
class LikeAdmin(admin.ModelAdmin):
    list_display = ["id", "blog", "user", "created_at"]
    search_fields = ["blog__title", "user__email"]
    list_filter = ["created_at"]
    readonly_fields = ["created_at"]