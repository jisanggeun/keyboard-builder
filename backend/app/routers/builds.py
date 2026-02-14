from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.auth import get_current_user
from app.models.user import User
from app.models.build import Build
from app.models.parts import PCB, Case, Plate
from app.schemas.build import BuildCreate, BuildUpdate, BuildListItem, BuildResponse

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
        "created_at": build.created_at,
        "updated_at": build.updated_at,
        "pcb": _serialize_part_with_group(build.pcb),
        "case": _serialize_part_with_group(build.case),
        "plate": _serialize_part_with_group(build.plate),
        "stabilizer": _serialize_part(build.stabilizer),
        "switch": _serialize_part(build.switch),
        "keycap": _serialize_part(build.keycap),
    }


@router.post("", response_model=BuildResponse, status_code=status.HTTP_201_CREATED)
def create_build(
    data: BuildCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    build = Build(
        name=data.name,
        user_id=current_user.id,
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
