from decimal import Decimal

from sqlalchemy import desc
from sqlalchemy.orm import Session

from app.models.transaction import Transaction
from app.models.user import User
from app.schemas.transaction import TransactionCreate
from app.services.category_service import classifier


def create_transaction(db: Session, owner: User, payload: TransactionCreate) -> Transaction:
    category = payload.category or classifier.predict(payload.description, payload.type)
    transaction = Transaction(
        owner_id=owner.id,
        date=payload.date,
        description=payload.description.strip(),
        amount=Decimal(payload.amount).quantize(Decimal("0.01")),
        currency=payload.currency.upper(),
        type=payload.type,
        category=category,
    )
    db.add(transaction)
    db.commit()
    db.refresh(transaction)
    return transaction


def create_transactions(db: Session, owner: User, payloads: list[TransactionCreate]) -> list[Transaction]:
    records = [
        Transaction(
            owner_id=owner.id,
            date=payload.date,
            description=payload.description.strip(),
            amount=Decimal(payload.amount).quantize(Decimal("0.01")),
            currency=payload.currency.upper(),
            type=payload.type,
            category=payload.category or classifier.predict(payload.description, payload.type),
        )
        for payload in payloads
    ]
    db.add_all(records)
    db.commit()
    for record in records:
        db.refresh(record)
    return records


def list_transactions(db: Session, owner: User, limit: int = 100, offset: int = 0) -> list[Transaction]:
    return (
        db.query(Transaction)
        .filter(Transaction.owner_id == owner.id)
        .order_by(desc(Transaction.date), desc(Transaction.id))
        .offset(offset)
        .limit(limit)
        .all()
    )

