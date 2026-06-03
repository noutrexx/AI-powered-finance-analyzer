from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.routers.auth import get_current_user
from app.schemas.transaction import TransactionCreate, TransactionRead, UploadResult
from app.services.csv_service import parse_transactions_csv
from app.services.transaction_service import (
    create_transaction,
    create_transactions,
    list_transactions,
)

router = APIRouter(prefix="/transactions", tags=["transactions"])


@router.get("", response_model=list[TransactionRead])
def get_transactions(
    limit: int = Query(default=100, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[TransactionRead]:
    return list_transactions(db, current_user, limit=limit, offset=offset)


@router.post("", response_model=TransactionRead, status_code=status.HTTP_201_CREATED)
def post_transaction(
    payload: TransactionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> TransactionRead:
    return create_transaction(db, current_user, payload)


@router.post("/upload", response_model=UploadResult)
async def upload_transactions(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> UploadResult:
    if not file.filename.lower().endswith(".csv"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only CSV files are supported",
        )

    content = await file.read()
    try:
        raw_csv = content.decode("utf-8-sig")
    except UnicodeDecodeError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="CSV must be encoded as UTF-8",
        ) from exc

    payloads, errors = parse_transactions_csv(raw_csv)
    imported = create_transactions(db, current_user, payloads) if payloads else []
    return UploadResult(
        imported_count=len(imported),
        skipped_count=len(errors),
        errors=errors,
    )
