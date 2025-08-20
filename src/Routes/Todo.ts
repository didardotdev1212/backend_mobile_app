import Router from "express";
import { GetTasks, AddTask, DeleteTask, UpdateTask } from "../Controllers/Todo";
// 1. create a router
const router = Router();
// 2. define request handlers
router.get("/", GetTasks);
router.post("/add", AddTask);
router.delete("/delete/:id", DeleteTask);
router.put("/update/:id", UpdateTask);

export default router;
