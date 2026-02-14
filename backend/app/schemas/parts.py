from pydantic import BaseModel
from typing import Optional, List
from app.models.parts import (
    LayoutType, MountingType, SwitchType,
    StabilizerType, KeycapProfile
)

# CompatibleGroup
class CompatibleGroupResponse(BaseModel):
    id: int
    name: str
    layout: LayoutType
    description: Optional[str] = None

    class Config:
        from_attributes = True

# PCB
class PCBBase(BaseModel):
    name: str
    manufacturer: Optional[str] = None
    layout: LayoutType
    mounting_type: MountingType
    hotswap: bool = False
    switch_type: SwitchType
    rgb: bool = False
    price: Optional[float] = None
    image_url: Optional[str] = None

class PCBCreate(PCBBase):
    compatible_group_id: Optional[int] = None

class PCBResponse(PCBBase):
    id: int
    compatible_group_id: Optional[int] = None
    compatible_group_name: Optional[str] = None

    class Config:
        from_attributes = True

# Case
class CaseBase(BaseModel):
    name: str
    manufacturer: Optional[str] = None
    layout: LayoutType
    mounting_type: MountingType
    material: Optional[str] = None
    color: Optional[str] = None
    weight: Optional[float] = None
    price: Optional[float] = None
    image_url: Optional[str] = None

class CaseCreate(CaseBase):
    compatible_group_id: Optional[int] = None

class CaseResponse(CaseBase):
    id: int
    compatible_group_id: Optional[int] = None
    compatible_group_name: Optional[str] = None

    class Config:
        from_attributes = True

# Plate
class PlateBase(BaseModel):
    name: str
    manufacturer: Optional[str] = None
    layout: LayoutType
    material: Optional[str] = None
    switch_type: SwitchType
    price: Optional[float] = None
    image_url: Optional[str] = None

class PlateCreate(PlateBase):
    compatible_group_id: Optional[int] = None

class PlateResponse(PlateBase):
    id: int
    compatible_group_id: Optional[int] = None
    compatible_group_name: Optional[str] = None

    class Config:
        from_attributes = True

# Stabilizer
class StabilizerBase(BaseModel):
    name: str
    manufacturer: Optional[str] = None
    stab_type: StabilizerType
    size: Optional[str] = None
    price: Optional[float] = None
    image_url: Optional[str] = None

class StabilizerCreate(StabilizerBase):
    pass

class StabilizerResponse(StabilizerBase):
    id: int
    class Config:
        from_attributes = True

# Switch
class SwitchBase(BaseModel):
    name: str
    manufacturer: Optional[str] = None
    switch_type: SwitchType
    pin_count: Optional[int] = None
    actuation_force: Optional[float] = None
    tactile: bool = False
    clicky: bool = False
    price: Optional[float] = None
    image_url: Optional[str] = None

class SwitchCreate(SwitchBase):
    pass

class SwitchResponse(SwitchBase):
    id: int
    class Config:
        from_attributes = True

# Keycap
class KeycapBase(BaseModel):
    name: str
    manufacturer: Optional[str] = None
    profile: KeycapProfile
    material: Optional[str] = None
    stem_type: SwitchType
    price: Optional[float] = None
    image_url: Optional[str] = None

class KeycapCreate(KeycapBase):
    pass

class KeycapResponse(KeycapBase):
    id: int
    class Config:
        from_attributes = True

class AllPartsResponse(BaseModel):
    pcbs: List[PCBResponse]
    cases: List[CaseResponse]
    plates: List[PlateResponse]
    stabilizers: List[StabilizerResponse]
    switches: List[SwitchResponse]
    keycaps: List[KeycapResponse]
    compatible_groups: List[CompatibleGroupResponse]
