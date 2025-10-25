import joblib
import pandas as pd
import shap

def explain_model():
    model = joblib.load("model/model.pkl")
    X = pd.read_csv("data/ibm_hr_attrition.csv").drop("Attrition", axis=1)
    explainer = shap.Explainer(model)
    shap_values = explainer(X)
    shap.summary_plot(shap_values, X)

if __name__ == "__main__":
    explain_model()
