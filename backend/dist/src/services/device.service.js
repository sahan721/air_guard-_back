import prisma from "../config/prisma.js";
export async function getAllDevices() {
    return await prisma.device.findMany({
        include: {
            current_readings: true,
        },
    });
}
export async function getDeviceById(deviceId) {
    return await prisma.device.findUnique({
        where: {
            device_id: deviceId,
        },
    });
}
export async function createDevice(deviceData) {
    return await prisma.device.create({
        data: deviceData,
    });
}
export async function updateDevice(deviceId, deviceData) {
    return await prisma.device.update({
        where: {
            device_id: deviceId,
        },
        data: deviceData,
    });
}
export async function deleteDevice(deviceId) {
    return await prisma.device.delete({
        where: {
            device_id: deviceId,
        },
    });
}
//# sourceMappingURL=device.service.js.map