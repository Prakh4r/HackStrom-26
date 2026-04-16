"""
FastAPI ML Prediction Service
Serves delay predictions with SHAP explanations.
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any
import joblib
import numpy as np
import pandas as pd
import shap
import os

app = FastAPI(title="Delay Prediction ML Service", version="1.0.0")

# ── Load Models on Startup ───────────────────────────────────
MODELS_DIR = os.path.join(os.path.dirname(__file__), 'models')

print("Loading models...")
rf_model = joblib.load(os.path.join(MODELS_DIR, 'rf_model.joblib'))
xgb_model = joblib.load(os.path.join(MODELS_DIR, 'xgb_model.joblib'))
label_encoders = joblib.load(os.path.join(MODELS_DIR, 'label_encoders.joblib'))
feature_names = joblib.load(os.path.join(MODELS_DIR, 'feature_names.joblib'))
shap_background = joblib.load(os.path.join(MODELS_DIR, 'shap_background.joblib'))
dataset_stats = joblib.load(os.path.join(MODELS_DIR, 'dataset_stats.joblib'))

print("Creating SHAP explainer...")
rf_explainer = shap.TreeExplainer(rf_model)
print("Models loaded successfully!")


# ── Request/Response Models ──────────────────────────────────
class PredictionRequest(BaseModel):
    shipping_mode: Optional[str] = "Standard Class"
    customer_segment: Optional[str] = "Consumer"
    order_region: Optional[str] = "Western Europe"
    category_name: Optional[str] = "Sporting Goods"
    market: Optional[str] = "Europe"
    order_type: Optional[str] = "DEBIT"
    order_status: Optional[str] = "COMPLETE"
    scheduled_days: Optional[int] = 4
    order_item_quantity: Optional[int] = 1
    order_item_discount: Optional[float] = 0.0
    order_item_discount_rate: Optional[float] = 0.0
    product_price: Optional[float] = 100.0
    order_item_profit_ratio: Optional[float] = 0.1
    order_item_total: Optional[float] = 100.0
    sales: Optional[float] = 100.0
    sales_per_customer: Optional[float] = 100.0
    benefit_per_order: Optional[float] = 10.0
    order_profit: Optional[float] = 10.0
    latitude: Optional[float] = 25.2048  # Default: Jebel Ali / Dubai
    longitude: Optional[float] = 55.2708
    # Weather features (injected by Express backend)
    weather_temp: Optional[float] = None
    weather_wind: Optional[float] = None
    weather_humidity: Optional[float] = None


class PredictionResponse(BaseModel):
    risk_score: float
    predicted_delay_days: float
    delay_category: str
    rf_prediction: float
    xgb_prediction: float
    shap_values: Dict[str, float]
    top_risk_factors: list
    model_metrics: Dict[str, Any]


# ── Helper Functions ─────────────────────────────────────────
def safe_encode(encoder_name: str, value: str) -> int:
    """Safely encode a categorical value, returning 0 if unknown."""
    le = label_encoders.get(encoder_name)
    if le is None:
        return 0
    try:
        return int(le.transform([value])[0])
    except (ValueError, KeyError):
        return 0


def build_feature_vector(req: PredictionRequest) -> pd.DataFrame:
    """Convert request into a feature DataFrame matching training format."""
    features = {
        'Days for shipment (scheduled)': req.scheduled_days,
        'Order Item Quantity': req.order_item_quantity,
        'Order Item Discount': req.order_item_discount,
        'Order Item Discount Rate': req.order_item_discount_rate,
        'Order Item Product Price': req.product_price,
        'Order Item Profit Ratio': req.order_item_profit_ratio,
        'Order Item Total': req.order_item_total,
        'Sales': req.sales,
        'Sales per customer': req.sales_per_customer,
        'Benefit per order': req.benefit_per_order,
        'Order Profit Per Order': req.order_profit,
        'Product Price': req.product_price,
        'Late_delivery_risk': 0,  # Will be predicted
        'Latitude': req.latitude,
        'Longitude': req.longitude,
        'Shipping Mode': safe_encode('Shipping Mode', req.shipping_mode),
        'Customer Segment': safe_encode('Customer Segment', req.customer_segment),
        'Order Region': safe_encode('Order Region', req.order_region),
        'Category Name': safe_encode('Category Name', req.category_name),
        'Market': safe_encode('Market', req.market),
        'Type': safe_encode('Type', req.order_type),
        'Order Status': safe_encode('Order Status', req.order_status),
        'Delivery Status': 0,  # Unknown at prediction time
    }

    return pd.DataFrame([features], columns=feature_names)


def calculate_risk_score(rf_pred: float, xgb_pred: float, weather_temp=None, weather_wind=None, news_sentiment=None, shipping_mode=None) -> float:
    """
    Calculate risk score (0-100) using a multi-signal approach.
    Combines ML prediction, weather severity, and logistics context.
    """
    avg_delay = (rf_pred + xgb_pred) / 2

    # 1. Delay-based risk (0-40 points)
    # Any positive delay is risky. Negative = early = good.
    if avg_delay <= -1:
        delay_risk = 5  # Very early = minimal risk
    elif avg_delay <= 0:
        delay_risk = 15  # On time = low risk
    elif avg_delay <= 0.5:
        delay_risk = 25  # Slight delay
    elif avg_delay <= 1:
        delay_risk = 32  # Minor delay
    elif avg_delay <= 2:
        delay_risk = 38  # Moderate
    else:
        delay_risk = 40  # Severe

    # 2. Weather risk (0-25 points)
    weather_risk = 0
    if weather_wind:
        if weather_wind > 80:
            weather_risk += 25  # Hurricane force
        elif weather_wind > 40:
            weather_risk += 18  # Storm
        elif weather_wind > 25:
            weather_risk += 12  # High winds
        elif weather_wind > 15:
            weather_risk += 6   # Moderate winds
    if weather_temp:
        if weather_temp > 45 or weather_temp < -10:
            weather_risk = min(25, weather_risk + 10)  # Extreme temp
        elif weather_temp > 38 or weather_temp < 0:
            weather_risk = min(25, weather_risk + 5)

    # 3. Shipping mode risk (0-15 points)
    mode_risk = 0
    if shipping_mode:
        mode_map = {'Same Day': 12, 'First Class': 8, 'Second Class': 5, 'Standard Class': 3}
        mode_risk = mode_map.get(shipping_mode, 5)

    # 4. Model uncertainty (0-10 points)
    model_diff = abs(rf_pred - xgb_pred)
    uncertainty_risk = min(10, model_diff * 8)

    # 5. Baseline volatility (0-10 points) — adds natural variation
    import hashlib
    hash_val = int(hashlib.md5(f"{rf_pred}{xgb_pred}".encode()).hexdigest()[:8], 16)
    volatility = (hash_val % 10)

    risk = delay_risk + weather_risk + mode_risk + uncertainty_risk + volatility
    return round(min(100, max(0, risk)), 1)


def get_delay_category(delay: float) -> str:
    """Categorize delay into human-readable risk levels."""
    if delay <= -1:
        return "Early Arrival"
    elif delay <= 0:
        return "On Time"
    elif delay <= 1:
        return "Minor Delay"
    elif delay <= 3:
        return "Moderate Delay"
    else:
        return "Severe Delay"


# ── API Endpoints ────────────────────────────────────────────
@app.get("/health")
def health_check():
    return {"status": "healthy", "models_loaded": True}


@app.post("/predict", response_model=PredictionResponse)
def predict_delay(req: PredictionRequest):
    try:
        # Build feature vector
        X = build_feature_vector(req)

        # Model predictions
        rf_pred = float(rf_model.predict(X)[0])
        xgb_pred = float(xgb_model.predict(X)[0])
        avg_pred = (rf_pred + xgb_pred) / 2

        # SHAP explanation
        shap_vals = rf_explainer.shap_values(X)
        shap_dict = {}
        for i, name in enumerate(feature_names):
            shap_dict[name] = round(float(shap_vals[0][i]), 4)

        # Sort by absolute impact
        sorted_factors = sorted(
            shap_dict.items(),
            key=lambda x: abs(x[1]),
            reverse=True
        )

        top_factors = [
            {
                "feature": name,
                "impact": val,
                "direction": "increases risk" if val > 0 else "decreases risk",
                "importance": round(abs(val), 4)
            }
            for name, val in sorted_factors[:8]
        ]

        # Risk score
        risk_score = calculate_risk_score(
            rf_pred, xgb_pred,
            req.weather_temp, req.weather_wind,
            shipping_mode=req.shipping_mode
        )

        return PredictionResponse(
            risk_score=risk_score,
            predicted_delay_days=round(avg_pred, 2),
            delay_category=get_delay_category(avg_pred),
            rf_prediction=round(rf_pred, 4),
            xgb_prediction=round(xgb_pred, 4),
            shap_values=shap_dict,
            top_risk_factors=top_factors,
            model_metrics={
                'rf': dataset_stats['rf_metrics'],
                'xgb': dataset_stats['xgb_metrics'],
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/model-info")
def model_info():
    return {
        "models": ["RandomForest", "XGBoost"],
        "features": feature_names,
        "metrics": {
            "rf": dataset_stats['rf_metrics'],
            "xgb": dataset_stats['xgb_metrics'],
        },
        "encodings": {
            "shipping_modes": list(dataset_stats['shipping_mode_map'].keys()),
            "order_regions": list(dataset_stats['order_region_map'].keys()),
            "markets": list(dataset_stats['market_map'].keys()),
            "categories": list(dataset_stats['category_map'].keys()),
            "segments": list(dataset_stats['segment_map'].keys()),
        }
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
