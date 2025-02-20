import { Router } from "express";
import check from "../service/check.js";
import save from "../service/save.js";

const router = Router();

router.get("/list/:id", check);
router.post("/list", save);
// router.patch("/list/:id")

export default router;
