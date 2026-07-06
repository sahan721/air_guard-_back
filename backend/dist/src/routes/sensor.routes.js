import { Router } from "express";
import { processSensorReadingHandler } from "../controllers/sensor.controller.js";
const router = Router();
router.post("/", processSensorReadingHandler);
export default router;
//# sourceMappingURL=sensor.routes.js.map