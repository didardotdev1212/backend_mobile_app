import { Request, Response } from "express";
import db from "../libs/knexfile";
// 1. import express
// 2. create functions to handle requests
const GetTasks = async (req: Request, res: Response) => {
  /// Get all tasks from the database
  /// The * means we want to select all columns,
  // if we wanted specific columns we could do something like: db("Todo").select("id", "name")
  const tasks = await db("Todo").select("*");
  return res.json({
    success: true,
    message: "Tasks",
    data: tasks,
  });
};

const AddTask = async (req: Request, res: Response) => {
  try {
    /// Check if the request body has a name property
    /// If not, return a 400 Bad Request response
    if (!req.body || !req.body.name) {
      return res.status(400).json({
        success: false,
        message: "Task name is required",
      });
    }
    const { name } = req.body;
    //// Add task to the database
    await db("Todo").insert({ name: name });
    return res.json({
      success: true,
      message: "Task Created Successfully",
    });
  } catch (error) {
    console.error("Error adding task:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
const DeleteTask = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id || isNaN(Number(id))) {
    return res.status(400).json({
      success: false,
      message: "Invalid task ID",
    });
  }
  const isExists = await db("Todo")
    .where({ id: Number(id) })
    .first();
  if (!isExists) {
    return res.status(404).json({
      success: false,
      message: "Task not found",
    });
  }
  await db("Todo")
    .where({ id: Number(id) })
    .del();

  return res.json({
    success: true,
    message: "Task deleted successfully",
  });
};

export { GetTasks, AddTask, DeleteTask };
