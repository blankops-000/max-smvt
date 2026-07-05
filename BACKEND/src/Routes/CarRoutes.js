import express from "express";
import {postCar, getCar, deleteCar, updateCar } from "../Controllers/CarControlers.js";
import { requireAdmin } from "../auth.js";

const router = express.Router();

router.get("/", getCar);
router.post("/", requireAdmin, postCar);
router.put("/:id", requireAdmin, updateCar);
router.delete("/:id", requireAdmin, deleteCar);

export default router;
