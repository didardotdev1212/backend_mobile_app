import { Router } from "express";
import { CreateBook, GetRecentBooks, GetBookById } from "../Controllers/Books";
import upload from "../Middlewares/Upload";
import authUser from "../Middlewares/Auth_User";

const router = Router();
router.get("/recent", GetRecentBooks);
router.get("/:book_id", GetBookById);
router.post("/add", authUser, upload.single("Image"), CreateBook);

export default router;
