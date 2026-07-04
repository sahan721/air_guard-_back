import { Request, Response } from "express";

import { getCurrentReading } from "../services/reading.service.js";


export async function getCurrentReadingController(
  req: Request,
  res: Response
) {


  try {


    const deviceId = Number(
      req.params.deviceId
    );


    const reading =
      await getCurrentReading(
        deviceId
      );


    res.json({

      device_id:
        reading.device_id,


      recorded_at:
        reading.recorded_at,


      pm1_0:
        reading.pm1_0,


      pm2_5:
        reading.pm2_5,


      pm10:
        reading.pm10,


      temperature:
        reading.temperature,


      humidity:
        reading.humidity,


      aqi:
        reading.aqi,


    });


  } catch (error) {


    res.status(404).json({

      message:
        "Reading not found",

    });


  }


}