import cron from "node-cron";
import { fetchThingSpeakData } from "../services/thingspeak.service.js";


export function startThingSpeakJob() {

  cron.schedule("*/1 * * * *", async () => {

    console.log("🌍 Syncing ThingSpeak data...");

    try {

      await fetchThingSpeakData(1);

      console.log("✅ ThingSpeak sync completed");

    } catch (error) {

      console.error(
        "❌ ThingSpeak sync failed",
        error
      );

    }

  });

}