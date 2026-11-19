
from rest_framework import serializers
from .models import Blog
from .models import Comment

class BlogSerializer(serializers.ModelSerializer):

    author_name = serializers.CharField(
        source="author.full_name",
        read_only=True
    )

    class Meta:
        model = Blog

        fields = [
            "id",
            "title",
            "slug",
            "content",
            "featured_image",
            "author",
            "author_name",
            "status",
            "created_at",
            "updated_at",
            "published_at",
        ]

        read_only_fields = [
            "id",
            "slug",
            "author",
            "author_name",
            "created_at",
            "updated_at",
            "published_at",
        ]







class CommentSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(
        source="author.full_name",
        read_only=True
    )

    class Meta:
        model = Comment

        fields = [
            "id",
            "blog",
            "author",
            "author_name",
            "content",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "blog",
            "author",
            "author_name",
            "created_at",
            "updated_at",
        ]
