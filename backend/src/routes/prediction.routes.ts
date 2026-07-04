import { Router } from "express";

import { getLatestPredictionController }
from "../controllers/prediction.controller.js";


const router = Router();


router.get(
  "/latest/:deviceId",
  getLatestPredictionController
);


export default router;