import express from "express";
import deviceRoutes from "./routes/device.routes.js";
import sensorRoutes from "./routes/sensor.routes.js";
import weatherRoutes from "./routes/weather.routes.js";
import thingspeakRoutes from "./routes/thingspeak.routes.js";
import readingRoutes from "./routes/reading.routes.js";
import predictionRoutes from "./routes/prediction.routes.js";
import cors from "cors";
const app = express();
app.use(cors({ origin: "*", }));
// Middleware
app.use(express.json());
// Home Route
app.get("/", (req, res) => {
    res.send("Air Quality Backend is Running!");
});
// Device Routes
app.use("/devices", deviceRoutes);
app.use("/api/v1/readings", sensorRoutes);
app.use("/weather", weatherRoutes);
app.use("/thingspeak", thingspeakRoutes);
app.use("/api/readings", readingRoutes);
app.use("/api/predictions", predictionRoutes);
export default app;
//# sourceMappingURL=app.js.map