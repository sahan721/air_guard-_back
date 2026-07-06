import prisma from "../config/prisma.js";
const WEATHER_SOURCE = "Open-Meteo";
// Check device exists
async function ensureDeviceExists(deviceId) {
    const device = await prisma.device.findUnique({
        where: {
            device_id: deviceId,
        },
    });
    if (!device) {
        throw new Error("Device not found");
    }
    return device;
}
// Fetch from Open-Meteo
export async function fetchForecastFromAPI(deviceId) {
    const device = await ensureDeviceExists(deviceId);
    const latitude = Number(device.latitude);
    const longitude = Number(device.longitude);
    const url = "https://api.open-meteo.com/v1/forecast" +
        `?latitude=${latitude}` +
        `&longitude=${longitude}` +
        "&hourly=" +
        [
            "temperature_2m",
            "apparent_temperature",
            "relative_humidity_2m",
            "dew_point_2m",
            "rain",
            "precipitation_probability",
            "pressure_msl",
            "wind_speed_10m",
            "wind_direction_10m",
            "wind_gusts_10m",
            "cloud_cover",
            "visibility",
            "uv_index",
            "boundary_layer_height",
        ].join(",") +
        "&forecast_days=7";
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error("Open-Meteo request failed");
    }
    const data = (await response.json());
    return data.hourly.time.map((time, index) => ({
        forecast_for: new Date(time),
        temperature: data.hourly.temperature_2m[index] ?? 0,
        apparent_temperature: data.hourly.apparent_temperature[index] ?? 0,
        humidity: data.hourly.relative_humidity_2m[index] ?? 0,
        dew_point: data.hourly.dew_point_2m[index] ?? 0,
        rainfall: data.hourly.rain[index] ?? 0,
        precipitation_probability: data.hourly.precipitation_probability[index] ?? 0,
        pressure: data.hourly.pressure_msl[index] ?? 0,
        wind_speed: data.hourly.wind_speed_10m[index] ?? 0,
        wind_direction: data.hourly.wind_direction_10m[index] ?? 0,
        wind_gusts: data.hourly.wind_gusts_10m[index] ?? 0,
        cloud_cover: data.hourly.cloud_cover[index] ?? 0,
        visibility: data.hourly.visibility[index] ?? 0,
        uv_index: data.hourly.uv_index[index] ?? 0,
        boundary_layer_height: data.hourly.boundary_layer_height[index] ?? 0,
        weather_source: WEATHER_SOURCE,
    }));
}
// Save forecast
export async function saveForecast(deviceId) {
    const forecasts = await fetchForecastFromAPI(deviceId);
    const generatedAt = new Date();
    const savedForecasts = [];
    for (const forecast of forecasts) {
        const existing = await prisma.forecast_data.findFirst({
            where: {
                device_id: deviceId,
                forecast_for: forecast.forecast_for,
                weather_source: WEATHER_SOURCE,
            },
        });
        if (existing) {
            const updated = await prisma.forecast_data.update({
                where: {
                    forecast_id: existing.forecast_id,
                },
                data: {
                    forecast_generated_at: generatedAt,
                    ...forecast,
                },
            });
            savedForecasts.push(updated);
        }
        else {
            const created = await prisma.forecast_data.create({
                data: {
                    device_id: deviceId,
                    forecast_generated_at: generatedAt,
                    ...forecast,
                },
            });
            savedForecasts.push(created);
        }
    }
    return savedForecasts;
}
// latest forecast
export async function getLatestForecast(deviceId) {
    await ensureDeviceExists(deviceId);
    return prisma.forecast_data.findFirst({
        where: {
            device_id: deviceId,
        },
        orderBy: {
            forecast_for: "asc",
        },
    });
}
// forecast history
export async function getForecastHistory(deviceId) {
    await ensureDeviceExists(deviceId);
    return prisma.forecast_data.findMany({
        where: {
            device_id: deviceId,
        },
        orderBy: {
            forecast_for: "asc",
        },
    });
}
export async function refreshForecast(deviceId) {
    return saveForecast(deviceId);
}
//# sourceMappingURL=weather.service.js.map