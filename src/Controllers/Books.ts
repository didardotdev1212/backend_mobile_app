import { Response } from "express";
import db from "../libs/knexfile";

const GetBookById = async (req: any, res: Response) => {
  const { book_id } = req.params; // get book_id from req.params
  if (!book_id) {
    // validate book_id
    return res
      .status(400)
      .json({ success: false, message: "Book ID is required" });
  }
  try {
    const book = await db("books")
      .where("books.id", book_id) // use book_id to filter
      .select(
        "books.id",
        "books.Name",
        "books.Descreption",
        "books.Image",
        "books.created_at",
        "books.created_by",
        "books.category_id",
        "categories.name as category_name",
        "users.FirstName",
        "users.LastName"
      )
      .leftJoin("categories", "books.category_id", "categories.id")
      .leftJoin("users", "books.created_by", "users.id")
      .first(); // get the first matching record

    if (!book) {
      // if no book found
      return res
        .status(404)
        .json({ success: false, message: "Book not found" });
    }

    return res.status(200).json({ success: true, data: book });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const GetRecentBooks = async (req: any, res: Response) => {
  try {
    const books = await db("books")
      .select(
        "books.id",
        "books.Name",
        "books.Descreption",
        "books.Image",
        "books.created_at",
        "books.created_by",
        "books.category_id",
        "categories.name as category_name",
        "users.FirstName",
        "users.LastName"
      )
      .leftJoin("categories", "books.category_id", "categories.id")
      .leftJoin("users", "books.created_by", "users.id")
      .orderBy("books.id", "desc")
      .limit(10);

    return res.status(200).json({ success: true, data: books });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const CreateBook = async (req: any, res: Response) => {
  try {
    const { Name, Descreption, category_id } = req.body;

    if (!Name) {
      return res
        .status(400)
        .json({ success: false, message: "Name is required" });
    }
    const userid = req.user.id;
    const imageurl = req.file ? req.file.path : null;
    await db("books").insert({
      Name: Name,
      Descreption: Descreption,
      category_id: category_id,
      Image: imageurl,
      created_by: userid,
      created_at: new Date(),
    });
    return res.status(201).json({
      success: true,
      message: "Book created successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export { CreateBook, GetRecentBooks, GetBookById };
