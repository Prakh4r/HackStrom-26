"""
Train Random Forest + XGBoost models on DataCo Supply Chain dataset.
Generates SHAP explainer and saves all artifacts to ./models/
Based on methodology from research papers:
- Paper 1: RF best performer in 48% of studies
- Paper 2: Ridge/SHAP/LIME explainability pipeline
- Paper 3: XGBoost MAE < 3 min for delay prediction
"""

import pandas as pd
import numpy as np
import joblib
import os
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from xgboost import XGBRegressor

print("=" * 60)
print("  PREDICTIVE DELAY & RISK INTELLIGENCE - MODEL TRAINING")
print("=" * 60)

# ── 1. Load Data ─────────────────────────────────────────────
print("\n[1/7] Loading dataset...")
df = pd.read_csv(
    os.path.join(os.path.dirname(__file__), '..', 'DataCoSupplyChainDataset.csv'),
    encoding='latin-1'
)
print(f"  Loaded {len(df)} records, {len(df.columns)} columns")

# ── 2. Feature Engineering ───────────────────────────────────
print("\n[2/7] Engineering features...")

# Target: shipping delay in days (actual - scheduled)
df['shipping_delay'] = df['Days for shipping (real)'] - df['Days for shipment (scheduled)']

# Select features relevant for delay prediction
feature_columns = [
    'Days for shipment (scheduled)',
    'Order Item Quantity',
    'Order Item Discount',
    'Order Item Discount Rate',
    'Order Item Product Price',
    'Order Item Profit Ratio',
    'Order Item Total',
    'Sales',
    'Sales per customer',
    'Benefit per order',
    'Order Profit Per Order',
    'Product Price',
    'Late_delivery_risk',
    'Latitude',
    'Longitude',
    # Categorical (will be encoded)
    'Shipping Mode',
    'Customer Segment',
    'Order Region',
    'Category Name',
    'Market',
    'Type',
    'Order Status',
    'Delivery Status',
]

# Keep only relevant columns
df_model = df[feature_columns + ['shipping_delay']].copy()

# Drop rows with missing values
df_model = df_model.dropna()
print(f"  Records after cleanup: {len(df_model)}")

# Encode categorical variables
label_encoders = {}
categorical_cols = ['Shipping Mode', 'Customer Segment', 'Order Region',
                    'Category Name', 'Market', 'Type', 'Order Status', 'Delivery Status']

for col in categorical_cols:
    le = LabelEncoder()
    df_model[col] = le.fit_transform(df_model[col].astype(str))
    label_encoders[col] = le
    print(f"  Encoded '{col}': {len(le.classes_)} classes")

# Feature names for SHAP
feature_names = [col for col in df_model.columns if col != 'shipping_delay']

print(f"  Total features: {len(feature_names)}")

# ── 3. Split Data ────────────────────────────────────────────
print("\n[3/7] Splitting data (80/20)...")
X = df_model.drop('shipping_delay', axis=1)
y = df_model['shipping_delay']

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)
print(f"  Train: {len(X_train)} | Test: {len(X_test)}")

# ── 4. Train Random Forest ──────────────────────────────────
print("\n[4/7] Training Random Forest Regressor...")
rf_model = RandomForestRegressor(
    n_estimators=100,
    max_depth=15,
    min_samples_split=10,
    min_samples_leaf=5,
    random_state=42,
    n_jobs=-1
)
rf_model.fit(X_train, y_train)

rf_pred = rf_model.predict(X_test)
rf_mae = mean_absolute_error(y_test, rf_pred)
rf_mse = mean_squared_error(y_test, rf_pred)
rf_r2 = r2_score(y_test, rf_pred)
print(f"  RF Results -> MAE: {rf_mae:.4f} | MSE: {rf_mse:.4f} | R2: {rf_r2:.4f}")

# ── 5. Train XGBoost ────────────────────────────────────────
print("\n[5/7] Training XGBoost Regressor...")
xgb_model = XGBRegressor(
    n_estimators=100,
    max_depth=10,
    learning_rate=0.1,
    subsample=0.8,
    colsample_bytree=0.8,
    random_state=42,
    n_jobs=-1
)
xgb_model.fit(X_train, y_train)

xgb_pred = xgb_model.predict(X_test)
xgb_mae = mean_absolute_error(y_test, xgb_pred)
xgb_mse = mean_squared_error(y_test, xgb_pred)
xgb_r2 = r2_score(y_test, xgb_pred)
print(f"  XGB Results -> MAE: {xgb_mae:.4f} | MSE: {xgb_mse:.4f} | R2: {xgb_r2:.4f}")

# ── 6. Generate SHAP Explainer ───────────────────────────────
print("\n[6/7] Generating SHAP explainer (using RF)...")
# Use a sample of training data for SHAP background
shap_background = X_train.sample(n=min(200, len(X_train)), random_state=42)

# ── 7. Save Models ───────────────────────────────────────────
print("\n[7/7] Saving models...")
models_dir = os.path.join(os.path.dirname(__file__), 'models')
os.makedirs(models_dir, exist_ok=True)

joblib.dump(rf_model, os.path.join(models_dir, 'rf_model.joblib'))
joblib.dump(xgb_model, os.path.join(models_dir, 'xgb_model.joblib'))
joblib.dump(label_encoders, os.path.join(models_dir, 'label_encoders.joblib'))
joblib.dump(feature_names, os.path.join(models_dir, 'feature_names.joblib'))
joblib.dump(shap_background, os.path.join(models_dir, 'shap_background.joblib'))

# Save dataset stats for the API to use as defaults
stats = {
    'feature_means': X_train.mean().to_dict(),
    'feature_medians': X_train.median().to_dict(),
    'shipping_delay_stats': {
        'mean': float(y.mean()),
        'std': float(y.std()),
        'min': float(y.min()),
        'max': float(y.max()),
    },
    'delivery_status_map': {int(k): v for k, v in enumerate(label_encoders['Delivery Status'].classes_)},
    'shipping_mode_map': {v: int(k) for k, v in enumerate(label_encoders['Shipping Mode'].classes_)},
    'order_region_map': {v: int(k) for k, v in enumerate(label_encoders['Order Region'].classes_)},
    'market_map': {v: int(k) for k, v in enumerate(label_encoders['Market'].classes_)},
    'category_map': {v: int(k) for k, v in enumerate(label_encoders['Category Name'].classes_)},
    'segment_map': {v: int(k) for k, v in enumerate(label_encoders['Customer Segment'].classes_)},
    'type_map': {v: int(k) for k, v in enumerate(label_encoders['Type'].classes_)},
    'order_status_map': {v: int(k) for k, v in enumerate(label_encoders['Order Status'].classes_)},
    'rf_metrics': {'mae': rf_mae, 'mse': rf_mse, 'r2': rf_r2},
    'xgb_metrics': {'mae': xgb_mae, 'mse': xgb_mse, 'r2': xgb_r2},
}
joblib.dump(stats, os.path.join(models_dir, 'dataset_stats.joblib'))

print(f"\n  All models saved to {models_dir}/")
print("\n" + "=" * 60)
print("  TRAINING COMPLETE!")
print(f"  Best model: {'RF' if rf_mae < xgb_mae else 'XGBoost'} (lower MAE)")
print("=" * 60)
