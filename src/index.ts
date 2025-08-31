/// add dotend
import "dotenv/config";
// 1. import
import express from "express";
// 2. import routes
import todoRoutes from "./Routes/Todo";
import AuthRoutes from "./Routes/Auth";

// 2. create app
const app = express();
// 3. parse json
app.use(express.json());
// 4. define a route
app.get("/", (req, res) => {
  res.json("Hello, World!");
});
// 4.1 use todo routes
app.use("/auth", AuthRoutes);
app.use("/todos", todoRoutes);
// 5. start the server
app.listen(5123, () => {
  console.log("Server is running on http://localhost:5000");
});

// 6. export the app for testing
export default app;
