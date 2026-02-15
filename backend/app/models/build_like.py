from sqlalchemy import Column, Integer, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class BuildLike(Base):
    __tablename__ = "build_likes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    build_id = Column(Integer, ForeignKey("builds.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        UniqueConstraint("user_id", "build_id", name="uq_build_like_user_build"),
    )

    user = relationship("User")
    build = relationship("Build", back_populates="likes")
