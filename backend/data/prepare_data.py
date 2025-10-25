import pandas as pd
from sklearn.preprocessing import LabelEncoder

def load_and_prepare_data(filepath: str):
    df = pd.read_csv(filepath)

    # Drop irrelevant identifiers
    df = df.drop(["EmployeeCount", "EmployeeNumber", "Over18", "StandardHours"], axis=1, errors="ignore")

    # Encode categorical columns
    label_encoders = {}
    for col in df.select_dtypes(include=["object"]).columns:
        le = LabelEncoder()
        df[col] = le.fit_transform(df[col])
        label_encoders[col] = le

    X = df.drop("Attrition", axis=1)
    y = df["Attrition"]

    return X, y, label_encoders
