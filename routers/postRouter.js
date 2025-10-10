import { Router } from "express";
import verifyToken from "../middlewares/verifyToken.js";
import * as PostController from "../controllers/postController.js";
import multer from "multer";
import validate from "../middlewares/validateReq.js";
import {
  createPostSchema,
  getPostsSchema,
} from "../validators/postValidator.js";

const router = Router();
const upload = multer();

router.get(
  "/",
  validate(getPostsSchema, "query"),
  verifyToken,
  PostController.getPosts
);
router.post(
  "/",
  verifyToken,
  upload.single("image"),
  validate(createPostSchema),
  PostController.createPost
);

export default router;
