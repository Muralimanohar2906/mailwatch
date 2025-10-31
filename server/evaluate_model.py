import pandas as pd
import joblib
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score


vectorizer = joblib.load("vectorizer.joblib")
clf = joblib.load("classifier.joblib")


df = pd.read_csv("emails_labeled.csv")

text_data = (df["subject"].fillna("") + " " + df["body"].fillna("")).tolist()
labels = df["label"].tolist()  


X = vectorizer.transform(text_data)
y_pred = clf.predict(X)
y_proba = clf.predict_proba(X)[:, 1]


accuracy = accuracy_score(labels, y_pred)
precision = precision_score(labels, y_pred)
recall = recall_score(labels, y_pred)
f1 = f1_score(labels, y_pred)
auc = roc_auc_score(labels, y_proba)

print("\n📊 Model Evaluation Results")
print("=" * 40)
print(f"✅ Accuracy:  {accuracy:.4f}")
print(f"🎯 Precision: {precision:.4f}")
print(f"📈 Recall:    {recall:.4f}")
print(f"⚖️ F1-Score:  {f1:.4f}")
print(f"🚀 ROC-AUC:   {auc:.4f}")
