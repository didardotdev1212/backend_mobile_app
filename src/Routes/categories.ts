import { Router } from "express";
import { GetCategories } from "../Controllers/categories";

const router = Router();
router.get("/", GetCategories);

export default router;
