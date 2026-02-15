from typing import List, Optional

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


def _build_comment_response(comment: Comment) -> dict:
    return {
        "id": comment.id,
        "content": comment.content,
        "author": CommentAuthor(
            id=comment.user.id,
            nickname=comment.user.nickname,
            profile_image=comment.user.profile_image,
        ),
        "created_at": comment.created_at,
    }


def _posts_list_query(db: Session):
    """Lightweight query for post lists - no comments loaded."""
    comment_count_sq = (
        db.query(
            Comment.post_id,
            sa_func.count(Comment.id).label("cnt"),
        )
        .group_by(Comment.post_id)
        .subquery()
    )
    return (
        db.query(Post, sa_func.coalesce(comment_count_sq.c.cnt, 0).label("comment_count"))
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
            joinedload(Post.build).joinedload(Build.pcb).joinedload(PCB.compatible_group),
            joinedload(Post.build).joinedload(Build.case).joinedload(Case.compatible_group),
            joinedload(Post.build).joinedload(Build.plate).joinedload(Plate.compatible_group),
            joinedload(Post.build).joinedload(Build.stabilizer),
            joinedload(Post.build).joinedload(Build.switch),
            joinedload(Post.build).joinedload(Build.keycap),
        )
    )


# --- Posts ---

@router.get("/posts", response_model=List[PostListItem])
def get_posts(
    category: Optional[PostCategory] = None,
    sort: str = Query("recent", pattern="^(recent|popular)$"),
    limit: int = 20,
    offset: int = 0,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    query = _posts_list_query(db)
    if category:
        query = query.filter(Post.category == category)

    if sort == "popular":
        query = query.order_by(Post.like_count.desc(), Post.created_at.desc())
    else:
        query = query.order_by(Post.created_at.desc())

    rows = query.offset(offset).limit(limit).all()
    liked_ids = _get_liked_post_ids(db, current_user)
    return [_build_post_list_item(post, comment_count, post.id in liked_ids) for post, comment_count in rows]


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

    comments = [_build_comment_response(c) for c in post.comments]

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
        post = _posts_query(db).filter(Post.id == post.id).first()
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

    comments = [_build_comment_response(c) for c in post.comments]

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
        post.like_count = max(0, post.like_count - 1)
        liked = False
    else:
        like = PostLike(user_id=current_user.id, post_id=post_id)
        db.add(like)
        post.like_count = post.like_count + 1
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
        .options(joinedload(Comment.user))
        .filter(Comment.post_id == post_id)
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

    comment = Comment(
        user_id=current_user.id,
        post_id=post_id,
        content=data.content,
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)

    return _build_comment_response(comment)


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


# --- Helper functions ---

def _get_liked_post_ids(db: Session, user: Optional[User]) -> set:
    if user is None:
        return set()
    likes = db.query(PostLike.post_id).filter(PostLike.user_id == user.id).all()
    return {like.post_id for like in likes}


