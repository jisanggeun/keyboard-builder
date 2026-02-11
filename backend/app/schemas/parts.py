from pydantic import BaseModel
from typing import Optional
from app.models.parts import (
    LayoutType, MountingType, SwitchType,
    StabilizerType, KeycapProfile
)

# PCB Common fields
class PCBBase(BaseModel):
    name: str
    manufacturer: Optional[str] = None
    layout: LayoutType
    mounting_type: MountingType
    hotswap: bool = False
    switch_type = SwitchType
    rgb: bool = False
    price: Optional[float] = None
    image_url: Optional[str] = None

# PCB 생성용 (POST Request)
class PCBCreate(PCBBase):
    pass

# PCB 응답용 (GET Response)
class PCBResponse(PCBBase):
    id: int

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
    pass

class CaseResponse(CaseBase):
    id: int
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
    pass

class PlateResponse(PlateBase):
    id: int
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

'''
Model = DB Table 구조
Schema = API Request/Response 구조

클라이언드 -> Schema로 검증 -> 서버 -> Model로 DB 저장
'''