import prisma from "../config/prisma.js";

const THINGSPEAK_CHANNEL_ID = "3291107";
const THINGSPEAK_READ_KEY = "EQOTJVQKYEVZLOU4";

type ThingSpeakResponse = {
  feeds: {
    created_at: string;
    field1: string | null;
    field2: string | null;
    field3: string | null;
    field4: string | null;
    field5: string | null;
    field6: string | null;
    field7: string | null;
    field8: string | null;
  }[];
};


export async function fetchThingSpeakData(deviceId: number) {

  const url =
    `https://api.thingspeak.com/channels/${THINGSPEAK_CHANNEL_ID}/feeds.json?api_key=${THINGSPEAK_READ_KEY}&results=1`;


  const response = await fetch(url);


  if (!response.ok) {
    throw new Error("Failed to fetch ThingSpeak");
  }


  const data =
    (await response.json()) as ThingSpeakResponse;


  const latest = data.feeds[0];


  if (!latest) {
    throw new Error("No ThingSpeak data found");
  }


  const reading = {

    device_id: deviceId,

    recorded_at: new Date(latest.created_at),

    pm1_0: Number(latest.field1 ?? 0),

    pm2_5: Number(latest.field2 ?? 0),

    pm10: Number(latest.field3 ?? 0),

    temperature: Number(latest.field4 ?? 0),

    humidity: Number(latest.field5 ?? 0),

    aqi: Number(latest.field6 ?? 0),

    wifi_rssi: Number(latest.field7 ?? 0),

    pms_samples: Number(latest.field8 ?? 0),

    data_status: "Valid" as const,

  };


  // update current reading
  await prisma.current_readings.upsert({

    where: {
      device_id: deviceId,
    },

    update: reading,

    create: reading,

  });



  // save history
  await prisma.historical_readings.create({

    data: reading,

  });



  // update heartbeat
  await prisma.device.update({

    where: {
      device_id: deviceId,
    },

    data: {
      status: "Active",
      last_seen: new Date(),
    },

  });


  return reading;
}