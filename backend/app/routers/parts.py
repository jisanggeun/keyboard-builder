from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List
from app.database import get_db
from app.models import PCB, Case, Plate, Stabilizer, Switch, Keycap, CompatibleGroup
from app.schemas import (
    PCBResponse, CaseResponse, PlateResponse,
    StabilizerResponse, SwitchResponse, KeycapResponse,
    CompatibleGroupResponse, AllPartsResponse
)
from app.services.compatibility import CompatibilityService

router = APIRouter(prefix="/api/parts", tags=["parts"])

def _serialize_with_group(obj):
    """compatible_group_name을 포함하는 dict 변환"""
    data = {c.name: getattr(obj, c.name) for c in obj.__table__.columns}
    if hasattr(obj, 'compatible_group') and obj.compatible_group:
        data['compatible_group_name'] = obj.compatible_group.name
    else:
        data['compatible_group_name'] = None
    return data

@router.get("/all", response_model=AllPartsResponse)
def get_all_parts(db: Session = Depends(get_db)):
    pcbs = db.query(PCB).options(joinedload(PCB.compatible_group)).all()
    cases = db.query(Case).options(joinedload(Case.compatible_group)).all()
    plates = db.query(Plate).options(joinedload(Plate.compatible_group)).all()
    return {
        "pcbs": [_serialize_with_group(p) for p in pcbs],
        "cases": [_serialize_with_group(c) for c in cases],
        "plates": [_serialize_with_group(p) for p in plates],
        "stabilizers": db.query(Stabilizer).all(),
        "switches": db.query(Switch).all(),
        "keycaps": db.query(Keycap).all(),
        "compatible_groups": db.query(CompatibleGroup).all(),
    }

# Compatible Groups
@router.get("/compatible-groups", response_model=List[CompatibleGroupResponse])
def get_compatible_groups(db: Session = Depends(get_db)):
    return db.query(CompatibleGroup).all()

# PCB
@router.get("/pcbs", response_model=List[PCBResponse])
def get_pcbs(db: Session = Depends(get_db)):
    pcbs = db.query(PCB).options(joinedload(PCB.compatible_group)).all()
    return [_serialize_with_group(p) for p in pcbs]

@router.get("/pcbs/{pcb_id}", response_model=PCBResponse)
def get_pcb(pcb_id: int, db: Session = Depends(get_db)):
    pcb = db.query(PCB).options(joinedload(PCB.compatible_group)).filter(PCB.id == pcb_id).first()
    if not pcb:
        raise HTTPException(status_code=404, detail="PCB not found")
    return _serialize_with_group(pcb)

# Case
@router.get("/cases", response_model=List[CaseResponse])
def get_cases(db: Session = Depends(get_db)):
    cases = db.query(Case).options(joinedload(Case.compatible_group)).all()
    return [_serialize_with_group(c) for c in cases]

@router.get("/cases/{case_id}", response_model=CaseResponse)
def get_case(case_id: int, db: Session = Depends(get_db)):
    case = db.query(Case).options(joinedload(Case.compatible_group)).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    return _serialize_with_group(case)

# Plate
@router.get("/plates", response_model=List[PlateResponse])
def get_plates(db: Session = Depends(get_db)):
    plates = db.query(Plate).options(joinedload(Plate.compatible_group)).all()
    return [_serialize_with_group(p) for p in plates]

@router.get("/plates/{plate_id}", response_model=PlateResponse)
def get_plate(plate_id: int, db: Session = Depends(get_db)):
    plate = db.query(Plate).options(joinedload(Plate.compatible_group)).filter(Plate.id == plate_id).first()
    if not plate:
        raise HTTPException(status_code=404, detail="Plate not found")
    return _serialize_with_group(plate)

# Stabilizer
@router.get("/stabilizers", response_model=List[StabilizerResponse])
def get_stabilizers(db: Session = Depends(get_db)):
    return db.query(Stabilizer).all()

@router.get("/stabilizers/{stab_id}", response_model=StabilizerResponse)
def get_stabilizer(stab_id: int, db: Session = Depends(get_db)):
    stab = db.query(Stabilizer).filter(Stabilizer.id == stab_id).first()
    if not stab:
        raise HTTPException(status_code=404, detail="Stabilizer not found")
    return stab

# Switch
@router.get("/switches", response_model=List[SwitchResponse])
def get_switches(db: Session = Depends(get_db)):
    return db.query(Switch).all()

@router.get("/switches/{switch_id}", response_model=SwitchResponse)
def get_switch(switch_id: int, db: Session = Depends(get_db)):
    switch = db.query(Switch).filter(Switch.id == switch_id).first()
    if not switch:
        raise HTTPException(status_code=404, detail="Switch not found")
    return switch

# Keycap
@router.get("/keycaps", response_model=List[KeycapResponse])
def get_keycaps(db: Session = Depends(get_db)):
    return db.query(Keycap).all()

@router.get("/keycaps/{keycap_id}", response_model=KeycapResponse)
def get_keycap(keycap_id: int, db: Session = Depends(get_db)):
    keycap = db.query(Keycap).filter(Keycap.id == keycap_id).first()
    if not keycap:
        raise HTTPException(status_code=404, detail="Keycap not found")
    return keycap

@router.post("/compatibility/check")
def check_compatibility(
    pcb_id: int = None,
    case_id: int = None,
    plate_id: int = None,
    switch_id: int = None,
    keycap_id: int = None,
    db: Session = Depends(get_db)
):
    service = CompatibilityService(db)
    return service.check_compatibility(
        pcb_id=pcb_id,
        case_id=case_id,
        plate_id=plate_id,
        switch_id=switch_id,
        keycap_id=keycap_id
    )
