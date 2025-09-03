import { register, login, profile, AddProfilePic } from "../Controllers/Auth";
import { Router } from "express";
import authUser from "../Middlewares/Auth_User";
import upload from "../Middlewares/Upload";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/profile", authUser, profile);
router.post("/profile-pic", upload.single("file"), AddProfilePic);

export default router;
