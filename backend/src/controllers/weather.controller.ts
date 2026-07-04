import { Request, Response } from "express";
import {
  getLatestForecast,
  getForecastHistory,
  refreshForecast,
} from "../services/weather.service.old.js";

function parseDeviceId(deviceIdParam: string | undefined): number | null {
  if (!deviceIdParam) {
    return null;
  }

  const deviceId = Number(deviceIdParam);

  if (!Number.isInteger(deviceId) || deviceId <= 0) {
    return null;
  }

  return deviceId;
}

function serializeBigInt(data: unknown) {
  return JSON.parse(
    JSON.stringify(data, (_, value) =>
      typeof value === "bigint" ? value.toString() : value
    )
  );
}

export async function getLatestForecastHandler(
  req: Request<{ deviceId: string }>,
  res: Response
) {
  try {
    const deviceId = parseDeviceId(req.params.deviceId);

    if (deviceId === null) {
      return res.status(400).json({
        message: "Invalid device ID",
      });
    }

    const forecast = await getLatestForecast(deviceId);

    if (!forecast) {
      return res.status(404).json({
        message: "No forecast data found for this device",
      });
    }

    return res.status(200).json(serializeBigInt(forecast));
  } catch (error) {
    console.error(error);

    if (error instanceof Error && error.message === "Device not found") {
      return res.status(404).json({
        message: "Device not found",
      });
    }

    return res.status(500).json({
      message: "Failed to retrieve latest forecast",
    });
  }
}

export async function getForecastHistoryHandler(
  req: Request<{ deviceId: string }>,
  res: Response
) {
  try {
    const deviceId = parseDeviceId(req.params.deviceId);

    if (deviceId === null) {
      return res.status(400).json({
        message: "Invalid device ID",
      });
    }

    const history = await getForecastHistory(deviceId);

    return res.status(200).json({
      device_id: deviceId,
      forecasts: serializeBigInt(history),
    });
  } catch (error) {
    console.error(error);

    if (error instanceof Error && error.message === "Device not found") {
      return res.status(404).json({
        message: "Device not found",
      });
    }

    return res.status(500).json({
      message: "Failed to retrieve forecast history",
    });
  }
}

export async function refreshForecastHandler(
  req: Request<{ deviceId: string }>,
  res: Response
) {
  try {
    const deviceId = parseDeviceId(req.params.deviceId);

    if (deviceId === null) {
      return res.status(400).json({
        message: "Invalid device ID",
      });
    }

    const forecasts = await refreshForecast(deviceId);

    return res.status(200).json({
      success: true,
      message: "Forecast refreshed successfully",
      device_id: deviceId,
      forecasts: serializeBigInt(forecasts),
    });
  } catch (error) {
    console.error(error);

    if (error instanceof Error && error.message === "Device not found") {
      return res.status(404).json({
        message: "Device not found",
      });
    }

    return res.status(500).json({
      message: "Failed to refresh forecast",
    });
  }
}