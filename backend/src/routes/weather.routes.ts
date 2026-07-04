import { Router } from "express";
import {
  getLatestForecastHandler,
  getForecastHistoryHandler,
  refreshForecastHandler,
} from "../controllers/weather.controller.js";

const router = Router();

router.get("/:deviceId/latest", getLatestForecastHandler);
router.get("/:deviceId/history", getForecastHistoryHandler);
router.post("/:deviceId/refresh", refreshForecastHandler);

export default router;
