import prisma from "../config/prisma.js";
// ===============================
// GET CURRENT SENSOR READING
// ===============================
export async function getCurrentReading(deviceId) {
    const reading = await prisma.current_readings.findFirst({
        where: {
            device_id: deviceId,
        },
    });
    if (!reading) {
        throw new Error("No current reading found");
    }
    // calculate sensor status
    const now = new Date();
    const lastUpdate = new Date(reading.recorded_at);
    const differenceMinutes = Math.floor((now.getTime()
        -
            lastUpdate.getTime())
        /
            (1000 * 60));
    const isOnline = differenceMinutes <= 30;
    return {
        ...reading,
        sensor_online: isOnline,
        minutes_since_update: differenceMinutes,
    };
}
// ===============================
// GET HISTORY GRAPH DATA
// ===============================
export async function getHistoryReadings(deviceId) {
    const history = await prisma.historical_readings.findMany({
        where: {
            device_id: deviceId,
        },
        select: {
            recorded_at: true,
            pm1_0: true,
            pm2_5: true,
            pm10: true,
            temperature: true,
            humidity: true,
            aqi: true,
        },
        orderBy: {
            recorded_at: "desc",
        },
        take: 24,
    });
    if (history.length === 0) {
        throw new Error("No history found");
    }
    return history.reverse();
}
//# sourceMappingURL=reading.service.js.map