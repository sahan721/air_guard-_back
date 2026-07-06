import cron from "node-cron";
import { exec } from "child_process";
import path from "path";
export function startAIJob() {
    cron.schedule("* * * * *", () => {
        console.log("🤖 Running AI prediction...");
        const aiPath = path.join(process.cwd(), "../ai-model");
        const pythonPath = "C:\\Users\\USER\\Desktop\\AirQualityPrediction\\.venv\\Scripts\\python.exe";
        exec(`"${pythonPath}" predict.py`, {
            cwd: aiPath,
        }, (error, stdout, stderr) => {
            if (error) {
                console.error("❌ AI prediction failed:", error.message);
                return;
            }
            if (stderr) {
                console.error(stderr);
            }
            console.log(stdout);
            console.log("✅ AI prediction completed");
        });
    });
}
//# sourceMappingURL=ai.job.js.map