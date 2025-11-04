
## 🧠 HR Attrition Prediction — Backend

This backend powers the **HR Analytics Attrition AI**, a system that predicts employee turnover using machine learning.
It’s built with **FastAPI**, **XGBoost**, and **Python**, designed for clarity, explainability, and future dashboard integration with **Next.js**.

---

### 🚀 Overview

The system:

* Trains an **XGBoost** model using IBM HR Analytics data.
* Predicts the likelihood of an employee leaving (“Attrition”).
* Outputs clean metrics, visuals, and explainable results.
* Connects easily to a Next.js analytics dashboard or API client.

---

### 🏗️ Project Structure

```
backend/
├── data/
│   └── ibm_hr_attrition.csv       # Dataset
│   └── prepare_data.py            # Data cleaning + encoding
├── model/
│   ├── train_model.py             # Main training script
│   ├── model.pkl                  # Trained model (auto-generated)
│   └── encoder.pkl                # Label encoders (auto-generated)
├── outputs/
│   ├── metrics.json               # Training performance metrics
│   └── confusion_matrix.png       # Visual confusion matrix
├── app/
│   ├── main.py                    # FastAPI entry point (prediction endpoints)
│   └── routes/                    # API routes (predict, retrain, etc.)
├── requirements.txt
└── README.md
```

---

### ⚙️ Setup & Installation

#### 1. Clone the repository

```bash
git clone https://github.com/bravonokoth/hranalytics_attrition.git
cd hranalytics_attrition/backend
```

#### 2. Create a virtual environment

```bash
python3 -m venv .venv
source .venv/bin/activate
```

#### 3. Install dependencies

```bash
pip install -r requirements.txt
```

---

### 📊 Training the Model

Run this to train the model on the HR dataset:

```bash
python model/train_model.py
```

Expected output (simplified):

```
🚀 HR Attrition AI — Training Summary
────────────────────────────────────────
📊 Accuracy:      0.871 → Model correctly predicts 87.1% of cases
🎯 Precision:     0.864 → How often predictions were right when it said 'leaving'
🔁 Recall:        0.852 → How many actual leavers it caught
⚖️  F1-Score:     0.858 → Overall performance balance
✅ Model training completed successfully.
```

Artifacts will appear in:

* `model/model.pkl` → trained model
* `model/encoder.pkl` → categorical encoders
* `outputs/metrics.json` → key metrics
* `outputs/confusion_matrix.png` → confusion matrix visualization

---

### ⚡ API Endpoints (FastAPI)

Start the API:

```bash
uvicorn app.main:app --reload
```

#### Base URL

```
http://127.0.0.1:8000
```

#### Routes

| Method | Endpoint   | Description                                     |
| ------ | ---------- | ----------------------------------------------- |
| `POST` | `/predict` | Predict employee attrition using employee data  |
| `GET`  | `/metrics` | Retrieve latest model accuracy, precision, etc. |
| `POST` | `/retrain` | (Optional) Trigger retraining with new dataset  |

**Example Request:**

```json
POST /predict
{
  "Age": 29,
  "JobRole": "Research Scientist",
  "OverTime": "Yes",
  "MonthlyIncome": 4000,
  "YearsAtCompany": 3
}
```

**Response:**

```json
{
  "Attrition": "Yes",
  "Probability": 0.78
}
```

---

### 🧩 Tech Stack

| Layer                   | Tech                                      |
| ----------------------- | ----------------------------------------- |
| **Framework**           | FastAPI                                   |
| **Model**               | XGBoost                                   |
| **Preprocessing**       | pandas, scikit-learn                      |
| **Visualization**       | seaborn, matplotlib                       |
| **Storage**             | joblib (for serialized model + encoders)  |
| **Dashboard (planned)** | Next.js + Vercel (frontend visualization) |

---

### 💡 Understanding the Metrics

| Metric        | Meaning                                                 |
| ------------- | ------------------------------------------------------- |
| **Accuracy**  | Overall correctness of predictions                      |
| **Precision** | How often the model is right when it predicts attrition |
| **Recall**    | How well it captures real attrition cases               |
| **F1 Score**  | Balance between Precision and Recall                    |

---



### 🧑‍💻 Authors

**Bravon Okoth **
Software Developer | Full Stack Engineer | Fintech & AI Enthusiast
🔗 [GitHub](https://github.com/bravonokoth) • [Bitbucket](https://bitbucket.org/tecretor)

---
