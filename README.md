# MailWatch - Scam Detector (Prototype)

**MailWatch** is a complete working prototype that detects scam or phishing emails directly within Gmail or Outlook Web using a simple local AI model and Chrome Extension.

---

## 🚀 Features
- Detects scam/suspicious emails using a Logistic Regression model trained on TF-IDF features.
- Works locally — your data never leaves your device.
- Integrates directly into Gmail and Outlook Web via Chrome Extension.
- Shows a visual banner with scam probability and status.
- Easy to retrain or replace model.

---

## 🧠 Architecture Overview
```
mailwatch/
├── extension/
│   ├── manifest.json
│   ├── content.js
│   ├── background.js
│   ├── popup.html
│   ├── popup.js
│   └── icon.png
├── server/
│   ├── server.py
│   ├── train_model.py
│   ├── requirements.txt
│   └── emails_labeled.csv
└── README.md
```

---

## ⚙️ Setup Instructions

### 1️⃣ Clone and set up the backend
```bash
cd server
python -m venv .venv
. .venv/bin/activate   # mac/linux
# or .\.venv\Scripts\activate on Windows
pip install -r requirements.txt
```

### 2️⃣ Train model (optional)
```bash
python train_model.py
```
This creates `vectorizer.joblib` and `classifier.joblib`.

### 3️⃣ Run FastAPI server
```bash
uvicorn server:app --reload --port 8000
```

---

### 4️⃣ Install Chrome Extension
1. Open Chrome and navigate to **chrome://extensions/**
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select the `extension/` folder

Now open Gmail or Outlook Web — you’ll see a banner at the top of any opened email showing scam risk.

---

## 📊 Sample dataset
`server/emails_labeled.csv`
```csv
subject,body,label
"Your account will be closed","Dear user, your account will be closed unless you verify now by clicking http://fake.example",1
"Meeting tomorrow","Hi team, reminder: meeting at 10 AM tomorrow in conference room.",0
"Urgent: Refund available","You have been selected for a refund. Send your bank details to claim.",1
```

---

## 🔒 Privacy & Security
- Local-only inference (no remote requests).
- Minimal data collection.
- On-device TF-IDF model — fully transparent and editable.

---

## 🧩 Future Enhancements
- Convert sklearn pipeline to TFJS for 100% browser-based inference.
- Add SPF/DKIM domain checks.
- Improve model and add dataset augmentation.

---