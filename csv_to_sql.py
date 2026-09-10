import csv

# Open the CSV file and read the rows
with open("dataset.csv", mode="r", encoding="utf-8") as csv_file:
    reader = csv.DictReader(csv_file)
    
    sql_statements = []
    sql_statements.append("-- Bulk insert 1000 generated projects\n")
    
    values_list = []
    for row in reader:
        # Escape single quotes in text fields to prevent SQL syntax errors
        title = row['title'].replace("'", "''")
        category = row['category'].replace("'", "''")
        location = row['location'].replace("'", "''")
        reason = row['flag_reason'].replace("'", "''")
        
        amount = row['sanctioned_amount']
        duration = row['estimated_duration_months']
        is_fraud = row['is_fraud'].upper()  # Converts 'true'/'false' to TRUE/FALSE
        risk_score = row['risk_score']
        
        # Format as an SQL VALUE tuple
        value_str = f"('{title}', '{category}', {amount}, {duration}, '{location}', {is_fraud}, {risk_score}, '{reason}')"
        values_list.append(value_str)

# Combine every 200 rows into a single batch INSERT statement for efficiency
batch_size = 200
with open("seed_data.sql", mode="w", encoding="utf-8") as sql_file:
    for i in range(0, len(values_list), batch_size):
        batch = values_list[i:i + batch_size]
        query = (
            "INSERT INTO projects (title, category, sanctioned_amount, estimated_duration_months, location, is_fraud, risk_score, flag_reason)\nVALUES\n"
            + ",\n".join(batch)
            + ";\n\n"
        )
        sql_file.write(query)

print("Done! 'seed_data.sql' has been created successfully.")