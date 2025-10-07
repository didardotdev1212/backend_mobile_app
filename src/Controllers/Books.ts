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
    let book = await db("books")
      .where("books.id", book_id) // use book_id to filter
      .select(
        "books.id",
        "books.Name",
        "books.Description",
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
    /// get 5 latest reviews for this book
    const reviews = await db("reviews")
      .where("reviews.book_id", book_id)
      .select("reviews.*", "users.FirstName", "users.LastName")
      .leftJoin("users", "reviews.created_by", "users.id")
      .orderBy("reviews.id", "desc")
      .limit(5);
    book.reviews = reviews; // add reviews to book object

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
        "books.Description",
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
    const { Name, Description, category_id } = req.body;

    if (!Name) {
      return res
        .status(400)
        .json({ success: false, message: "Name is required" });
    }
    const userid = req.user.id;
    const file = req.file;
    const imageurl = `https://pub-8b2d28096f434a889120e98b6606a84e.r2.dev/${file.key}`;
    await db("books").insert({
      Name: Name,
      Description: Description,
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

const SubmitReview = async (req: any, res: Response) => {
  try {
    console.log("SubmitReview called");
    const userid = req.user.id;
    const { stars, review } = req.body;
    const { book_id } = req.params;
    if (!book_id || !review) {
      return res.status(400).json({
        success: false,
        message: "Book ID and stars are required",
      });
    }
    /// 0 to 5 stars
    if (stars && (stars <= 0 || stars > 6)) {
      return res
        .status(400)
        .json({ success: false, message: "Stars must be between 0 and 5" });
    }
    /// check if book exists
    const book = await db("books").where("id", book_id).first();
    if (!book) {
      return res
        .status(404)
        .json({ success: false, message: "Book not found" });
    }
    /// check if already reviewed
    const existingReview = await db("reviews")
      .where({ book_id: book_id, created_by: userid })
      .first();

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this book",
      });
    }
    await db("reviews").insert({
      book_id: book_id,
      stars: stars ? stars : 0,
      review: review,
      created_by: userid,
    });

    return res.status(201).json({
      success: true,
      message: "Review submitted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
const DeleteBook = async (req: any, res: Response) => {
  try {
    const { book_id } = req.params;
    const user_id = req.user.id;
    if (!book_id) {
      return res
        .status(400)
        .json({ success: false, message: "Book ID is required" });
    }
    const book = await db("books").where("id", book_id).first();
    if (!book) {
      return res
        .status(404)
        .json({ success: false, message: "Book not found" });
    }
    if (book.created_by !== user_id) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this book",
      });
    }
    await db("books").where("id", book_id).del();
    await db("reviews").where("book_id", book_id).del();
    return res
      .status(200)
      .json({ success: true, message: "Book deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const EditBook = async (req: any, res: Response) => {
  try {
    const { book_id } = req.params;
    const { Name, Description, category_id } = req.body;

    if (!Name) {
      return res
        .status(400)
        .json({ success: false, message: "Name is required" });
    }

    const userid = req.user.id;

    const book = await db("books").where("id", book_id).first();
    if (!book) {
      return res
        .status(404)
        .json({ success: false, message: "Book not found" });
    }
    if (book.created_by !== userid) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to edit this book",
      });
    }

    const file = req.file;
    const imageurl = `https://pub-8b2d28096f434a889120e98b6606a84e.r2.dev/${file?.key}`;
    await db("books")
      .where("id", book_id)
      .update({
        Name: Name,
        Description: Description,
        category_id: category_id,
        Image: file ? imageurl : book.Image,
        created_by: userid,
        created_at: new Date(),
      });
    return res.status(201).json({
      success: true,
      message: "Book updated successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
export {
  CreateBook,
  GetRecentBooks,
  GetBookById,
  SubmitReview,
  DeleteBook,
  EditBook,
};
