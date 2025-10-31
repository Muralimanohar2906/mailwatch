import pandas as pd
import glob

files = [
    "CEAS_08.csv",
    "Enron.csv",
    "Ling.csv",
    "Nazario.csv",
    "Nigerian_Fraud.csv",
    "phishing_email.csv",
    "research_scam.csv",
    "SpamAssasin.csv",
]

dataframes = []
for file in files:
    try:
        df = pd.read_csv(file, encoding="utf-8", on_bad_lines="skip")
        df["source"] = file
        dataframes.append(df)
        print(f"Loaded {file} ✅ Rows: {len(df)}")
    except Exception as e:
        print(f"⚠️ Could not read {file}: {e}")

combined = pd.concat(dataframes, ignore_index=True)
print(f"\n✅ Combined total rows: {len(combined)}")

print("\nColumns detected:", combined.columns.tolist())

combined.head(10).to_csv("combined_preview.csv", index=False)

combined.to_csv("emails_combined.csv", index=False)
print("\nSaved 'emails_combined.csv'")
