import { register, login, profile } from "../Controllers/Auth";
import { Router } from "express";
import authUser from "../Middlewares/Auth_User";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/profile", authUser, profile);

export default router;
