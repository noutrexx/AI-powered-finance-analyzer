import csv
from datetime import date
from decimal import Decimal, InvalidOperation
from io import StringIO

from pydantic import ValidationError

from app.schemas.transaction import TransactionCreate

REQUIRED_COLUMNS = {"date", "description", "amount", "currency", "type"}


def parse_transactions_csv(raw_csv: str) -> tuple[list[TransactionCreate], list[str]]:
    stream = StringIO(raw_csv)
    reader = csv.DictReader(stream)
    if not reader.fieldnames:
        return [], ["CSV file is empty or missing a header row."]

    normalized_headers = {field.strip().lower() for field in reader.fieldnames if field}
    missing_columns = REQUIRED_COLUMNS - normalized_headers
    if missing_columns:
        missing = ", ".join(sorted(missing_columns))
        return [], [f"Missing required columns: {missing}."]

    rows: list[TransactionCreate] = []
    errors: list[str] = []

    for row_number, row in enumerate(reader, start=2):
        normalized = {key.strip().lower(): (value or "").strip() for key, value in row.items() if key}
        try:
            amount = Decimal(normalized["amount"]).copy_abs()
            payload = TransactionCreate(
                date=date.fromisoformat(normalized["date"]),
                description=normalized["description"],
                amount=amount,
                currency=normalized["currency"],
                type=normalized["type"].lower(),
            )
            rows.append(payload)
        except (InvalidOperation, ValueError, ValidationError) as exc:
            errors.append(f"Row {row_number}: {exc}")

    return rows, errors

