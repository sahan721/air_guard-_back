import { Router } from "express";
import { syncThingSpeakHandler } from "../controllers/thingspeak.controller.js";


const router = Router();


router.post(
  "/:deviceId/sync",
  syncThingSpeakHandler
);


export default router;