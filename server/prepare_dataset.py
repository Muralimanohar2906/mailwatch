import pandas as pd

df = pd.read_csv("emails_combined.csv")

# Identify possible text and label columns
possible_text_cols = ["body", "text", "content", "message"]
possible_subject_cols = ["subject", "Subject"]
possible_label_cols = ["label", "class", "Category", "spam"]

# Create unified columns
df["subject"] = df[[c for c in possible_subject_cols if c in df.columns]].bfill(axis=1).iloc[:, 0].fillna("")
df["body"] = df[[c for c in possible_text_cols if c in df.columns]].bfill(axis=1).iloc[:, 0].fillna("")
df["label"] = df[[c for c in possible_label_cols if c in df.columns]].bfill(axis=1).iloc[:, 0].fillna("")

# Convert labels to numeric (1=scam/spam, 0=ham)
df["label"] = df["label"].astype(str).str.lower().replace({
    "spam": 1, "phishing": 1, "fraud": 1, "scam": 1,
    "ham": 0, "legit": 0, "normal": 0
}).astype(int)

# Keep only what we need
clean_df = df[["subject", "body", "label"]]
clean_df.to_csv("emails_labeled.csv", index=False)

print("✅ Cleaned dataset saved as 'emails_labeled.csv'")
print(clean_df.head())
