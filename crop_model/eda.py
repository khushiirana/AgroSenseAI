import pandas as pd
import matplotlib.pyplot as plt

# Load dataset
df = pd.read_csv("dataset/Crop_recommendation.csv")

# Display first 5 rows
print(df.head())

# Count records for each crop
crop_count = df["label"].value_counts()

# Plot
plt.figure(figsize=(12,6))
crop_count.plot(kind="bar")

plt.title("Crop Distribution")
plt.xlabel("Crop")
plt.ylabel("Number of Records")

plt.xticks(rotation=45)

plt.tight_layout()

plt.show()

# Histograms for all numerical features
df.hist(figsize=(14, 10), bins=20)

plt.suptitle("Distribution of Features", fontsize=16)
plt.tight_layout()

plt.show()