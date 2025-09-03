import { Request, Response } from "express";
import * as jose from "jose";
import db from "../libs/knexfile";
import bcrypt from "bcryptjs";

const register = async (req: Request, res: Response) => {
  try {
    /// validate inputs
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }
    /// check email witch regex
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }
    /// at least 8 characters, one uppercase, one lowercase, one number and one special character
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number and one special character",
      });
    }
    // check if email already exists
    const existingUser = await db("users").where({ email }).first();
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }
    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    // insert user into database
    await db("users").insert({ email, password: hashedPassword });
    return res.status(200).json({ message: "User registered successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Server Error" });
  }
};
const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email and password are required" });
    }
    //1. check if user exists
    const user = await db("users")
      .select("id", "email", "password")
      .where({ email })
      .first();
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }
    //2. check if password is correct
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }
    //3. create a token
    const token = await new jose.SignJWT({ id: user.id })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("7d")
      .sign(new TextEncoder().encode(process.env.JWT_SECRET));
    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const profile = async (req: any, res: Response) => {
  try {
    const userId = req?.user.id;
    const user = await db("users")
      .select("id", "email")
      .where({ id: userId })
      .first();
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({ user });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

export { register, login, profile };
