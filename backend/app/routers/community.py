from typing import List, Optional

import sqlalchemy as sa
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func as sa_func
from sqlalchemy.orm import Session, joinedload, subqueryload

from app.database import get_db
from app.auth import get_current_user, get_optional_user
from app.models.user import User
from app.models.build import Build
from app.models.parts import PCB, Case, Plate
from app.models.community import Post, Comment, PostLike, PostCategory
from app.schemas.community import (
    PostCreate, PostUpdate, PostListItem, PostResponse, PostAuthor,
    CommentCreate, CommentResponse, CommentAuthor, PostLikeResponse,
    MyCommentResponse,
)

router = APIRouter(prefix="/api/community", tags=["community"])




def _serialize_part_with_group(obj):
    if obj is None:
        return None
    data = {c.name: getattr(obj, c.name) for c in obj.__table__.columns}
    if hasattr(obj, "compatible_group") and obj.compatible_group:
        data["compatible_group_name"] = obj.compatible_group.name
    else:
        data["compatible_group_name"] = None
    return data


def _serialize_part(obj):
    if obj is None:
        return None
    return {c.name: getattr(obj, c.name) for c in obj.__table__.columns}


def _serialize_build(build: Build) -> dict:
    return {
        "id": build.id,
        "name": build.name,
        "user_id": build.user_id,
        "is_public": build.is_public,
        "like_count": build.like_count,
        "created_at": build.created_at,
        "updated_at": build.updated_at,
        "pcb": _serialize_part_with_group(build.pcb),
        "case": _serialize_part_with_group(build.case),
        "plate": _serialize_part_with_group(build.plate),
        "stabilizer": _serialize_part(build.stabilizer),
        "switch": _serialize_part(build.switch),
        "keycap": _serialize_part(build.keycap),
    }


def _get_build_data(post: Post) -> Optional[dict]:
    if post.build_id and post.build:
        return _serialize_build(post.build)
    return None


def _build_post_list_item(post, comment_count: int = 0, is_liked: bool = False) -> PostListItem:
    return PostListItem(
        id=post.id,
        title=post.title,
        category=post.category,
        like_count=post.like_count,
        is_liked=is_liked,
        comment_count=comment_count,
        author=PostAuthor(
            id=post.user.id,
            nickname=post.user.nickname,
            profile_image=post.user.profile_image,
        ),
        build=_get_build_data(post),
        created_at=post.created_at,
    )


def _build_comment_response(comment: Comment, depth: int = 0) -> CommentResponse:
    replies = []
    if depth < 1:
        replies = [_build_comment_response(r, depth + 1) for r in comment.replies]
    return CommentResponse(
        id=comment.id,
        content=comment.content,
        author=CommentAuthor(
            id=comment.user.id,
            nickname=comment.user.nickname,
            profile_image=comment.user.profile_image,
        ),
        parent_comment_id=comment.parent_comment_id,
        replies=replies,
        created_at=comment.created_at,
    )


def _posts_list_query(db: Session, user_id: Optional[int] = None):
    """Lightweight query for post lists - no comments loaded."""
    comment_count_sq = (
        db.query(
            Comment.post_id,
            sa_func.count(Comment.id).label("cnt"),
        )
        .group_by(Comment.post_id)
        .subquery()
    )

    liked_sq = sa.literal(False).label("is_liked")
    if user_id is not None:
        liked_sq = (
            sa.exists(
                sa.select(PostLike.id)
                .where(PostLike.post_id == Post.id, PostLike.user_id == user_id)
            )
        ).label("is_liked")

    return (
        db.query(Post, sa_func.coalesce(comment_count_sq.c.cnt, 0).label("comment_count"), liked_sq)
        .outerjoin(comment_count_sq, Post.id == comment_count_sq.c.post_id)
        .options(
            joinedload(Post.user),
            joinedload(Post.build).joinedload(Build.pcb).joinedload(PCB.compatible_group),
            joinedload(Post.build).joinedload(Build.case).joinedload(Case.compatible_group),
            joinedload(Post.build).joinedload(Build.plate).joinedload(Plate.compatible_group),
            joinedload(Post.build).joinedload(Build.stabilizer),
            joinedload(Post.build).joinedload(Build.switch),
            joinedload(Post.build).joinedload(Build.keycap),
        )
    )


def _posts_detail_query(db: Session):
    """Full query for single post detail - includes comments with users."""
    return (
        db.query(Post)
        .options(
            joinedload(Post.user),
            joinedload(Post.comments).joinedload(Comment.user),
            joinedload(Post.comments).joinedload(Comment.replies).joinedload(Comment.user),
            joinedload(Post.build).joinedload(Build.pcb).joinedload(PCB.compatible_group),
            joinedload(Post.build).joinedload(Build.case).joinedload(Case.compatible_group),
            joinedload(Post.build).joinedload(Build.plate).joinedload(Plate.compatible_group),
            joinedload(Post.build).joinedload(Build.stabilizer),
            joinedload(Post.build).joinedload(Build.switch),
            joinedload(Post.build).joinedload(Build.keycap),
        )
    )


# --- Posts ---

@router.get("/me/posts", response_model=List[PostListItem])
def get_my_posts(
    limit: int = 20,
    offset: int = 0,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = _posts_list_query(db, current_user.id)
    query = query.filter(Post.user_id == current_user.id)
    query = query.order_by(Post.created_at.desc())
    rows = query.offset(offset).limit(limit).all()
    return [_build_post_list_item(post, comment_count, is_liked) for post, comment_count, is_liked in rows]


@router.get("/me/comments", response_model=List[MyCommentResponse])
def get_my_comments(
    limit: int = 20,
    offset: int = 0,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    reply_count_sq = (
        db.query(
            Comment.parent_comment_id,
            sa_func.count(Comment.id).label("cnt"),
        )
        .filter(Comment.parent_comment_id.isnot(None))
        .group_by(Comment.parent_comment_id)
        .subquery()
    )

    rows = (
        db.query(
            Comment,
            Post.title.label("post_title"),
            sa_func.coalesce(reply_count_sq.c.cnt, 0).label("reply_count"),
        )
        .join(Post, Comment.post_id == Post.id)
        .outerjoin(reply_count_sq, Comment.id == reply_count_sq.c.parent_comment_id)
        .filter(Comment.user_id == current_user.id)
        .order_by(Comment.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )

    return [
        MyCommentResponse(
            id=comment.id,
            content=comment.content,
            post_id=comment.post_id,
            post_title=post_title,
            parent_comment_id=comment.parent_comment_id,
            reply_count=reply_count,
            created_at=comment.created_at,
        )
        for comment, post_title, reply_count in rows
    ]


@router.get("/posts", response_model=List[PostListItem])
def get_posts(
    category: Optional[PostCategory] = None,
    sort: str = Query("recent", pattern="^(recent|popular)$"),
    limit: int = 20,
    offset: int = 0,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    user_id = current_user.id if current_user else None
    query = _posts_list_query(db, user_id)
    if category:
        query = query.filter(Post.category == category)

    if sort == "popular":
        query = query.order_by(Post.like_count.desc(), Post.created_at.desc())
    else:
        query = query.order_by(Post.created_at.desc())

    rows = query.offset(offset).limit(limit).all()
    return [_build_post_list_item(post, comment_count, is_liked) for post, comment_count, is_liked in rows]


@router.get("/posts/{post_id}", response_model=PostResponse)
def get_post(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    post = _posts_detail_query(db).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    is_liked = False
    if current_user:
        existing = (
            db.query(PostLike)
            .filter(PostLike.user_id == current_user.id, PostLike.post_id == post_id)
            .first()
        )
        is_liked = existing is not None

    top_level_comments = [c for c in post.comments if c.parent_comment_id is None]
    comments = [_build_comment_response(c) for c in top_level_comments]

    return PostResponse(
        id=post.id,
        title=post.title,
        content=post.content,
        category=post.category,
        like_count=post.like_count,
        is_liked=is_liked,
        comment_count=len(post.comments),
        author=PostAuthor(
            id=post.user.id,
            nickname=post.user.nickname,
            profile_image=post.user.profile_image,
        ),
        build=_get_build_data(post),
        comments=comments,
        created_at=post.created_at,
        updated_at=post.updated_at,
    )


@router.post("/posts", response_model=PostResponse, status_code=status.HTTP_201_CREATED)
def create_post(
    data: PostCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    build_data = None

    if data.build_id and data.category == PostCategory.showcase:
        build = db.query(Build).filter(Build.id == data.build_id).first()
        if not build:
            raise HTTPException(status_code=404, detail="Build not found")
        if build.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not your build")
        build.is_public = True

    post = Post(
        user_id=current_user.id,
        build_id=data.build_id if data.category == PostCategory.showcase else None,
        title=data.title,
        content=data.content,
        category=data.category,
    )
    db.add(post)
    db.commit()
    db.refresh(post)

    if post.build_id:
        post = _posts_detail_query(db).filter(Post.id == post.id).first()
        build_data = _get_build_data(post)

    return PostResponse(
        id=post.id,
        title=post.title,
        content=post.content,
        category=post.category,
        like_count=0,
        is_liked=False,
        comment_count=0,
        author=PostAuthor(
            id=current_user.id,
            nickname=current_user.nickname,
            profile_image=current_user.profile_image,
        ),
        build=build_data,
        comments=[],
        created_at=post.created_at,
        updated_at=post.updated_at,
    )


@router.put("/posts/{post_id}", response_model=PostResponse)
def update_post(
    post_id: int,
    data: PostUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    post = _posts_detail_query(db).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    if post.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(post, key, value)

    db.commit()
    db.refresh(post)

    top_level_comments = [c for c in post.comments if c.parent_comment_id is None]
    comments = [_build_comment_response(c) for c in top_level_comments]

    return PostResponse(
        id=post.id,
        title=post.title,
        content=post.content,
        category=post.category,
        like_count=post.like_count,
        is_liked=False,
        comment_count=len(post.comments),
        author=PostAuthor(
            id=current_user.id,
            nickname=current_user.nickname,
            profile_image=current_user.profile_image,
        ),
        build=_get_build_data(post),
        comments=comments,
        created_at=post.created_at,
        updated_at=post.updated_at,
    )


@router.delete("/posts/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_post(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    if post.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    db.delete(post)
    db.commit()


@router.post("/posts/{post_id}/like", response_model=PostLikeResponse)
def toggle_post_like(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    existing = (
        db.query(PostLike)
        .filter(PostLike.user_id == current_user.id, PostLike.post_id == post_id)
        .first()
    )

    if existing:
        db.delete(existing)
        db.execute(
            sa.update(Post)
            .where(Post.id == post_id)
            .values(like_count=sa.func.greatest(0, Post.like_count - 1))
        )
        liked = False
    else:
        like = PostLike(user_id=current_user.id, post_id=post_id)
        db.add(like)
        db.execute(
            sa.update(Post)
            .where(Post.id == post_id)
            .values(like_count=Post.like_count + 1)
        )
        liked = True

    db.commit()
    db.refresh(post)
    return PostLikeResponse(liked=liked, like_count=post.like_count)


# --- Comments ---

@router.get("/posts/{post_id}/comments", response_model=List[CommentResponse])
def get_comments(
    post_id: int,
    db: Session = Depends(get_db),
):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    comments = (
        db.query(Comment)
        .options(
            joinedload(Comment.user),
            joinedload(Comment.replies).joinedload(Comment.user),
        )
        .filter(Comment.post_id == post_id, Comment.parent_comment_id.is_(None))
        .order_by(Comment.created_at.asc())
        .all()
    )
    return [_build_comment_response(c) for c in comments]


@router.post("/posts/{post_id}/comments", response_model=CommentResponse, status_code=status.HTTP_201_CREATED)
def create_comment(
    post_id: int,
    data: CommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    if data.parent_comment_id is not None:
        parent = db.query(Comment).filter(Comment.id == data.parent_comment_id).first()
        if not parent:
            raise HTTPException(status_code=404, detail="Parent comment not found")
        if parent.post_id != post_id:
            raise HTTPException(status_code=400, detail="Parent comment does not belong to this post")
        if parent.parent_comment_id is not None:
            raise HTTPException(status_code=400, detail="Cannot reply to a reply")

    comment = Comment(
        user_id=current_user.id,
        post_id=post_id,
        parent_comment_id=data.parent_comment_id,
        content=data.content,
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)

    return CommentResponse(
        id=comment.id,
        content=comment.content,
        author=CommentAuthor(
            id=current_user.id,
            nickname=current_user.nickname,
            profile_image=current_user.profile_image,
        ),
        parent_comment_id=comment.parent_comment_id,
        replies=[],
        created_at=comment.created_at,
    )


@router.delete("/comments/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_comment(
    comment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    if comment.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    db.delete(comment)
    db.commit()




