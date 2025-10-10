import { uploadFromBuffer, deleteFile } from "../utils/cloudinaryUtils.js";
import * as PostModel from "../models/postModel.js";

export const getPosts = async (req, res) => {
  const { limit, cursor } = req.query;
  const currentUserId = req.user.id;

  try {
    const posts = await PostModel.getPosts(limit, cursor, currentUserId);

    const nextCursor =
      posts.length === limit ? posts[posts.length - 1].id : null;

    res.status(200).json({ posts, nextCursor });
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ message: "Error fetching posts" });
  }
};

export const createPost = async (req, res) => {
  const { caption } = req.body;
  const imageFile = req.file;

  if (!imageFile) {
    return res.status(400).json({ message: "No image file provided." });
  }

  let publicId;

  try {
    const uploadResult = await uploadFromBuffer(imageFile.buffer, "posts");
    const imageUrl = uploadResult.secure_url;
    publicId = uploadResult.public_id;

    const post = {
      user_id: req.user.id,
      caption,
      image_url: imageUrl,
      image_cloudinary_id: publicId,
    };

    const newPostId = await PostModel.createPost(post);

    res.status(201).json({
      message: "Post created successfully",
      post: { id: newPostId, caption, imageUrl },
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
