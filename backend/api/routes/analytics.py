from fastapi import APIRouter
import pandas as pd
import json

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/metrics")
def get_model_metrics():
    with open("outputs/metrics.json", "r") as f:
        metrics = json.load(f)
    return metrics
