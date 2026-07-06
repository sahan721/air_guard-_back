import { fetchThingSpeakData } from "../services/thingspeak.service.js";
export async function syncThingSpeakHandler(req, res) {
    try {
        const deviceId = Number(req.params.deviceId);
        if (!Number.isInteger(deviceId) || deviceId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid device id",
            });
        }
        const reading = await fetchThingSpeakData(deviceId);
        return res.status(200).json({
            success: true,
            message: "ThingSpeak data synced successfully",
            device_id: deviceId,
            reading,
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Failed to sync ThingSpeak data",
        });
    }
}
//# sourceMappingURL=thingspeak.controller.js.map