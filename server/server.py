

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import joblib
import re
from datetime import datetime


app = FastAPI(title="MailWatch Scam Detector API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



class EmailText(BaseModel):
    sender: str = ""  # 👈 new field
    subject: str = ""
    body: str = ""



import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

try:
    vectorizer_path = os.path.join(BASE_DIR, "vectorizer.joblib")
    clf_path = os.path.join(BASE_DIR, "classifier.joblib")

    vectorizer = joblib.load(vectorizer_path)
    clf = joblib.load(clf_path)

    print("✅ Model and vectorizer loaded successfully.")
except Exception as e:
    vectorizer = clf = None
    print("⚠️ Model artifacts not loaded:", e)



TRUSTED_DOMAINS = {
    "google.com": ["no-reply@google.com", "security@google.com"],
    "apple.com": ["no-reply@apple.com", "id@apple.com"],
    "linkedin.com": ["@linkedin.com"],
    "github.com": ["noreply@github.com"],
    "amazon.com": ["no-reply@amazon.com"],
    "microsoft.com": ["account-security-noreply@account.microsoft.com"],
    "supabase.com": ["team@supabase.com"],
    "indeed.com": ["@indeed.com"],
    "openai.com": ["@openai.com"],
}



def get_sender_domain(sender: str) -> str:
    match = re.search(r"@([A-Za-z0-9.-]+)", sender or "")
    return match.group(1).lower() if match else ""



@app.post("/predict")
def predict_email(payload: EmailText):
    if vectorizer is None or clf is None:
        raise HTTPException(status_code=500, detail="Model not loaded")

    text = (payload.subject or "") + " " + (payload.body or "")
    if not text.strip():
        raise HTTPException(status_code=400, detail="Empty email text")

    try:
        X = vectorizer.transform([text])
        base_prob = float(clf.predict_proba(X)[0][1])
        label = 1 if base_prob >= 0.5 else 0

        sender_domain = get_sender_domain(payload.sender)
        lowered_prob = base_prob
        trusted_hit = False

       
        for domain, senders in TRUSTED_DOMAINS.items():
            if sender_domain.endswith(domain):
                lowered_prob *= 0.2  
                label = 0
                trusted_hit = True
                break

       
        if lowered_prob >= 0.8:
            risk_level = "High"
        elif lowered_prob >= 0.6:
            risk_level = "Medium"
        else:
            risk_level = "Low"

        
        with open("scan_logs.csv", "a", encoding="utf-8") as f:
            f.write(
                f"{datetime.now()},{payload.sender},{payload.subject},{round(lowered_prob,3)},{risk_level}\n"
            )

        return {
            "scam_probability": round(lowered_prob, 3),
            "label": label,
            "risk_level": risk_level,
            "sender_domain": sender_domain,
            "trusted_sender": trusted_hit,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {e}")



@app.get("/")
def home():
    return {
        "message": "MailWatch API running ✅",
        "model_status": "Loaded" if clf else "Not Loaded",
    }
