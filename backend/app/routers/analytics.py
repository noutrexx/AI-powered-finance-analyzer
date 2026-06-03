from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.routers.auth import get_current_user
from app.schemas.analytics import DashboardMetrics, Recommendation
from app.services.analytics_service import get_dashboard_metrics

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/dashboard", response_model=DashboardMetrics)
def dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> DashboardMetrics:
    return get_dashboard_metrics(db, current_user)


@router.get("/insights", response_model=list[Recommendation])
def insights(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[Recommendation]:
    return get_dashboard_metrics(db, current_user).recommendations

