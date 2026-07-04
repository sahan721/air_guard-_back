from pathlib import Path

import numpy as np
import pandas as pd
from sqlalchemy import text

from database import get_connection


BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
OUTPUT_FILE = DATA_DIR / "training_dataset.csv"
CSV_FILE = DATA_DIR / "kandy_historical_6year_dataset.csv"


def clean_sensor_data(sensor_df: pd.DataFrame) -> pd.DataFrame:
    """Clean and validate sensor readings from PostgreSQL."""
    if sensor_df.empty:
        return sensor_df

    sensor_df = sensor_df.copy()
    sensor_df["recorded_at"] = pd.to_datetime(sensor_df["recorded_at"], utc=False, errors="coerce")
    sensor_df = sensor_df.dropna(subset=["recorded_at"])

    sensor_df = sensor_df[sensor_df["data_status"].astype(str).str.strip().str.lower() == "valid"].copy()

    numeric_columns = [
        "pm1_0",
        "pm2_5",
        "pm10",
        "temperature",
        "humidity",
        "aqi",
        "wifi_rssi",
        "pms_samples",
    ]

    for column in numeric_columns:
        sensor_df[column] = pd.to_numeric(sensor_df[column], errors="coerce")

    sensor_df = sensor_df[
        (sensor_df["pm1_0"].between(0, 1000))
        & (sensor_df["pm2_5"].between(0, 1000))
        & (sensor_df["pm10"].between(0, 1000))
        & (sensor_df["temperature"].between(-50, 60))
        & (sensor_df["humidity"].between(0, 100))
    ].copy()

    for column in numeric_columns:
        sensor_df[column] = sensor_df[column].fillna(sensor_df[column].median())

    sensor_df = sensor_df.sort_values("recorded_at").reset_index(drop=True)
    return sensor_df


def clean_weather_data(weather_df: pd.DataFrame) -> pd.DataFrame:
    """Clean and standardize weather data from PostgreSQL."""
    if weather_df.empty:
        return weather_df

    weather_df = weather_df.copy()
    weather_df["forecast_for"] = pd.to_datetime(weather_df["forecast_for"], utc=False, errors="coerce")
    weather_df = weather_df.dropna(subset=["forecast_for"])

    numeric_columns = [
        "temperature",
        "apparent_temperature",
        "humidity",
        "dew_point",
        "rainfall",
        "precipitation_probability",
        "pressure",
        "wind_speed",
        "wind_direction",
        "wind_gusts",
        "cloud_cover",
        "visibility",
        "uv_index",
        "boundary_layer_height",
    ]

    for column in numeric_columns:
        weather_df[column] = pd.to_numeric(weather_df[column], errors="coerce")

    for column in numeric_columns:
        weather_df[column] = weather_df[column].fillna(weather_df[column].median())

    weather_df = weather_df.sort_values("forecast_for").reset_index(drop=True)
    return weather_df


def load_database_data() -> tuple[pd.DataFrame, pd.DataFrame]:
    """Load historical sensor data and weather forecast data from PostgreSQL."""
    with get_connection() as connection:
        sensor_query = text(
            """
            SELECT
                history_id,
                device_id,
                recorded_at,
                pm1_0,
                pm2_5,
                pm10,
                temperature,
                humidity,
                aqi,
                wifi_rssi,
                pms_samples,
                data_status
            FROM historical_readings
            """
        )
        weather_query = text(
            """
            SELECT
                forecast_id,
                device_id,
                forecast_generated_at,
                forecast_for,
                temperature,
                apparent_temperature,
                humidity,
                dew_point,
                rainfall,
                precipitation_probability,
                pressure,
                wind_speed,
                wind_direction,
                wind_gusts,
                cloud_cover,
                visibility,
                uv_index,
                boundary_layer_height,
                weather_source
            FROM forecast_data
            """
        )

        sensor_df = pd.DataFrame(connection.execute(sensor_query).fetchall(), columns=[
            "history_id",
            "device_id",
            "recorded_at",
            "pm1_0",
            "pm2_5",
            "pm10",
            "temperature",
            "humidity",
            "aqi",
            "wifi_rssi",
            "pms_samples",
            "data_status",
        ])
        weather_df = pd.DataFrame(connection.execute(weather_query).fetchall(), columns=[
            "forecast_id",
            "device_id",
            "forecast_generated_at",
            "forecast_for",
            "temperature",
            "apparent_temperature",
            "humidity",
            "dew_point",
            "rainfall",
            "precipitation_probability",
            "pressure",
            "wind_speed",
            "wind_direction",
            "wind_gusts",
            "cloud_cover",
            "visibility",
            "uv_index",
            "boundary_layer_height",
            "weather_source",
        ])

    return sensor_df, weather_df


def normalize_csv_dataset(csv_path: Path) -> pd.DataFrame:
    """Load and normalize the historical CSV dataset to the training feature schema."""
    if not csv_path.exists():
        print("CSV dataset not found. Continuing with database data only.")
        return pd.DataFrame()

    csv_df = pd.read_csv(csv_path)
    csv_df = csv_df.copy()

    column_map = {
        "timestamp": "recorded_at",
        "temperature": "temperature",
        "humidity": "humidity",
        "month": "month",
        "hour_of_day": "hour",
        "day_of_week": "day_of_week",
        "is_weekend": "weekend",
        "is_poya_day": "poya_day",
        "is_public_holiday": "holiday",
        "traffic_intensity_score": "traffic_score",
        "pm25_current": "pm2_5",
        "pm10": "pm10",
        "aqi_index": "aqi",
        "wifi_rssi": "wifi_rssi",
        "pms_samples": "pms_samples",
        "pm25_target": "pm25_target",
    }

    normalized_columns = {}
    for column in csv_df.columns:
        normalized_name = str(column).strip().lower().replace(" ", "_")
        normalized_columns[column] = column_map.get(normalized_name, normalized_name)

    csv_df = csv_df.rename(columns=normalized_columns)

    if "recorded_at" in csv_df.columns:
        csv_df["recorded_at"] = pd.to_datetime(csv_df["recorded_at"], utc=False, errors="coerce")
        csv_df = csv_df.dropna(subset=["recorded_at"])

    if "device_id" not in csv_df.columns:
        csv_df["device_id"] = -1

    for column in ["pm2_5", "pm10", "temperature", "humidity", "aqi", "wifi_rssi", "pms_samples", "pm25_target"]:
        if column in csv_df.columns:
            csv_df[column] = pd.to_numeric(csv_df[column], errors="coerce")

    if "pm2_5" in csv_df.columns:
        csv_df["pm1_0"] = csv_df["pm2_5"] * 0.6

    if "hour" in csv_df.columns:
        csv_df["hour"] = pd.to_numeric(csv_df["hour"], errors="coerce").fillna(0).astype(int)
    if "day_of_week" in csv_df.columns:
        csv_df["day_of_week"] = pd.to_numeric(csv_df["day_of_week"], errors="coerce").fillna(0).astype(int)
    if "month" in csv_df.columns:
        csv_df["month"] = pd.to_numeric(csv_df["month"], errors="coerce").fillna(1).astype(int)
    if "weekend" in csv_df.columns:
        csv_df["weekend"] = csv_df["weekend"].astype(int).fillna(0)
    if "poya_day" in csv_df.columns:
        csv_df["poya_day"] = csv_df["poya_day"].astype(int).fillna(0)
    if "holiday" in csv_df.columns:
        csv_df["holiday"] = csv_df["holiday"].astype(int).fillna(0)
    if "traffic_score" in csv_df.columns:
        csv_df["traffic_score"] = pd.to_numeric(csv_df["traffic_score"], errors="coerce").fillna(0.0)

    csv_df["source"] = "csv"
    return csv_df


def add_time_features(df: pd.DataFrame) -> pd.DataFrame:
    """Create time-based features for the training dataset."""
    df = df.copy()
    timestamp_column = "recorded_at"
    if timestamp_column not in df.columns:
        raise KeyError("recorded_at column is required for feature engineering")

    df[timestamp_column] = pd.to_datetime(df[timestamp_column], utc=False, errors="coerce")
    df = df.dropna(subset=[timestamp_column]).sort_values(timestamp_column).reset_index(drop=True)

    if "hour" not in df.columns:
        df["hour"] = df[timestamp_column].dt.hour
    else:
        df["hour"] = pd.to_numeric(df["hour"], errors="coerce").fillna(0).astype(int)

    if "day_of_week" not in df.columns:
        df["day_of_week"] = df[timestamp_column].dt.dayofweek
    else:
        df["day_of_week"] = pd.to_numeric(df["day_of_week"], errors="coerce").fillna(0).astype(int)

    if "month" not in df.columns:
        df["month"] = df[timestamp_column].dt.month
    else:
        df["month"] = pd.to_numeric(df["month"], errors="coerce").fillna(1).astype(int)

    if "weekend" not in df.columns:
        df["weekend"] = df["day_of_week"].ge(5).astype(int)
    else:
        df["weekend"] = df["weekend"].astype(int).fillna(0)

    return df


def ensure_weather_columns(df: pd.DataFrame) -> pd.DataFrame:
    """Ensure the final dataset always contains the expected weather feature columns."""
    weather_columns = [
        "apparent_temperature",
        "dew_point",
        "rainfall",
        "precipitation_probability",
        "pressure",
        "wind_speed",
        "wind_direction",
        "wind_gusts",
        "cloud_cover",
        "visibility",
        "uv_index",
        "boundary_layer_height",
    ]
    df = df.copy()
    for column in weather_columns:
        if column not in df.columns:
            df[column] = np.nan
    return df


def add_kandy_features(df: pd.DataFrame) -> pd.DataFrame:
    """Add placeholder location-based features for Sri Lanka/Kandy."""
    df = df.copy()

    def poya_day(timestamp: pd.Timestamp) -> bool:
        return False

    def holiday(timestamp: pd.Timestamp) -> bool:
        return False

    def traffic_score(timestamp: pd.Timestamp) -> float:
        hour = timestamp.hour
        if timestamp.dayofweek < 5 and hour in {7, 8, 9, 17, 18, 19}:
            return 0.9
        if timestamp.dayofweek < 5:
            return 0.6
        return 0.3

    if "poya_day" not in df.columns:
        df["poya_day"] = df["recorded_at"].apply(poya_day).astype(int)
    else:
        df["poya_day"] = df["poya_day"].astype(int).fillna(0)

    if "holiday" not in df.columns:
        df["holiday"] = df["recorded_at"].apply(holiday).astype(int)
    else:
        df["holiday"] = df["holiday"].astype(int).fillna(0)

    if "traffic_score" not in df.columns:
        df["traffic_score"] = df["recorded_at"].apply(traffic_score).astype(float)
    else:
        df["traffic_score"] = pd.to_numeric(df["traffic_score"], errors="coerce").fillna(0.0)

    return df


def create_targets(df: pd.DataFrame) -> pd.DataFrame:
    """Create one-hour-ahead future prediction targets for each sensor reading."""
    df = df.copy()
    if df.empty:
        return df

    df["recorded_at"] = pd.to_datetime(df["recorded_at"], utc=False, errors="coerce")
    df = df.dropna(subset=["recorded_at"]).sort_values(["device_id", "recorded_at"]).reset_index(drop=True)

    if "pm25_target" in df.columns:
        df["target_pm2_5"] = df["pm25_target"]
        df["target_pm1_0"] = df["target_pm2_5"] * 0.6
        df["target_pm10"] = df.groupby("device_id", sort=False)["pm10"].shift(-1)
        df["target_aqi"] = df.groupby("device_id", sort=False)["aqi"].shift(-1)
        df = df.dropna(subset=["target_pm2_5", "target_pm10", "target_aqi"]).reset_index(drop=True)
        return df

    future_lookup = df[["device_id", "recorded_at", "pm1_0", "pm2_5", "pm10", "aqi"]].copy()
    future_lookup = future_lookup.rename(
        columns={
            "recorded_at": "future_recorded_at",
            "pm1_0": "future_pm1_0",
            "pm2_5": "future_pm2_5",
            "pm10": "future_pm10",
            "aqi": "future_aqi",
        }
    )
    future_lookup["future_recorded_at"] = future_lookup["future_recorded_at"] + pd.Timedelta(hours=1)

    left_columns = [column for column in df.columns if column not in ["target_pm1_0", "target_pm2_5", "target_pm10", "target_aqi"]]
    left_frame = df[left_columns].copy()
    left_frame = left_frame.sort_values(["device_id", "recorded_at"])
    right_frame = future_lookup.sort_values(["device_id", "future_recorded_at"])

    merged = pd.merge_asof(
        left_frame,
        right_frame,
        by="device_id",
        left_on="recorded_at",
        right_on="future_recorded_at",
        direction="forward",
    )

    merged["target_pm1_0"] = merged["future_pm1_0"] * 0.6
    merged["target_pm2_5"] = merged["future_pm2_5"]
    merged["target_pm10"] = merged["future_pm10"]
    merged["target_aqi"] = merged["future_aqi"]

    merged = merged.drop(columns=["future_recorded_at", "future_pm1_0", "future_pm2_5", "future_pm10", "future_aqi"]).dropna(
        subset=["target_pm1_0", "target_pm2_5", "target_pm10", "target_aqi"]
    ).reset_index(drop=True)
    return merged


def build_training_dataset() -> pd.DataFrame:
    """Build a clean training dataset from PostgreSQL and the CSV historical file."""
    sensor_df, weather_df = load_database_data()
    sensor_df = clean_sensor_data(sensor_df)
    weather_df = clean_weather_data(weather_df)

    db_df = sensor_df.copy()
    if not db_df.empty:
        db_df = db_df.sort_values(["device_id", "recorded_at"]).drop_duplicates(
            subset=["device_id", "recorded_at"], keep="first"
        ).reset_index(drop=True)

    if not weather_df.empty:
        weather_df = weather_df.sort_values(["device_id", "forecast_for"]).drop_duplicates(
            subset=["device_id", "forecast_for"], keep="first"
        ).reset_index(drop=True)

    if not db_df.empty and not weather_df.empty:
        db_df = pd.merge_asof(
            db_df.sort_values(["device_id", "recorded_at"]),
            weather_df.sort_values(["device_id", "forecast_for"]),
            left_on="recorded_at",
            right_on="forecast_for",
            by="device_id",
            direction="nearest",
        )
        db_df = db_df.drop(columns=["forecast_id", "forecast_generated_at", "forecast_for", "weather_source"])
    else:
        db_df = db_df.copy()

    db_df = ensure_weather_columns(db_df)
    db_df = add_time_features(db_df)
    db_df = add_kandy_features(db_df)
    db_df = create_targets(db_df)

    csv_df = normalize_csv_dataset(CSV_FILE)
    if not csv_df.empty:
        csv_df = csv_df.sort_values(["device_id", "recorded_at"]).drop_duplicates(
            subset=["device_id", "recorded_at"], keep="first"
        ).reset_index(drop=True)
        csv_df = ensure_weather_columns(csv_df)
        csv_df = add_time_features(csv_df)
        csv_df = add_kandy_features(csv_df)
        csv_df = create_targets(csv_df)

    datasets = []
    if not db_df.empty:
        db_df["source"] = "database"
        datasets.append(db_df)
    if not csv_df.empty:
        csv_df["source"] = "csv"
        datasets.append(csv_df)

    if not datasets:
        raise ValueError("No training data was produced from the database or CSV file")

    combined_df = pd.concat(datasets, ignore_index=True, sort=False)
    combined_df = combined_df.reset_index(drop=True)
    combined_df = combined_df.drop_duplicates(subset=["device_id", "recorded_at"], keep="first").reset_index(drop=True)

    feature_columns = [
        "device_id",
        "pm1_0",
        "pm2_5",
        "pm10",
        "temperature",
        "humidity",
        "aqi",
        "wifi_rssi",
        "pms_samples",
        "hour",
        "day_of_week",
        "month",
        "weekend",
        "poya_day",
        "holiday",
        "traffic_score",
    ]

    for column in [
        "apparent_temperature",
        "dew_point",
        "rainfall",
        "precipitation_probability",
        "pressure",
        "wind_speed",
        "wind_direction",
        "wind_gusts",
        "cloud_cover",
        "visibility",
        "uv_index",
        "boundary_layer_height",
    ]:
        if column in combined_df.columns:
            feature_columns.append(column)

    feature_columns = [column for column in feature_columns if column in combined_df.columns]
    combined_df = combined_df[["recorded_at", *feature_columns, *[f"target_{column}" for column in ["pm1_0", "pm2_5", "pm10", "aqi"]]]]
    return combined_df


def prepare_data() -> None:
    """Prepare the machine learning training dataset and save it to disk."""
    DATA_DIR.mkdir(exist_ok=True)
    training_df = build_training_dataset()
    training_df.to_csv(OUTPUT_FILE, index=False)

    print("Training data created successfully")
    print(f"Rows: {len(training_df)}")
    print(f"Features: {len([column for column in training_df.columns if column.startswith('target_') is False])}")
    print(f"Targets: {len([column for column in training_df.columns if column.startswith('target_')])}")
    print(f"Saved to: {OUTPUT_FILE}")


if __name__ == "__main__":
    prepare_data()
