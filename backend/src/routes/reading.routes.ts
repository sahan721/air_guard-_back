import { Router } from "express";


import { 
  getCurrentReadingController,
  getHistoryReadingController
} 
from "../controllers/reading.controller.js";



const router = Router();



router.get(
  "/current/:deviceId",
  getCurrentReadingController
);



router.get(
  "/history/:deviceId",
  getHistoryReadingController
);



export default router;