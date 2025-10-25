from fastapi import FastAPI
from api.routes import predict, analytics

app = FastAPI(title="HR Analytics Attrition Predictor API", version="1.0")

app.include_router(predict.router)
app.include_router(analytics.router)

@app.get("/")
def root():
    return {"message": "Welcome to HRanalytics Attrition AI API!"}
