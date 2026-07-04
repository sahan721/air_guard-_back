import { Router } from "express";

import { getCurrentReadingController } 
from "../controllers/reading.controller.js";


const router = Router();


router.get(
  "/current/:deviceId",
  getCurrentReadingController
);


export default router;