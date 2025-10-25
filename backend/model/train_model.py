import sys, os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from data.prepare_data import load_and_prepare_data
import joblib
import json
import os
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix
from xgboost import XGBClassifier
import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd

# === Paths ===
DATA_PATH = "data/ibm_hr_attrition.csv"
OUTPUT_PATH = "outputs/"
MODEL_PATH = "model/"

os.makedirs(OUTPUT_PATH, exist_ok=True)
os.makedirs(MODEL_PATH, exist_ok=True)

def train_model():
    # === 1️⃣ Load & Prepare Data ===
    X, y, encoders = load_and_prepare_data(DATA_PATH)
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # === 2️⃣ Train Model ===
    model = XGBClassifier(use_label_encoder=False, eval_metric="logloss", random_state=42)
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)

    # === 3️⃣ Evaluate ===
    report = classification_report(y_test, y_pred, output_dict=True)
    conf_matrix = confusion_matrix(y_test, y_pred)

    # === 4️⃣ Save Model + Encoders ===
    joblib.dump(model, os.path.join(MODEL_PATH, "model.pkl"))
    joblib.dump(encoders, os.path.join(MODEL_PATH, "encoder.pkl"))

    # === 5️⃣ Save Metrics ===
    with open(os.path.join(OUTPUT_PATH, "metrics.json"), "w") as f:
        json.dump(report, f, indent=4)

    # === 6️⃣ Confusion Matrix Plot ===
    plt.figure(figsize=(5, 4))
    sns.heatmap(conf_matrix, annot=True, fmt="d", cmap="Blues")
    plt.title("Confusion Matrix")
    plt.savefig(os.path.join(OUTPUT_PATH, "confusion_matrix.png"))
    plt.close()

    # === 7️⃣ Display Key Metrics ===
    accuracy = report["accuracy"]
    precision = report["weighted avg"]["precision"]
    recall = report["weighted avg"]["recall"]
    f1 = report["weighted avg"]["f1-score"]

    print("\n🚀 HR Attrition AI — Training Summary")
    print("────────────────────────────────────────")
    print(f"📊 Accuracy:      {accuracy:.3f} → Model correctly predicts {accuracy*100:.1f}% of cases")
    print(f"🎯 Precision:     {precision:.3f} → How often predictions were right when it said 'leaving'")
    print(f"🔁 Recall:        {recall:.3f} → How many actual leavers it caught")
    print(f"⚖️  F1-Score:      {f1:.3f} → Overall performance balance")
    print(f"🧠 Model Type:    XGBoostClassifier")
    print(f"📁 Saved Model:   {os.path.join(MODEL_PATH, 'model.pkl')}")
    print(f"📊 Metrics File:  {os.path.join(OUTPUT_PATH, 'metrics.json')}")
    print(f"📉 Confusion Mat: {os.path.join(OUTPUT_PATH, 'confusion_matrix.png')}")
    print("────────────────────────────────────────")
    print("✅ Model training completed successfully.\n")

if __name__ == "__main__":
    train_model()
