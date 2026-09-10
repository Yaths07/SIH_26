import pandas as pd
import joblib
from sklearn.ensemble import IsolationForest

# 1. Load the dataset from CSV
print("Loading dataset...")
df = pd.read_csv("dataset.csv")

# 2. Select Features (X)
# We train the anomaly detection model purely on numerical metrics
X = df[["sanctioned_amount", "estimated_duration_months"]]

# 3. Initialize & Train IsolationForest
# contamination=0.15 matches the ~15% fraud rate we generated in the dataset
print("Training IsolationForest model...")
model = IsolationForest(
    n_estimators=100, 
    contamination=0.15, 
    random_state=42
)
model.fit(X)

# 4. Quick Test Run
# decision_function outputs anomaly scores (lower = more anomalous)
scores = model.decision_function(X)
# predict returns -1 for anomalies/fraud, 1 for normal data
predictions = model.predict(X)

print("\n--- Model Training Summary ---")
print(f"Total Records Trained: {len(df)}")
print(f"Anomalies Detected in Training Set: {(predictions == -1).sum()}")
print(f"Normal Entries in Training Set: {(predictions == 1).sum()}")

# 5. Save Model File
model_filename = "fraud_model.pkl"
joblib.dump(model, model_filename)
print(f"\nModel successfully saved as '{model_filename}'!")