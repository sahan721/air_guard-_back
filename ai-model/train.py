import pandas as pd
import joblib
import os

from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split

from sklearn.metrics import (
    mean_absolute_error,
    mean_squared_error,
    r2_score
)


DATA_PATH = "data/training_dataset.csv"

MODEL_FOLDER = "models"

MODEL_PATH = "models/air_quality_model.pkl"

FEATURE_PATH = "models/feature_columns.pkl"


def train_model():

    print("\nLoading training data...")

    df = pd.read_csv(DATA_PATH)


    print(f"Dataset rows: {len(df)}")


    # Columns AI should predict
    targets = [

        "target_pm1_0",

        "target_pm2_5",

        "target_pm10",

        "target_aqi"

    ]


    # Remove columns AI should not learn from
    remove_columns = [

        "recorded_at",

        "device_id",

        *targets

    ]


    features = [

        col for col in df.columns

        if col not in remove_columns

    ]


    X = df[features]

    y = df[targets]


    print("\nFeatures:")

    print(features)


    print("\nTraining model...")


    X_train, X_test, y_train, y_test = train_test_split(

        X,

        y,

        test_size=0.2,

        random_state=42

    )


    model = RandomForestRegressor(

        n_estimators=200,

        random_state=42,

        n_jobs=-1

    )


    model.fit(

        X_train,

        y_train

    )


    print("\nTesting model...")


    predictions = model.predict(
        X_test
    )


    mae = mean_absolute_error(
        y_test,
        predictions
    )


    rmse = mean_squared_error(
        y_test,
        predictions
    ) ** 0.5


    r2 = r2_score(
        y_test,
        predictions
    )


    print("\n===== MODEL RESULTS =====")

    print(
        f"MAE: {mae:.2f}"
    )

    print(
        f"RMSE: {rmse:.2f}"
    )

    print(
        f"R2 Score: {r2:.2f}"
    )


    os.makedirs(
        MODEL_FOLDER,
        exist_ok=True
    )


    joblib.dump(
        model,
        MODEL_PATH
    )


    joblib.dump(
        features,
        FEATURE_PATH
    )


    print("\nModel saved successfully")

    print(MODEL_PATH)

    print(FEATURE_PATH)



if __name__ == "__main__":

    train_model()