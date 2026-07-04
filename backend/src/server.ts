import "dotenv/config";
import app from "./app.js";
import { startThingSpeakJob } from "./jobs/thingspeak.job.js";
import { startWeatherJob } from "./jobs/weather.job.js";
import { startAIJob } from "./jobs/ai.job.js";


const PORT = 3000;


app.listen(PORT, "0.0.0.0", () => {

  console.log(
    `🚀 Server is running on http://0.0.0.0:${PORT}`
  );


  startThingSpeakJob();

  startWeatherJob();

  startAIJob();

});