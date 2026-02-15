from __future__ import annotations

from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.community import PostCategory
from app.schemas.build import BuildResponse


class PostAuthor(BaseModel):
    id: int
    nickname: Optional[str] = None
    profile_image: Optional[str] = None

    class Config:
        from_attributes = True


class PostCreate(BaseModel):
    title: str
    content: str
    category: PostCategory
    build_id: Optional[int] = None


class PostUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    category: Optional[PostCategory] = None


class PostListItem(BaseModel):
    id: int
    title: str
    category: PostCategory
    like_count: int
    is_liked: bool = False
    comment_count: int = 0
    author: PostAuthor
    build: Optional[BuildResponse] = None
    created_at: datetime

    class Config:
        from_attributes = True


class CommentAuthor(BaseModel):
    id: int
    nickname: Optional[str] = None
    profile_image: Optional[str] = None

    class Config:
        from_attributes = True


class CommentResponse(BaseModel):
    id: int
    content: str
    author: CommentAuthor
    parent_comment_id: Optional[int] = None
    replies: list[CommentResponse] = []
    created_at: datetime

    class Config:
        from_attributes = True


class CommentCreate(BaseModel):
    content: str
    parent_comment_id: Optional[int] = None


class PostResponse(BaseModel):
    id: int
    title: str
    content: str
    category: PostCategory
    like_count: int
    is_liked: bool = False
    comment_count: int = 0
    author: PostAuthor
    build: Optional[BuildResponse] = None
    comments: list[CommentResponse] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PostLikeResponse(BaseModel):
    liked: bool
    like_count: int


class MyCommentResponse(BaseModel):
    id: int
    content: str
    post_id: int
    post_title: str
    parent_comment_id: Optional[int] = None
    reply_count: int = 0
    created_at: datetime


CommentResponse.model_rebuild()
