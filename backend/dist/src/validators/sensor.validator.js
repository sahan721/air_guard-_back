/**
 * Validate sensor data types and value ranges
 *
 * @param data Sensor reading data to validate
 * @returns Object with validation result and error message if invalid
 */
export function validateSensorData(data) {
    // Validate data types
    if (typeof data.device_id !== "number" ||
        typeof data.pm1_0 !== "number" ||
        typeof data.pm2_5 !== "number" ||
        typeof data.pm10 !== "number" ||
        typeof data.temperature !== "number" ||
        typeof data.humidity !== "number" ||
        typeof data.wifi_rssi !== "number" ||
        typeof data.pms_samples !== "number") {
        return {
            valid: false,
            error: "Invalid sensor data",
        };
    }
    // Validate value ranges
    if (data.device_id <= 0 ||
        data.pm1_0 < 0 ||
        data.pm2_5 < 0 ||
        data.pm10 < 0 ||
        data.temperature < -40 ||
        data.temperature > 85 ||
        data.humidity < 0 ||
        data.humidity > 100 ||
        data.wifi_rssi < -100 ||
        data.wifi_rssi > 0 ||
        data.pms_samples <= 0) {
        return {
            valid: false,
            error: "Sensor values are out of range",
        };
    }
    return { valid: true };
}
//# sourceMappingURL=sensor.validator.js.map