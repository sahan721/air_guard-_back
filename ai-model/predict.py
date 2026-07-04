from datetime import datetime, timedelta

import pandas as pd
import joblib

from sqlalchemy import text

from database import get_connection


MODEL_PATH = "models/air_quality_model.pkl"
FEATURE_PATH = "models/feature_columns.pkl"


def get_latest_sensor(conn):

    query = text(
        """
        SELECT *
        FROM historical_readings
        ORDER BY recorded_at DESC
        LIMIT 1
        """
    )

    result = conn.execute(query)

    return result.mappings().first()



def get_future_weather(conn, device_id):

    query = text(
        """
        SELECT *
        FROM forecast_data
        WHERE device_id = :device_id
        AND forecast_for > NOW()
        ORDER BY forecast_for ASC
        LIMIT 1
        """
    )

    result = conn.execute(
        query,
        {
            "device_id": device_id
        }
    )

    return result.mappings().first()



def save_prediction(
    conn,
    device_id,
    predicted_for,
    prediction,
    sensor
):

    query = text(
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

            aqi
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

            :aqi
        )
        """
    )


    conn.execute(
        query,
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

        }
    )


    conn.commit()




def predict():


    print("Loading AI model...")


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
                "No forecast data found"
            )

            return



        now = datetime.now()


        input_data = {


            "pm1_0":
                sensor["pm1_0"],


            "pm2_5":
                sensor["pm2_5"],


            "pm10":
                sensor["pm10"],


            "temperature":
                sensor["temperature"],


            "humidity":
                sensor["humidity"],


            "aqi":
                sensor["aqi"],


            "wifi_rssi":
                sensor["wifi_rssi"],


            "pms_samples":
                sensor["pms_samples"],


            "hour":
                now.hour,


            "day_of_week":
                now.weekday(),


            "month":
                now.month,


            "weekend":
                1 if now.weekday() >= 5 else 0,


            "poya_day":
                0,


            "holiday":
                0,


            "traffic_score":
                0.6,


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


        df = df[features]


        prediction = model.predict(
            df
        )[0]



        print(
            "\nPrediction result:"
        )


        print(
            "PM1.0:",
            prediction[0]
        )


        print(
            "PM2.5:",
            prediction[1]
        )


        print(
            "PM10:",
            prediction[2]
        )


        print(
            "AQI:",
            prediction[3]
        )



        save_prediction(

            conn,

            sensor["device_id"],

            weather["forecast_for"],

            prediction,

            sensor

        )


        print(
            "\nSaved to predictions table"
        )



if __name__ == "__main__":

    predict()