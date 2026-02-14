from sqlalchemy import Column, Integer, String, Boolean, Float, Enum as SQLEnum, ForeignKey
from sqlalchemy.orm import relationship
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

# Compatible Group - 물리적 호환성 그룹 (에코시스템)
class CompatibleGroup(Base):
    __tablename__ = "compatible_groups"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True)
    layout = Column(SQLEnum(LayoutType), nullable=False)
    description = Column(String)

    pcbs = relationship("PCB", back_populates="compatible_group")
    cases = relationship("Case", back_populates="compatible_group")
    plates = relationship("Plate", back_populates="compatible_group")

# PCB 기판 테이블 정의
class PCB(Base):
    __tablename__ = "pcbs"

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
    compatible_group_id = Column(Integer, ForeignKey("compatible_groups.id"), nullable=True)
    compatible_group = relationship("CompatibleGroup", back_populates="pcbs")

# Case 테이블
class Case(Base):
    __tablename__ = "cases"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    manufacturer = Column(String)
    layout = Column(SQLEnum(LayoutType), nullable=False)
    mounting_type = Column(SQLEnum(MountingType), nullable=False)
    material = Column(String)
    color = Column(String)
    weight = Column(Float)
    price = Column(Float)
    image_url = Column(String)
    compatible_group_id = Column(Integer, ForeignKey("compatible_groups.id"), nullable=True)
    compatible_group = relationship("CompatibleGroup", back_populates="cases")

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
    compatible_group_id = Column(Integer, ForeignKey("compatible_groups.id"), nullable=True)
    compatible_group = relationship("CompatibleGroup", back_populates="plates")

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
    size = Column(String)
    price = Column(Float)
    image_url = Column(String)

# Switch 테이블
class Switch(Base):
    __tablename__ = "switches"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    manufacturer = Column(String)
    switch_type = Column(SQLEnum(SwitchType), nullable=False)
    pin_count = Column(Integer)
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
    material = Column(String)
    stem_type = Column(SQLEnum(SwitchType), nullable=False)
    price = Column(Float)
    image_url = Column(String)
