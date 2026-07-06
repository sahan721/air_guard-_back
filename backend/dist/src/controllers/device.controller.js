import { getAllDevices, getDeviceById, createDevice, updateDevice, deleteDevice, } from "../services/device.service.js";
const validDeviceStatus = ["Pending", "Active", "Deactive"];
function parseDeviceId(idParam) {
    if (!idParam) {
        return null;
    }
    const deviceId = Number(idParam);
    if (!Number.isInteger(deviceId) || deviceId <= 0) {
        return null;
    }
    return deviceId;
}
function parseDevicePayload(body, requireAll = true) {
    const payload = {};
    if (body.device_name !== undefined) {
        payload.device_name = String(body.device_name).trim();
    }
    if (body.location_name !== undefined) {
        payload.location_name = String(body.location_name).trim();
    }
    if (body.latitude !== undefined) {
        const latitude = Number(body.latitude);
        if (Number.isNaN(latitude)) {
            return { error: "latitude must be a valid number" };
        }
        payload.latitude = latitude;
    }
    if (body.longitude !== undefined) {
        const longitude = Number(body.longitude);
        if (Number.isNaN(longitude)) {
            return { error: "longitude must be a valid number" };
        }
        payload.longitude = longitude;
    }
    if (body.installed_date !== undefined) {
        const installedDate = new Date(body.installed_date);
        if (Number.isNaN(installedDate.getTime())) {
            return { error: "installed_date must be a valid date string" };
        }
        payload.installed_date = installedDate;
    }
    if (body.status !== undefined) {
        if (!validDeviceStatus.includes(body.status)) {
            return {
                error: `status must be one of ${validDeviceStatus.join(", ")}`,
            };
        }
        payload.status = body.status;
    }
    if (requireAll) {
        const requiredFields = [
            "device_name",
            "location_name",
            "latitude",
            "longitude",
            "installed_date",
        ];
        for (const field of requiredFields) {
            if (payload[field] === undefined) {
                return { error: `${field} is required` };
            }
        }
    }
    return { payload };
}
// GET /devices
export async function getDevices(req, res) {
    try {
        const devices = await getAllDevices();
        return res.json(devices);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Failed to fetch devices",
        });
    }
}
// GET /devices/:id
export async function getDevice(req, res) {
    try {
        const deviceId = parseDeviceId(req.params.id);
        if (deviceId === null) {
            return res.status(400).json({
                message: "Invalid device id",
            });
        }
        const device = await getDeviceById(deviceId);
        if (!device) {
            return res.status(404).json({
                message: "Device not found",
            });
        }
        return res.json(device);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Failed to fetch device",
        });
    }
}
// POST /devices
export async function createDeviceHandler(req, res) {
    try {
        const { payload, error } = parseDevicePayload(req.body, true);
        if (error || !payload) {
            return res.status(400).json({
                message: error ?? "Invalid request body",
            });
        }
        const createdDevice = await createDevice(payload);
        return res.status(201).json(createdDevice);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Failed to create device",
        });
    }
}
// PUT /devices/:id
export async function updateDeviceHandler(req, res) {
    try {
        const deviceId = parseDeviceId(req.params.id);
        if (deviceId === null) {
            return res.status(400).json({
                message: "Invalid device id",
            });
        }
        const { payload, error } = parseDevicePayload(req.body, false);
        if (error || !payload || Object.keys(payload).length === 0) {
            return res.status(400).json({
                message: error ??
                    "Request body must include at least one field to update",
            });
        }
        const updatedDevice = await updateDevice(deviceId, payload);
        return res.json(updatedDevice);
    }
    catch (error) {
        console.error(error);
        if (error?.code === "P2025") {
            return res.status(404).json({
                message: "Device not found",
            });
        }
        return res.status(500).json({
            message: "Failed to update device",
        });
    }
}
// DELETE /devices/:id
export async function deleteDeviceHandler(req, res) {
    try {
        const deviceId = parseDeviceId(req.params.id);
        if (deviceId === null) {
            return res.status(400).json({
                message: "Invalid device id",
            });
        }
        await deleteDevice(deviceId);
        return res.status(204).send();
    }
    catch (error) {
        console.error(error);
        if (error?.code === "P2025") {
            return res.status(404).json({
                message: "Device not found",
            });
        }
        return res.status(500).json({
            message: "Failed to delete device",
        });
    }
}
//# sourceMappingURL=device.controller.js.map