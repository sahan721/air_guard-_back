from sqlalchemy import text

from database import get_connection


def main() -> None:
    with get_connection() as connection:
        device_count = connection.execute(text("SELECT COUNT(*) FROM device")).scalar_one()
        historical_count = connection.execute(
            text("SELECT COUNT(*) FROM historical_readings")
        ).scalar_one()
        forecast_count = connection.execute(
            text("SELECT COUNT(*) FROM forecast_data")
        ).scalar_one()

    print("DATABASE CONNECTION SUCCESSFUL")
    print(f"Device count: {device_count}")
    print(f"Historical readings: {historical_count}")
    print(f"Forecast records: {forecast_count}")


if __name__ == "__main__":
    main()
