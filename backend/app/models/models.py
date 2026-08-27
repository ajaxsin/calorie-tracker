# app/models/models.py
import datetime
import uuid
from typing import Optional
from sqlalchemy import (
    DateTime,
    Enum as SQLEnum,
    Float,
    Index,
    Integer,
    Numeric,
    String,
    Text,
    text,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base
from app.models.enums import MealSegment


class UserSettings(Base):
    __tablename__ = "user_settings"

    id: Mapped[str] = mapped_column(String(50), primary_key=True, default="default")
    weight_kg: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    baseline_calories: Mapped[float] = mapped_column(Float, nullable=False, default=2000.0, server_default=text("2000.0"))
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=lambda: datetime.datetime.now(datetime.timezone.utc), server_default=text("NOW()")
    )
    updated_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.datetime.now(datetime.timezone.utc),
        onupdate=lambda: datetime.datetime.now(datetime.timezone.utc),
        server_default=text("NOW()"),
    )


class DailyActivity(Base):
    __tablename__ = "daily_activities"
    __table_args__ = (
        Index("idx_daily_activities_date", "date", unique=True),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    date: Mapped[str] = mapped_column(String(10), nullable=False, unique=True)
    steps: Mapped[int] = mapped_column(Integer, nullable=False, default=0, server_default=text("0"))
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=lambda: datetime.datetime.now(datetime.timezone.utc), server_default=text("NOW()")
    )
    updated_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.datetime.now(datetime.timezone.utc),
        onupdate=lambda: datetime.datetime.now(datetime.timezone.utc),
        server_default=text("NOW()"),
    )


class Meal(Base):
    __tablename__ = "meals"
    __table_args__ = (
        Index("idx_meals_date", "date"),
        Index("idx_meals_created_at", "created_at"),
        Index("idx_meals_segment", "segment"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    meal_text: Mapped[str] = mapped_column(Text, nullable=False)
    segment: Mapped[MealSegment] = mapped_column(
        SQLEnum(
            MealSegment,
            name="meal_segment",
            values_callable=lambda x: [e.value for e in x],
            create_type=False,
            native_enum=True,
        ),
        nullable=False,
    )
    date: Mapped[str] = mapped_column(String(10), nullable=False)
    calories: Mapped[float] = mapped_column(Float, nullable=False)
    protein: Mapped[float] = mapped_column(Float, nullable=False, default=0.0, server_default=text("0.0"))
    carbs: Mapped[float] = mapped_column(Float, nullable=False, default=0.0, server_default=text("0.0"))
    fibre: Mapped[float] = mapped_column(Float, nullable=False, default=0.0, server_default=text("0.0"))
    fats: Mapped[float] = mapped_column(Float, nullable=False, default=0.0, server_default=text("0.0"))
    confidence: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=lambda: datetime.datetime.now(datetime.timezone.utc), server_default=text("NOW()")
    )
    updated_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.datetime.now(datetime.timezone.utc),
        onupdate=lambda: datetime.datetime.now(datetime.timezone.utc),
        server_default=text("NOW()"),
    )


class Preset(Base):
    __tablename__ = "presets"
    __table_args__ = (
        Index("idx_presets_use_count", "use_count"),
        Index("idx_presets_created_at", "created_at"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[Optional[str]] = mapped_column(String(60), nullable=True)
    meal_text: Mapped[str] = mapped_column(Text, nullable=False)
    calories: Mapped[float] = mapped_column(Float, nullable=False)
    protein: Mapped[float] = mapped_column(Float, nullable=False, default=0.0, server_default=text("0.0"))
    carbs: Mapped[float] = mapped_column(Float, nullable=False, default=0.0, server_default=text("0.0"))
    fibre: Mapped[float] = mapped_column(Float, nullable=False, default=0.0, server_default=text("0.0"))
    fats: Mapped[float] = mapped_column(Float, nullable=False, default=0.0, server_default=text("0.0"))
    confidence: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    use_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0, server_default=text("0"))
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=lambda: datetime.datetime.now(datetime.timezone.utc), server_default=text("NOW()")
    )
    updated_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.datetime.now(datetime.timezone.utc),
        onupdate=lambda: datetime.datetime.now(datetime.timezone.utc),
        server_default=text("NOW()"),
    )


class StatusCheck(Base):
    __tablename__ = "status_checks"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    client_name: Mapped[str] = mapped_column(String(255), nullable=False)
    timestamp: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=lambda: datetime.datetime.now(datetime.timezone.utc), server_default=text("NOW()")
    )
