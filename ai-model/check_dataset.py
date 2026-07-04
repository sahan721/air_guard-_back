import pandas as pd


df = pd.read_csv(
    "data/training_dataset.csv"
)


print("\n===== DATASET INFO =====")
print(df.info())


print("\n===== MISSING VALUES =====")
print(df.isnull().sum())


print("\n===== FIRST 5 ROWS =====")
print(df.head())


print("\n===== TARGET CHECK =====")

print(
    df[
        [
            "pm2_5",
            "target_pm2_5",
            "aqi",
            "target_aqi"
        ]
    ].head(20)
)