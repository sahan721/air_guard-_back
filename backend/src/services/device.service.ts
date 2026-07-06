import prisma from "../config/prisma.js";

type DeviceCreateData = {
  device_name: string;
  location_name: string;
  latitude: number;
  longitude: number;
  installed_date: Date;
  status?: "Pending" | "Active" | "Deactive";
};

type DeviceUpdateData = Partial<DeviceCreateData>;

export async function getAllDevices() {


  return await prisma.device.findMany({


    include: {


      current_readings: true,


    },


  });


}

export async function getDeviceById(deviceId: number) {
  return await prisma.device.findUnique({
    where: {
      device_id: deviceId,
    },
  });
}

export async function createDevice(deviceData: DeviceCreateData) {
  return await prisma.device.create({
    data: deviceData,
  });
}

export async function updateDevice(deviceId: number, deviceData: DeviceUpdateData) {
  return await prisma.device.update({
    where: {
      device_id: deviceId,
    },
    data: deviceData,
  });
}

export async function deleteDevice(deviceId: number) {
  return await prisma.device.delete({
    where: {
      device_id: deviceId,
    },
  });
}
