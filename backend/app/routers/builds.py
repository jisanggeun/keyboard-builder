from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.auth import get_current_user, get_optional_user
from app.models.user import User
from app.models.build import Build
from app.models.build_like import BuildLike
from app.models.parts import PCB, Case, Plate
from app.schemas.build import (
    BuildCreate, BuildUpdate, BuildListItem, BuildResponse,
    PublicBuildResponse, LikeResponse,
)

router = APIRouter(prefix="/api/builds", tags=["builds"])


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


def _serialize_public_build(build: Build, is_liked: bool = False) -> dict:
    result = _serialize_build(build)
    result["user_nickname"] = build.user.nickname if build.user else None
    result["is_liked"] = is_liked
    return result


# --- Public endpoints (before /{build_id}) ---

@router.get("/popular", response_model=List[PublicBuildResponse])
def get_popular_builds(
    limit: int = 8,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    builds = (
        _load_public_builds_query(db)
        .filter(Build.is_public == True)
        .order_by(Build.like_count.desc(), Build.created_at.desc())
        .limit(limit)
        .all()
    )
    liked_ids = _get_liked_build_ids(db, current_user)
    return [_serialize_public_build(b, b.id in liked_ids) for b in builds]


@router.get("/recent", response_model=List[PublicBuildResponse])
def get_recent_builds(
    limit: int = 8,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    builds = (
        _load_public_builds_query(db)
        .filter(Build.is_public == True)
        .order_by(Build.created_at.desc())
        .limit(limit)
        .all()
    )
    liked_ids = _get_liked_build_ids(db, current_user)
    return [_serialize_public_build(b, b.id in liked_ids) for b in builds]


# --- Authenticated endpoints ---

@router.post("", response_model=BuildResponse, status_code=status.HTTP_201_CREATED)
def create_build(
    data: BuildCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    build = Build(
        name=data.name,
        user_id=current_user.id,
        is_public=data.is_public,
        pcb_id=data.pcb_id,
        case_id=data.case_id,
        plate_id=data.plate_id,
        stabilizer_id=data.stabilizer_id,
        switch_id=data.switch_id,
        keycap_id=data.keycap_id,
    )
    db.add(build)
    db.commit()
    db.refresh(build)

    build = _load_build_with_relations(db, build.id)
    return _serialize_build(build)


@router.get("", response_model=List[BuildListItem])
def get_builds(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    builds = (
        db.query(Build)
        .filter(Build.user_id == current_user.id)
        .order_by(Build.updated_at.desc())
        .all()
    )
    return [
        {
            "id": b.id,
            "name": b.name,
            "is_public": b.is_public,
            "created_at": b.created_at,
            "updated_at": b.updated_at,
            "has_pcb": b.pcb_id is not None,
            "has_case": b.case_id is not None,
            "has_plate": b.plate_id is not None,
            "has_stabilizer": b.stabilizer_id is not None,
            "has_switch": b.switch_id is not None,
            "has_keycap": b.keycap_id is not None,
        }
        for b in builds
    ]


@router.get("/{build_id}", response_model=BuildResponse)
def get_build(
    build_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    build = _load_build_with_relations(db, build_id)
    if not build:
        raise HTTPException(status_code=404, detail="Build not found")
    if build.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    return _serialize_build(build)


@router.put("/{build_id}", response_model=BuildResponse)
def update_build(
    build_id: int,
    data: BuildUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    build = db.query(Build).filter(Build.id == build_id).first()
    if not build:
        raise HTTPException(status_code=404, detail="Build not found")
    if build.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(build, key, value)

    db.commit()
    db.refresh(build)

    build = _load_build_with_relations(db, build.id)
    return _serialize_build(build)


@router.delete("/{build_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_build(
    build_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    build = db.query(Build).filter(Build.id == build_id).first()
    if not build:
        raise HTTPException(status_code=404, detail="Build not found")
    if build.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    db.delete(build)
    db.commit()


@router.post("/{build_id}/like", response_model=LikeResponse)
def toggle_build_like(
    build_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    build = db.query(Build).filter(Build.id == build_id, Build.is_public == True).first()
    if not build:
        raise HTTPException(status_code=404, detail="Build not found")

    existing = (
        db.query(BuildLike)
        .filter(BuildLike.user_id == current_user.id, BuildLike.build_id == build_id)
        .first()
    )

    if existing:
        db.delete(existing)
        build.like_count = max(0, build.like_count - 1)
        liked = False
    else:
        like = BuildLike(user_id=current_user.id, build_id=build_id)
        db.add(like)
        build.like_count = build.like_count + 1
        liked = True

    db.commit()
    db.refresh(build)
    return LikeResponse(liked=liked, like_count=build.like_count)


# --- Helper functions ---

def _load_build_with_relations(db: Session, build_id: int) -> Build:
    return (
        db.query(Build)
        .options(
            joinedload(Build.pcb).joinedload(PCB.compatible_group),
            joinedload(Build.case).joinedload(Case.compatible_group),
            joinedload(Build.plate).joinedload(Plate.compatible_group),
            joinedload(Build.stabilizer),
            joinedload(Build.switch),
            joinedload(Build.keycap),
        )
        .filter(Build.id == build_id)
        .first()
    )


def _load_public_builds_query(db: Session):
    return (
        db.query(Build)
        .options(
            joinedload(Build.user),
            joinedload(Build.pcb).joinedload(PCB.compatible_group),
            joinedload(Build.case).joinedload(Case.compatible_group),
            joinedload(Build.plate).joinedload(Plate.compatible_group),
            joinedload(Build.stabilizer),
            joinedload(Build.switch),
            joinedload(Build.keycap),
        )
    )


def _get_liked_build_ids(db: Session, user: Optional[User]) -> set:
    if user is None:
        return set()
    likes = db.query(BuildLike.build_id).filter(BuildLike.user_id == user.id).all()
    return {like.build_id for like in likes}
