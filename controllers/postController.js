import { uploadFromBuffer, deleteFile } from "../utils/cloudinaryUtils.js";
import * as PostModel from "../models/postModel.js";
import * as CommentModel from "../models/commentModel.js";

export const getPosts = async (req, res) => {
  const { limit, cursor } = req.query;
  const { id: userId } = req.user;
  const formattedLimit = parseInt(limit, 10);

  try {
    const posts = await PostModel.getPosts(formattedLimit, cursor, userId);

    const nextCursor =
      posts.length === formattedLimit ? posts[posts.length - 1].id : null;

    res.status(200).json({ posts, nextCursor });
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ message: "Error fetching posts" });
  }
};

export const getUserPosts = async (req, res) => {
  const { limit, cursor } = req.query;
  const { username } = req.params;
  const { id: userId } = req.user;
  const formattedLimit = parseInt(limit, 10);

  try {
    const posts = await PostModel.getPostsByUsername(
      formattedLimit,
      cursor,
      userId,
      username
    );

    const nextCursor =
      posts.length === formattedLimit ? posts[posts.length - 1].id : null;

    res.status(200).json({ posts, nextCursor });
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ message: "Error fetching posts" });
  }
};

export const createPost = async (req, res) => {
  const { caption } = req.body;
  const imageFile = req.file;
  const { id: userId } = req.user;

  if (!imageFile) {
    return res.status(400).json({ message: "No image file provided." });
  }

  let publicId;

  try {
    const uploadResult = await uploadFromBuffer(imageFile.buffer, "posts");
    const imageUrl = uploadResult.secure_url;
    publicId = uploadResult.public_id;

    const post = {
      user_id: userId,
      caption,
      image_url: imageUrl,
      image_cloudinary_id: publicId,
    };

    const newPostId = await PostModel.createPost(post);
    const newPost = await PostModel.getPostById(newPostId, userId);

    if (!newPost) {
      throw new Error("Failed to retrieve the newly created post.");
    }

    res.status(201).json({
      message: "Post created successfully",
      post: newPost,
    });
  } catch (error) {
    console.error("Error uploading image:", error);

    if (publicId) {
      try {
        await deleteFile(publicId);
      } catch (deleteError) {
        console.error("Error deleting image from Cloudinary:", deleteError);
      }
    }

    res.status(500).json({ message: "Error creating post" });
  }
};

export const likePost = async (req, res) => {
  const { postId } = req.params;
  const { id: userId } = req.user;

  try {
    const result = await PostModel.addLike(postId, userId);
    res.status(201).json({ message: "Post liked successfully" });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(200).json({ message: "The post is already liked." });
    } else if (error.code === "ER_NO_REFERENCED_ROW_2") {
      return res.status(404).json({ message: "Post not found." });
    }
    console.error("Error liking post:", error);
    res.status(500).json({ message: "Error liking post" });
  }
};

export const unlikePost = async (req, res) => {
  const { postId } = req.params;
  const { id: userId } = req.user;

  try {
    const result = await PostModel.removeLike(postId, userId);

    if (!result) {
      return res.status(200).json({ message: "Post was not liked" });
    }

    res.status(200).json({ message: "Post unliked successfully" });
  } catch (error) {
    console.error("Error unliking post:", error);
    res.status(500).json({ message: "Error unliking post" });
  }
};

export const bookmarkPost = async (req, res) => {
  const { postId } = req.params;
  const { id: userId } = req.user;

  try {
    const result = await PostModel.addBookmark(postId, userId);
    res.status(201).json({ message: "Post bookmarked successfully" });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res
        .status(200)
        .json({ message: "The post is already bookmarked." });
    } else if (error.code === "ER_NO_REFERENCED_ROW_2") {
      return res.status(404).json({ message: "Post not found." });
    }
    console.error("Error bookmarking post:", error);
    res.status(500).json({ message: "Error bookmarking post" });
  }
};

export const unbookmarkPost = async (req, res) => {
  const { postId } = req.params;
  const { id: userId } = req.user;

  try {
    const result = await PostModel.removeBookmark(postId, userId);

    if (!result) {
      return res.status(200).json({ message: "Post was not bookmarked" });
    }

    res.status(200).json({ message: "Post unbookmarked successfully" });
  } catch (error) {
    console.error("Error unbookmarking post:", error);
    res.status(500).json({ message: "Error unbookmarking post" });
  }
};

export const getComments = async (req, res) => {
  const { postId } = req.params;
  const { limit, cursor } = req.query;
  const formattedLimit = parseInt(limit, 10);

  try {
    const comments = await CommentModel.getCommentsByPostId(
      formattedLimit,
      cursor,
      postId
    );
    const nextCursor =
      comments.length === formattedLimit
        ? comments[comments.length - 1].id
        : null;
    res.status(200).json({ comments, nextCursor });
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ message: "Error fetching comments" });
  }
};

export const addComment = async (req, res) => {
  const { postId } = req.params;
  const { comment_text } = req.body;
  const { id: userId } = req.user;

  try {
    const comment = {
      user_id: userId,
      post_id: postId,
      comment_text,
    };

    const newCommentId = await CommentModel.createComment(comment);
    const newComment = await CommentModel.getCommentById(newCommentId);

    if (!newComment) {
      throw new Error("Failed to retrieve the newly created comment.");
    }

    res.status(201).json({
      message: "Comment added successfully",
      comment: newComment,
    });
  } catch (error) {
    if (error.code === "ER_NO_REFERENCED_ROW_2") {
      return res.status(404).json({ message: "Post not found." });
    }
    console.error("Error adding comment:", error);
    res.status(500).json({ message: "Error adding comment" });
  }
};
