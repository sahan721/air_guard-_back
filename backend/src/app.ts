import express from "express";
import deviceRoutes from "./routes/device.routes.js";
import sensorRoutes from "./routes/sensor.routes.js";
import weatherRoutes from "./routes/weather.routes.js";
import thingspeakRoutes from "./routes/thingspeak.routes.js";

const app = express();

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

export default app;