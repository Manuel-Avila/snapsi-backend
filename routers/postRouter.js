import { Router } from "express";
import verifyToken from "../middlewares/verifyToken.js";
import * as PostController from "../controllers/postController.js";
import multer from "multer";
import validate from "../middlewares/validateReq.js";
import {
  createPostSchema,
  getPostsSchema,
  getUserPostsSchema,
  postIdParamSchema,
} from "../validators/postValidator.js";
import {
  createCommentSchema,
  getCommentsSchema,
} from "../validators/commentValidator.js";

const router = Router();
const upload = multer();

router.get(
  "/",
  validate(getPostsSchema, "query"),
  verifyToken,
  PostController.getPosts
);
router.get(
  "/user/:username",
  validate(getUserPostsSchema, "params"),
  validate(getPostsSchema, "query"),
  verifyToken,
  PostController.getUserPosts
);
router.post(
  "/",
  verifyToken,
  upload.single("image"),
  validate(createPostSchema),
  PostController.createPost
);
router.get(
  "/:postId/comments",
  validate(postIdParamSchema, "params"),
  validate(getCommentsSchema, "query"),
  verifyToken,
  PostController.getComments
);
router.post(
  "/:postId/comments",
  validate(postIdParamSchema, "params"),
  validate(createCommentSchema),
  verifyToken,
  PostController.addComment
);
router.post(
  "/:postId/like",
  validate(postIdParamSchema, "params"),
  verifyToken,
  PostController.likePost
);
router.post(
  "/:postId/bookmark",
  validate(postIdParamSchema, "params"),
  verifyToken,
  PostController.bookmarkPost
);
router.delete(
  "/:postId/like",
  validate(postIdParamSchema, "params"),
  verifyToken,
  PostController.unlikePost
);
router.delete(
  "/:postId/bookmark",
  validate(postIdParamSchema, "params"),
  verifyToken,
  PostController.unbookmarkPost
);

export default router;
