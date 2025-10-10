import "dotenv/config";
import "./config/database.js";
import express from "express";
import cors from "cors";
import authRouter from "./routers/authRouter.js";
import postRouter from "./routers/postRouter.js";

const app = express();
app.disable("x-powered-by");
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.send("API is running..."));

app.use("/api/auth", authRouter);
app.use("/api/posts", postRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
