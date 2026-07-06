import prisma from "../config/prisma.js";
export async function getLatestPrediction(deviceId) {
    const prediction = await prisma.predictions.findFirst({
        where: {
            device_id: deviceId,
        },
        orderBy: {
            predicted_at: "desc",
        },
    });
    if (!prediction) {
        throw new Error("No predictions found");
    }
    return prediction;
}
//# sourceMappingURL=prediction.service.js.map