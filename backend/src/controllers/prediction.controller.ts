import { Request, Response } from "express";

import { getLatestPrediction } 
from "../services/prediction.service.js";


export async function getLatestPredictionController(
  req: Request,
  res: Response
) {


  try {


    const deviceId = Number(
      req.params.deviceId
    );


    const prediction =
      await getLatestPrediction(
        deviceId
      );


    res.json({

      device_id:
        prediction.device_id,


      predicted_at:
        prediction.predicted_at,


      predicted_for:
        prediction.predicted_for,


      pm1_0:
        prediction.pm1_0,


      pm2_5:
        prediction.pm2_5,


      pm10:
        prediction.pm10,


      temperature:
        prediction.temperature,


      humidity:
        prediction.humidity,


      aqi:
        prediction.aqi,

      risk_level:
        prediction.risk_level,


      reason:
        prediction.reason,


      recommendation:
        prediction.recommendation,  

    });


  } catch (error) {


    res.status(404).json({

      message:
        "Prediction not found"

    });


  }


}