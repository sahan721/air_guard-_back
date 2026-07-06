import { Router } from "express";
import { getDevices, getDevice, createDeviceHandler, updateDeviceHandler, deleteDeviceHandler, } from "../controllers/device.controller.js";
const router = Router();
router.get("/", getDevices);
router.get("/:id", getDevice);
router.post("/", createDeviceHandler);
router.put("/:id", updateDeviceHandler);
router.delete("/:id", deleteDeviceHandler);
export default router;
//# sourceMappingURL=device.routes.js.map