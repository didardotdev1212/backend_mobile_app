import { Router } from "express";
import { CreateBook } from "../Controllers/Books";
import upload from "../Middlewares/Upload";
import authUser from "../Middlewares/Auth_User";

const router = Router();

router.post("/add", authUser, upload.single("Image"), CreateBook);

export default router;
