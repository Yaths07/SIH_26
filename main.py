import joblib
import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from supabase import create_client, Client

# --- SUPABASE CONFIGURATION ---
SUPABASE_URL = "https://qiflevfedppedojnwwbn.supabase.co"
SUPABASE_KEY = "sb_publishable_-PO1wOCIsFj2DsV3l0n0Dw_X3AOXLrm"

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# --- LOAD TRAINED ISOLATION FOREST MODEL ---
model = joblib.load("fraud_model.pkl")

app = FastAPI(title="MPLADS AI Monitoring API")

# Enable CORS so your React frontend can talk to this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Input Schema for incoming requests
class ProjectData(BaseModel):
    title: str
    category: str
    sanctioned_amount: float
    estimated_duration_months: int
    location: str

@app.get("/")
def read_root():
    return {"message": "MPLADS AI Monitoring API is running!"}

@app.post("/analyze-project")
def analyze_and_save_project(data: ProjectData):
    try:
        # Prepare feature vector for model prediction
        features = np.array([[data.sanctioned_amount, data.estimated_duration_months]])
        
        # IsolationForest decision_function outputs values where lower/negative means higher anomaly
        anomaly_score = model.decision_function(features)[0]
        prediction = model.predict(features)[0]  # -1 = anomaly/fraud, 1 = normal
        
        # Map raw decision score to a 0–100 Risk Score scale
        # Typically scores fall between -0.3 and 0.3
        risk_score = int(np.clip((0.2 - anomaly_score) * 150, 0, 100))
        
        is_fraud = bool(prediction == -1)
        
        # Set dynamic flag reason based on risk score
        if is_fraud or risk_score > 60:
            flag_reason = f"High Anomaly Detected: Sanctioned amount (₹{data.sanctioned_amount:,.2f}) or duration ({data.estimated_duration_months} months) deviates significantly from baseline."
        else:
            flag_reason = "Parameters within normal expected limits."

        # Insert project record into Supabase
        payload = {
            "title": data.title,
            "category": data.category,
            "sanctioned_amount": data.sanctioned_amount,
            "estimated_duration_months": data.estimated_duration_months,
            "location": data.location,
            "is_fraud": is_fraud,
            "risk_score": risk_score,
            "flag_reason": flag_reason
        }
        
        response = supabase.table("projects").insert(payload).execute()
        
        return {
            "status": "success",
            "is_fraud": is_fraud,
            "risk_score": risk_score,
            "flag_reason": flag_reason,
            "data": response.data
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/projects")
def get_all_projects():
    try:
        response = supabase.table("projects").select("*").order("id", desc=True).execute()
        return {"status": "success", "data": response.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))