from fastapi import FastAPI
from predict import predict

app = FastAPI(
    title="AirGuard AI Model"
)


@app.get("/")
def home():
    return {
        "status": "AirGuard AI Model Running"
    }


@app.post("/predict")
def run_prediction():

    try:

        predict()

        return {
            "success": True,
            "message": "Prediction completed successfully"
        }

    except Exception as e:

        return {
            "success": False,
            "error": str(e)
        }