import * as UserModel from "../models/userModel.js";
import * as NotificationModel from "../models/notificationModel.js";

export const getProfile = async (req, res) => {
  const { username } = req.params;
  const { id: userId } = req.user;

  try {
    const user = await UserModel.getProfileByUsername(username, userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "Profile fetched successfully", user });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const followUser = async (req, res) => {
  const { userId: followedUserId } = req.params;
  const { id: followerUserId } = req.user;

  if (followedUserId === followerUserId) {
    return res.status(400).json({ message: "You cannot follow yourself." });
  }

  try {
    const result = await UserModel.addFollow(followedUserId, followerUserId);
    await NotificationModel.createNotification({
      type: "follow",
      sender_user_id: followerUserId,
      recipient_user_id: followedUserId,
    });
    res.status(200).json({ message: "Successfully followed the user" });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(200).json({ message: "The user is already followed." });
    } else if (error.code === "ER_NO_REFERENCED_ROW_2") {
      return res.status(404).json({ message: "User not found." });
    }
    console.error("Error following user:", error);
    res.status(500).json({ message: "Error following user" });
  }
};

export const unfollowUser = async (req, res) => {
  const { userId: unfollowedUserId } = req.params;
  const { id: followerUserId } = req.user;

  try {
    const result = await UserModel.removeFollow(
      unfollowedUserId,
      followerUserId
    );
    if (!result) {
      return res.status(200).json({ message: "The user is not followed." });
    }
    res.status(200).json({ message: "Successfully unfollowed the user" });
  } catch (error) {
    console.error("Error unfollowing user:", error);
    res.status(500).json({ message: "Error unfollowing user" });
  }
};
