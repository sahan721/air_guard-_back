import prisma from "../config/prisma.js";


export async function getCurrentReading(
  deviceId: number
) {


  const reading =
    await prisma.historical_readings.findFirst({

      where: {
        device_id: deviceId,
      },


      orderBy: {
        recorded_at: "desc",
      },


    });



  if (!reading) {

    throw new Error(
      "No readings found"
    );

  }



  return reading;


}