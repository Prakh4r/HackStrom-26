import joblib
import os

MODELS_DIR = r'c:\Users\Abhay\Desktop\Hardcoders\ml-service\models'
stats_path = os.path.join(MODELS_DIR, 'dataset_stats.joblib')

if os.path.exists(stats_path):
    stats = joblib.load(stats_path)
    print("--- Model Training Metrics ---")
    print(f"Random Forest Metrics: {stats.get('rf_metrics')}")
    print(f"XGBoost Metrics: {stats.get('xgb_metrics')}")
    print("\n--- Shipment Delay Stats (for Risk Scoring) ---")
    delay_stats = stats.get('shipping_delay_stats', {})
    print(f"Min Delay: {delay_stats.get('min')}")
    print(f"Max Delay: {delay_stats.get('max')}")
    print(f"Mean Delay: {delay_stats.get('mean')}")
    print(f"Std Delay: {delay_stats.get('std')}")
else:
    print(f"Error: Could not find stats at {stats_path}")
