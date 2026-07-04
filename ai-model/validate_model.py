import pandas as pd
import joblib
import numpy as np

from sklearn.metrics import (
    mean_absolute_error,
    mean_squared_error,
    r2_score
)


# =========================
# LOAD MODEL
# =========================

model = joblib.load(
    "models/air_quality_model.pkl"
)


features = joblib.load(
    "models/feature_columns.pkl"
)


# =========================
# LOAD DATASET
# =========================

df = pd.read_csv(
    "data/training_dataset.csv"
)


targets = [

    "target_pm1_0",

    "target_pm2_5",

    "target_pm10",

    "target_aqi"

]


X = df[features]

y = df[targets]


# =========================
# MAKE PREDICTIONS
# =========================


predictions = model.predict(X)


# =========================
# ACCURACY CHECK
# =========================


print("\n===== VALIDATION RESULTS =====")


print(
    "MAE:",
    mean_absolute_error(
        y,
        predictions
    )
)


print(
    "RMSE:",
    np.sqrt(
        mean_squared_error(
            y,
            predictions
        )
    )
)


print(
    "R2:",
    r2_score(
        y,
        predictions
    )
)



# =========================
# RANDOM SAMPLE CHECK
# =========================


samples = df.sample(10)


sample_predictions = model.predict(
    samples[features]
)


print(
    "\n===== SAMPLE PREDICTIONS ====="
)


for i in range(
    len(samples)
):

    print(
        "\n----------------"
    )


    print(
        "CURRENT AQI:",
        samples.iloc[i]["aqi"]
    )


    print(
        "REAL FUTURE AQI:",
        samples.iloc[i]["target_aqi"]
    )


    print(
        "AI PREDICTED AQI:",
        round(
            sample_predictions[i][3],
            2
        )
    )


    print(
        "REAL PM2.5:",
        samples.iloc[i]["target_pm2_5"]
    )


    print(
        "PREDICTED PM2.5:",
        round(
            sample_predictions[i][1],
            2
        )
    )



# =========================
# FEATURE IMPORTANCE
# =========================


importance = pd.DataFrame(

    {

        "feature": features,

        "importance": model.feature_importances_

    }

)


importance = importance.sort_values(

    by="importance",

    ascending=False

)


print(
    "\n===== IMPORTANT FEATURES ====="
)


print(
    importance.head(15)
)