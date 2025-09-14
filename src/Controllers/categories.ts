import { Request, Response } from "express";
import db from "../libs/knexfile";

const GetCategories = async (req: Request, res: Response) => {
  try {
    const categories = await db("categories").select("id", "name");
    return res.status(200).json({ success: true, categories });
  } catch (error) {
    console.log("error", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export { GetCategories };