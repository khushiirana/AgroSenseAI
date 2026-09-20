import pandas as pd

# Load the dataset
df = pd.read_csv("dataset/Crop_recommendation.csv")

# Display first 5 rows
print("First 5 Rows:")
print(df.head())

# Shape of dataset
print("\nDataset Shape:")
print(df.shape)

# Column names
print("\nColumns:")
print(df.columns.tolist())

# Check missing values
print("\nMissing Values:")
print(df.isnull().sum())

# Information about dataset
print("\nDataset Info:")
print(df.info())

# Statistical summary
print("\nStatistical Summary:")
print(df.describe())

# Unique crop labels
print("\nCrop Categories:")
print(df["label"].unique())

# Number of samples for each crop
print("\nCrop Count:")
print(df["label"].value_counts())