# train_model.py
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report
import joblib


df = pd.read_csv("emails_labeled.csv").fillna("")


df["text"] = df["subject"].astype(str) + " " + df["body"].astype(str)


X = df["text"]
y = df["label"].astype(int)


X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y if len(set(y)) > 1 else None
)


vectorizer = TfidfVectorizer(
    max_features=20000, ngram_range=(1, 2), stop_words="english"
)
X_train_tfidf = vectorizer.fit_transform(X_train)
X_test_tfidf = vectorizer.transform(X_test)


clf = LogisticRegression(max_iter=500, class_weight="balanced")
clf.fit(X_train_tfidf, y_train)


preds = clf.predict(X_test_tfidf)
print(classification_report(y_test, preds))


joblib.dump(vectorizer, "vectorizer.joblib")
joblib.dump(clf, "classifier.joblib")
print("Saved vectorizer.joblib and classifier.joblib")
