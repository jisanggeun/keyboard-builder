from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Build(Base):
    __tablename__ = "builds"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    pcb_id = Column(Integer, ForeignKey("pcbs.id"), nullable=True)
    case_id = Column(Integer, ForeignKey("cases.id"), nullable=True)
    plate_id = Column(Integer, ForeignKey("plates.id"), nullable=True)
    stabilizer_id = Column(Integer, ForeignKey("stabilizers.id"), nullable=True)
    switch_id = Column(Integer, ForeignKey("switches.id"), nullable=True)
    keycap_id = Column(Integer, ForeignKey("keycaps.id"), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="builds")
    pcb = relationship("PCB", lazy="joined")
    case = relationship("Case", lazy="joined")
    plate = relationship("Plate", lazy="joined")
    stabilizer = relationship("Stabilizer", lazy="joined")
    switch = relationship("Switch", lazy="joined")
    keycap = relationship("Keycap", lazy="joined")
