import Router from "express";
import { GetTasks, AddTask, DeleteTask } from "../Controllers/Todo";
// 1. create a router
const router = Router();
// 2. define request handlers
router.get("/", GetTasks);
router.post("/add", AddTask);
router.delete("/delete/:id", DeleteTask);

export default router;
