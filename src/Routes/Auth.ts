import { register, login } from "../Controllers/Auth";
import { Router } from "express";

const router = Router();

router.post("/register", register);
router.post("/login", login);

export default router;
