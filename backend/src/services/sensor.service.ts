import prisma from "../config/prisma.js";
import { calculateAQI } from "../utils/aqi.js";

export type SensorReading = {
  device_id: number;
  pm1_0: number;
  pm2_5: number;
  pm10: number;
  temperature: number;
  humidity: number;
  wifi_rssi: number;
  pms_samples: number;
};

export async function processSensorReading(
  reading: SensorReading,
  apiKey: string
) {
  const recordedAt = new Date();

  const device = await prisma.device.findUnique({
    where: {
      device_id: reading.device_id,
    },
  });

  if (!device) {
    throw new Error("Device not found");
  }

  if (device.api_key !== apiKey) {
    throw new Error("Invalid API key");
  }

  await prisma.device.update({
  where: {
    device_id: reading.device_id,
  },
  data: {
    status: "Active",
    last_seen: recordedAt,
  },
});
  const aqi = calculateAQI(reading.pm2_5);

  await prisma.current_readings.upsert({
    where: {
      device_id: reading.device_id,
    },
    update: {
      recorded_at: recordedAt,
      pm1_0: reading.pm1_0,
      pm2_5: reading.pm2_5,
      pm10: reading.pm10,
      temperature: reading.temperature,
      humidity: reading.humidity,
      aqi,
      wifi_rssi: reading.wifi_rssi,
      pms_samples: reading.pms_samples,
      data_status: "Valid",
    },
    create: {
      device_id: reading.device_id,
      recorded_at: recordedAt,
      pm1_0: reading.pm1_0,
      pm2_5: reading.pm2_5,
      pm10: reading.pm10,
      temperature: reading.temperature,
      humidity: reading.humidity,
      aqi,
      wifi_rssi: reading.wifi_rssi,
      pms_samples: reading.pms_samples,
      data_status: "Valid",
    },
  });

  await prisma.historical_readings.create({
    data: {
      device_id: reading.device_id,
      recorded_at: recordedAt,
      pm1_0: reading.pm1_0,
      pm2_5: reading.pm2_5,
      pm10: reading.pm10,
      temperature: reading.temperature,
      humidity: reading.humidity,
      aqi,
      wifi_rssi: reading.wifi_rssi,
      pms_samples: reading.pms_samples,
      data_status: "Valid",
    },
  });

  return {
  success: true,
  message: "Reading received successfully",
  device_id: reading.device_id,
  recordedAt,
  aqi,
};
}