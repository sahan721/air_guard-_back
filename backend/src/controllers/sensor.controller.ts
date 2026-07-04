import { Request, Response } from "express";
import { processSensorReading } from "../services/sensor.service.js";
import { validateSensorData } from "../validators/sensor.validator.js";

export async function processSensorReadingHandler(
  req: Request,
  res: Response
) {
  try {
    const apiKey = req.header("x-api-key");

    if (!apiKey) {
      return res.status(401).json({
        message: "API key is required",
      });
    }

    const validation = validateSensorData(req.body);

    if (!validation.valid) {
      return res.status(400).json({
        message: validation.error,
      });
    }

    const result = await processSensorReading(req.body, apiKey);

    return res.status(200).json(result);
  } catch (error) {
    console.error(error);

    if (error instanceof Error) {
      if (error.message === "Device not found") {
        return res.status(404).json({
          message: error.message,
        });
      }

      if (error.message === "Invalid API key") {
        return res.status(401).json({
          message: error.message,
        });
      }
    }

    return res.status(500).json({
      message: "Failed to process sensor reading",
    });
  }
}