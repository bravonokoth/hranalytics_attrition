import joblib
import json
import os
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix
from xgboost import XGBClassifier
from data.prepare_data import load_and_prepare_data
import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd

DATA_PATH = "data/ibm_hr_attrition.csv"
OUTPUT_PATH = "outputs/"

os.makedirs(OUTPUT_PATH, exist_ok=True)

def train_model():
    X, y, encoders = load_and_prepare_data(DATA_PATH)

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    model = XGBClassifier(use_label_encoder=False, eval_metric="logloss", random_state=42)
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)

    report = classification_report(y_test, y_pred, output_dict=True)
    conf_matrix = confusion_matrix(y_test, y_pred)

    # Save model + encoders
    joblib.dump(model, "model/model.pkl")
    joblib.dump(encoders, "model/encoder.pkl")

    # Save metrics
    with open(os.path.join(OUTPUT_PATH, "metrics.json"), "w") as f:
        json.dump(report, f, indent=4)

    # Plot confusion matrix
    plt.figure(figsize=(5, 4))
    sns.heatmap(conf_matrix, annot=True, fmt="d", cmap="Blues")
    plt.title("Confusion Matrix")
    plt.savefig(os.path.join(OUTPUT_PATH, "confusion_matrix.png"))

    print("✅ Model trained and saved successfully.")
    print("Accuracy:", report["accuracy"])

if __name__ == "__main__":
    train_model()
