from pydantic import BaseModel
from typing import Optional
from datetime import datetime

from app.schemas.parts import (
    PCBResponse, CaseResponse, PlateResponse,
    StabilizerResponse, SwitchResponse, KeycapResponse,
)


class BuildCreate(BaseModel):
    name: str
    pcb_id: Optional[int] = None
    case_id: Optional[int] = None
    plate_id: Optional[int] = None
    stabilizer_id: Optional[int] = None
    switch_id: Optional[int] = None
    keycap_id: Optional[int] = None


class BuildUpdate(BaseModel):
    name: Optional[str] = None
    pcb_id: Optional[int] = None
    case_id: Optional[int] = None
    plate_id: Optional[int] = None
    stabilizer_id: Optional[int] = None
    switch_id: Optional[int] = None
    keycap_id: Optional[int] = None


class BuildListItem(BaseModel):
    id: int
    name: str
    created_at: datetime
    updated_at: datetime
    has_pcb: bool
    has_case: bool
    has_plate: bool
    has_stabilizer: bool
    has_switch: bool
    has_keycap: bool

    class Config:
        from_attributes = True


class BuildResponse(BaseModel):
    id: int
    name: str
    user_id: int
    created_at: datetime
    updated_at: datetime
    pcb: Optional[PCBResponse] = None
    case: Optional[CaseResponse] = None
    plate: Optional[PlateResponse] = None
    stabilizer: Optional[StabilizerResponse] = None
    switch: Optional[SwitchResponse] = None
    keycap: Optional[KeycapResponse] = None

    class Config:
        from_attributes = True
