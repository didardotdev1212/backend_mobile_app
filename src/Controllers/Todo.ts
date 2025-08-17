import { Request, Response } from "express";
// 1. import express
let TODOS = [
  { id: 1, name: "Learn TypeScript" },
  { id: 2, name: "Build a Todo App" },
];
// 2. create functions to handle requests
const GetTasks = (req: Request, res: Response) => {
  return res.json({
    success: true,
    message: "Tasks",
    data: TODOS,
  });
};

const AddTask = (req: Request, res: Response) => {
  if (!req.body || !req.body.name) {
    return res.status(400).json({
      success: false,
      message: "Task name is required",
    });
  }
  const { name } = req.body;
  //// Add Task
  const newTask = {
    id: TODOS.length + 1,
    name: name,
  };
  TODOS.push(newTask);
  return res.json({
    success: true,
    message: "Tasks",
    data: TODOS,
  });
};
const DeleteTask = (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id || isNaN(Number(id))) {
    return res.status(400).json({
      success: false,
      message: "Invalid task ID",
    });
  }
  const isExists = TODOS.find((task) => task.id === Number(id));
  if (!isExists) {
    return res.status(404).json({
      success: false,
      message: "Task not found",
    });
  }
  TODOS = TODOS.filter((task) => task.id !== Number(id));

  return res.json({
    success: true,
    message: "Task deleted successfully",
    data: TODOS,
  });
};

export { GetTasks, AddTask, DeleteTask };
