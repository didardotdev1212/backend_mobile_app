import { Router } from "express";
import {
  CreateBook,
  GetRecentBooks,
  GetBookById,
  SubmitReview,
  DeleteBook,
  EditBook,
} from "../Controllers/Books";
import upload from "../Middlewares/Upload";
import authUser from "../Middlewares/Auth_User";

const router = Router();
router.get("/recent", GetRecentBooks);
router.get("/:book_id", GetBookById);
router.post("/:book_id/review", authUser, SubmitReview);
router.post("/add", authUser, upload.single("Image"), CreateBook);
router.patch("/:book_id/edit", authUser, upload.single("Image"), EditBook);
router.delete("/:book_id/delete", authUser, DeleteBook);

export default router;
