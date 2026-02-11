from sqlalchemy import Column, Integer, String, Boolean, Float, Enum as SQLEnum
from app.database import Base
import enum

# 배열 선택지
class LayoutType(str, enum.Enum):
    SIXTY = "60%"
    SIXTY_FIVE = "65%"
    SEVENTY_FIVE = "75%"
    TKL = "TKL"
    FULL = "Full"

# 마운트 선택지
class MountingType(str, enum.Enum):
    TRAY = "Tray"
    GASKET = "Gasket"
    TOP = "Top"
    SANDWICH = "Sandwich"

# 스위치 선택지
class SwitchType(str, enum.Enum):
    MX = "MX"
    ALPS = "Alps"
    CHOC = "Choc"

# PCB 기판 테이블 정의
class PCB(Base):
    __tablename__ = "pcbs" # DB 테이블 이름

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    manufacturer = Column(String)
    layout = Column(SQLEnum(LayoutType), nullable=False)
    mounting_type = Column(SQLEnum(MountingType), nullable=False)
    hotswap = Column(Boolean, default=False)
    switch_type = Column(SQLEnum(SwitchType), nullable=False)
    rgb = Column(Boolean, default=False)
    price = Column(Float)
    image_url = Column(String)

# Case 테이블
class Case(Base):
    __tablename__ = "cases"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    manufacturer = Column(String)
    layout = Column(SQLEnum(LayoutType), nullable=False)
    mounting_type = Column(SQLEnum(MountingType), nullable=False)
    material = Column(String) # 알루미늄, 플라스틱 등
    color = Column(String)
    weight = Column(Float)
    price = Column(Float)
    image_url = Column(String)

# Plate 테이블 
class Plate(Base):
    __tablename__ = "plates"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    manufacturer = Column(String)
    layout = Column(SQLEnum(LayoutType), nullable=False)
    material = Column(String) 
    switch_type = Column(SQLEnum(SwitchType), nullable=False)
    price = Column(Float)
    image_url = Column(String)

# Stabilizer 선택지
class StabilizerType(str, enum.Enum):
    SCREW_IN = "Screw-in"
    PLATE_MOUNT = "Plate-mount"
    SNAP_IN = "Snap-in"

# Stabilizer 테이블 
class Stabilizer(Base):
    __tablename__ = "stabilizers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    manufacturer = Column(String)
    stab_type = Column(SQLEnum(StabilizerType), nullable=False)
    size = Column(String) # "2u, 6.25u, 7u" 등
    price = Column(Float)
    image_url = Column(String)

# Switch 테이블 
class Switch(Base):
    __tablename__ = "switches"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    manufacturer = Column(String)
    switch_type = Column(SQLEnum(SwitchType), nullable=False)
    pin_count = Column(Integer) # 3pin or 5pin
    actuation_force = Column(Float) 
    tactile = Column(Boolean, default=False)
    clicky = Column(Boolean, default=False)
    price = Column(Float)
    image_url = Column(String)

# Keycap 선택지
class KeycapProfile(str, enum.Enum):
    CHERRY = "Cherry"
    OEM = "OEM"
    SA = "SA"
    DSA = "DSA"
    MT3 = "MT3"

# Keycap 테이블 
class Keycap(Base):
    __tablename__ = "keycaps"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    manufacturer = Column(String)
    profile = Column(SQLEnum(KeycapProfile), nullable=False)
    material = Column(String) # ABS, PBT 등
    stem_type = Column(SQLEnum(SwitchType), nullable=False) # MX, Topre
    price = Column(Float)
    image_url = Column(String)