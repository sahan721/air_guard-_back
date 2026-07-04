import cron from "node-cron";
import { refreshForecast } from "../services/weather.service.js";


export function startWeatherJob() {

 cron.schedule("* * * * *", async () => {
  
    console.log("🌦 Refreshing weather forecast...");

    try {

      await refreshForecast(1);

      console.log("✅ Weather forecast updated");

    } catch (error) {

      console.error(
        "❌ Weather update failed",
        error
      );

    }

  });

}