from datetime import date
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, Field, field_validator

TransactionType = Literal["income", "expense"]


class TransactionCreate(BaseModel):
    date: date
    description: str = Field(min_length=2, max_length=255)
    amount: Decimal = Field(gt=0)
    currency: str = Field(default="TL", min_length=2, max_length=3)
    type: TransactionType
    category: str | None = None

    @field_validator("currency")
    @classmethod
    def normalize_currency(cls, value: str) -> str:
        return value.upper()


class TransactionRead(BaseModel):
    id: int
    date: date
    description: str
    amount: Decimal
    currency: str
    type: TransactionType
    category: str

    model_config = {"from_attributes": True}


class UploadResult(BaseModel):
    imported_count: int
    skipped_count: int
    errors: list[str]

