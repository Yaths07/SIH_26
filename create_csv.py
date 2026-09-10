import csv
import random

# Categories and location pools
categories = ["Infrastructure", "Education", "Water", "Energy", "Healthcare"]
districts = ["Patna", "Gaya", "Muzaffarpur", "Bhagalpur", "Darbhanga", "Purnia", "Gopalganj"]

projects = []
NUM_RECORDS = 1000

print(f"Generating {NUM_RECORDS} rows for dataset.csv...")

for i in range(NUM_RECORDS):
    category = random.choice(categories)
    location = f"Ward {random.randint(1, 35)}, {random.choice(districts)}"
    
    # Set ~15% of records as anomalies/fraudulent
    is_fraud = random.random() < 0.15 
    
    if category == "Water":
        title = f"{random.choice(['Repair', 'Installation'])} of Tube Well"
        normal_cost, normal_dur = random.randint(100000, 500000), random.randint(1, 6)
        fraud_cost, fraud_dur = random.randint(2500000, 6000000), random.randint(12, 24)
        fraud_reason = "Severe cost anomaly: Repair cost far exceeds standard replacement limit."
        
    elif category == "Infrastructure":
        title = f"Construction of {random.choice(['Concrete Road', 'Drainage Network', 'Community Center'])}"
        normal_cost, normal_dur = random.randint(1000000, 5000000), random.randint(3, 12)
        fraud_cost, fraud_dur = random.randint(15000000, 40000000), random.randint(24, 48)
        fraud_reason = "Cost and duration significantly exceed regional median benchmarks."
        
    elif category == "Energy":
        title = "Installation of Solar Streetlights"
        normal_cost, normal_dur = random.randint(300000, 1000000), random.randint(1, 4)
        fraud_cost, fraud_dur = random.randint(5000000, 12000000), random.randint(12, 24)
        fraud_reason = "Inflated unit costs relative to market procurement standards."
        
    elif category == "Education":
        title = f"{random.choice(['Renovation', 'Construction'])} of Primary School Building"
        normal_cost, normal_dur = random.randint(1500000, 6000000), random.randint(4, 12)
        fraud_cost, fraud_dur = random.randint(20000000, 50000000), random.randint(24, 36)
        fraud_reason = "Cost estimate 300%+ above standard government caps."
        
    else:  # Healthcare
        title = "Supply of Primary Health Center Equipment"
        normal_cost, normal_dur = random.randint(500000, 2000000), random.randint(2, 6)
        fraud_cost, fraud_dur = random.randint(8000000, 20000000), random.randint(12, 18)
        fraud_reason = "Procurement cost anomaly detected for medical apparatus."

    if is_fraud:
        amount = fraud_cost
        duration = fraud_dur
        risk_score = random.randint(75, 98)
        reason = fraud_reason
    else:
        amount = normal_cost
        duration = normal_dur
        risk_score = random.randint(2, 25)
        reason = "Parameters within expected benchmarks"

    projects.append({
        "title": title,
        "category": category,
        "sanctioned_amount": amount,
        "estimated_duration_months": duration,
        "location": location,
        "is_fraud": is_fraud,
        "risk_score": risk_score,
        "flag_reason": reason
    })

# Write directly to CSV file
headers = ["title", "category", "sanctioned_amount", "estimated_duration_months", "location", "is_fraud", "risk_score", "flag_reason"]

with open("dataset.csv", mode="w", newline="", encoding="utf-8") as file:
    writer = csv.DictWriter(file, fieldnames=headers)
    writer.writeheader()
    writer.writerows(projects)

print("Success! Created 'dataset.csv' with 1,000 entries.")