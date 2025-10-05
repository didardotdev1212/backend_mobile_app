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
    const file = req.file;
    /// pub-8b2d28096f434a889120e98b6606a84e witll be YOUR R2 DEVELOPMENT URL
    const imageurl = `https://pub-8b2d28096f434a889120e98b6606a84e.r2.dev/${file.key}`;

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

const SubmitReview = async (req: any, res: Response) => {
  try {
    console.log("SubmitReview called");
    const userid = req.user.id;
    const { stars, review } = req.body;
    const { book_id } = req.params;
    if (!book_id || !stars || !review) {
      return res.status(400).json({
        success: false,
        message: "Book ID and stars are required",
      });
    }
    /// 0 to 5 stars
    if (stars <= 0 || stars >= 5) {
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
      stars: stars,
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

export { CreateBook, GetRecentBooks, GetBookById, SubmitReview };
