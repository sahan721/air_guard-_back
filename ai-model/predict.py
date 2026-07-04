from datetime import datetime

import pandas as pd
import joblib

from sqlalchemy import text

from database import get_connection


MODEL_PATH = "models/air_quality_model.pkl"
FEATURE_PATH = "models/feature_columns.pkl"


# -------------------------------------
# Generate AI advice
# -------------------------------------

def generate_air_advice(
    predicted_aqi,
    weather,
    prediction_time
):

    hour = prediction_time.hour


    # ----------------------------
    # GOOD AIR QUALITY
    # ----------------------------

    if predicted_aqi <= 50:

        risk = "Good"


        reason = (
            "Future air quality conditions are predicted "
            "to be healthy based on weather, calendar, "
            "and historical pollution patterns."
        )


        recommendation = (
            "The forecast period is suitable for visiting "
            "outdoor attractions and sightseeing."
        )



    # ----------------------------
    # MODERATE AIR QUALITY
    # ----------------------------

    elif predicted_aqi <= 100:

        risk = "Moderate"


        reasons = []


        if 7 <= hour <= 9:

            reasons.append(
                "increased pollution expected during morning traffic hours"
            )


        if 17 <= hour <= 19:

            reasons.append(
                "increased pollution expected during evening traffic hours"
            )


        if weather["wind_speed"] < 5:

            reasons.append(
                "low wind speed may reduce pollution dispersion"
            )


        if weather["rainfall"] > 0:

            reasons.append(
                "rainfall may help reduce airborne particles"
            )


        if not reasons:

            reasons.append(
                "moderate particle levels predicted from previous air quality patterns"
            )


        reason = (
            "Air quality may be affected by "
            + ", ".join(reasons)
            + "."
        )


        recommendation = (
            "Outdoor visits are possible, but sensitive visitors "
            "should reduce long exposure and monitor air quality."
        )



    # ----------------------------
    # UNHEALTHY AIR QUALITY
    # ----------------------------

    elif predicted_aqi <= 150:

        risk = "Unhealthy for Sensitive Groups"


        reason = (
            "Pollution levels are expected to increase based on "
            "historical trends, weather conditions, and time patterns."
        )


        recommendation = (
            "Visitors with breathing difficulties should limit "
            "long outdoor activities and consider wearing a mask."
        )



    # ----------------------------
    # HIGH POLLUTION
    # ----------------------------

    else:

        risk = "Unhealthy"


        reason = (
            "High pollution conditions are predicted due to "
            "environmental factors and previous air quality behavior."
        )


        recommendation = (
            "Avoid long outdoor exposure. Wearing a mask is recommended "
            "when visiting crowded outdoor locations."
        )


    return (
        risk,
        reason,
        recommendation
    )



# -------------------------------------
# Get latest historical reading
# -------------------------------------

def get_latest_sensor(conn):

    result = conn.execute(
        text(
            """
            SELECT *
            FROM historical_readings
            ORDER BY recorded_at DESC
            LIMIT 1
            """
        )
    )

    return result.mappings().first()



# -------------------------------------
# Get weather forecast
# -------------------------------------

def get_future_weather(
    conn,
    device_id
):

    result = conn.execute(
        text(
            """
            SELECT *
            FROM forecast_data
            WHERE device_id = :device_id
            AND forecast_for > NOW()
            ORDER BY forecast_for ASC
            LIMIT 1
            """
        ),
        {
            "device_id": device_id
        }
    )


    return result.mappings().first()



# -------------------------------------
# Save prediction
# -------------------------------------

def save_prediction(
    conn,
    device_id,
    predicted_for,
    prediction,
    sensor,
    risk,
    reason,
    recommendation
):

    conn.execute(
        text(
            """
            INSERT INTO predictions
            (
                device_id,
                predicted_at,
                predicted_for,

                pm1_0,
                pm2_5,
                pm10,

                temperature,
                humidity,

                aqi,

                risk_level,
                reason,
                recommendation
            )

            VALUES

            (
                :device_id,
                :predicted_at,
                :predicted_for,

                :pm1_0,
                :pm2_5,
                :pm10,

                :temperature,
                :humidity,

                :aqi,

                :risk,
                :reason,
                :recommendation
            )
            """
        ),

        {

            "device_id": device_id,

            "predicted_at": datetime.now(),

            "predicted_for": predicted_for,


            "pm1_0": float(prediction[0]),

            "pm2_5": float(prediction[1]),

            "pm10": float(prediction[2]),


            "temperature": float(
                sensor["temperature"]
            ),

            "humidity": float(
                sensor["humidity"]
            ),


            "aqi": int(
                prediction[3]
            ),


            "risk": risk,

            "reason": reason,

            "recommendation": recommendation

        }
    )


    conn.commit()



# -------------------------------------
# Run prediction
# -------------------------------------

def predict():


    print(
        "Loading AI model..."
    )


    model = joblib.load(
        MODEL_PATH
    )


    features = joblib.load(
        FEATURE_PATH
    )


    with get_connection() as conn:


        sensor = get_latest_sensor(conn)


        if sensor is None:

            print(
                "No sensor data found"
            )

            return


        weather = get_future_weather(
            conn,
            sensor["device_id"]
        )


        if weather is None:

            print(
                "No weather data found"
            )

            return



        now = datetime.now()


        input_data = {


            "pm1_0": sensor["pm1_0"],

            "pm2_5": sensor["pm2_5"],

            "pm10": sensor["pm10"],

            "temperature": sensor["temperature"],

            "humidity": sensor["humidity"],

            "aqi": sensor["aqi"],


            "wifi_rssi": sensor["wifi_rssi"],

            "pms_samples": sensor["pms_samples"],


            "hour": now.hour,

            "day_of_week": now.weekday(),

            "month": now.month,

            "weekend":
                1 if now.weekday() >= 5 else 0,


            "poya_day": 0,

            "holiday": 0,

            "traffic_score": 0.6,


            "apparent_temperature":
                weather["apparent_temperature"],

            "dew_point":
                weather["dew_point"],

            "rainfall":
                weather["rainfall"],

            "precipitation_probability":
                weather["precipitation_probability"],

            "pressure":
                weather["pressure"],

            "wind_speed":
                weather["wind_speed"],

            "wind_direction":
                weather["wind_direction"],

            "wind_gusts":
                weather["wind_gusts"],

            "cloud_cover":
                weather["cloud_cover"],

            "visibility":
                weather["visibility"],

            "uv_index":
                weather["uv_index"],

            "boundary_layer_height":
                weather["boundary_layer_height"],

        }


        df = pd.DataFrame(
            [input_data]
        )


        df = df[
            features
        ]


        prediction = model.predict(
            df
        )[0]



        risk, reason, recommendation = generate_air_advice(

            int(
                prediction[3]
            ),

            weather,

            weather["forecast_for"]

        )


        print("\nPrediction result:")

        print(
            "AQI:",
            prediction[3]
        )

        print(
            "Risk:",
            risk
        )

        print(
            "Reason:",
            reason
        )

        print(
            "Recommendation:",
            recommendation
        )


        save_prediction(

            conn,

            sensor["device_id"],

            weather["forecast_for"],

            prediction,

            sensor,

            risk,

            reason,

            recommendation

        )


        print(
            "\nSaved to predictions table"
        )



if __name__ == "__main__":

    predict()