# BE/src/models/restaurant_reviews.py

from sqlalchemy import (
    Column,
    Integer,
    ForeignKey,
    String,
    Float,
    DateTime,
    Enum,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship
from datetime import datetime

from BE.src.database import Base


class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)

    restaurant_id = Column(
        Integer,
        ForeignKey("restaurants.id", ondelete="CASCADE"),
        nullable=False
    )
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False
    )

    content = Column(String(300), nullable=False)
    rating = Column(Float, nullable=False)

    like_count = Column(Integer, default=0)
    dislike_count = Column(Integer, default=0)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    restaurant = relationship("Restaurant", back_populates="reviews")
    user = relationship("User", back_populates="reviews")

    menus = relationship(
        "ReviewMenu",
        back_populates="review",
        cascade="all, delete-orphan",
    )

    images = relationship(
        "ReviewImage",
        back_populates="review",
        cascade="all, delete-orphan",
        order_by="ReviewImage.sort_order",
    )

    reactions = relationship(
        "ReviewReaction",
        back_populates="review",
        cascade="all, delete-orphan",
    )


class ReviewMenu(Base):
    __tablename__ = "review_menus"

    id = Column(Integer, primary_key=True)

    review_id = Column(
        Integer,
        ForeignKey("reviews.id", ondelete="CASCADE"),
        nullable=False
    )

    name = Column(String(100), nullable=False)

    review = relationship("Review", back_populates="menus")


class ReviewImage(Base):
    __tablename__ = "review_images"

    id = Column(Integer, primary_key=True)

    review_id = Column(
        Integer,
        ForeignKey("reviews.id", ondelete="CASCADE"),
        nullable=False
    )

    image_url = Column(String(500), nullable=False)

    # 여러 장일 때 표시 순서
    sort_order = Column(Integer, default=0, nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow)

    review = relationship("Review", back_populates="images")


class ReviewReaction(Base):
    __tablename__ = "review_reactions"

    id = Column(Integer, primary_key=True)

    review_id = Column(
        Integer,
        ForeignKey("reviews.id", ondelete="CASCADE"),
        nullable=False
    )
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False
    )

    reaction = Column(Enum("like", "dislike", name="reaction_enum"), nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint("review_id", "user_id", name="unique_review_user"),
    )

    review = relationship("Review", back_populates="reactions")
    user = relationship("User")