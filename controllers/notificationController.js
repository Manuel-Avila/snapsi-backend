import * as NotificationModel from "../models/notificationModel.js";

export const getMyNotifications = async (req, res) => {
  const { limit, cursor } = req.query;
  const { id: userId } = req.user;
  const formattedLimit = parseInt(limit, 10);

  try {
    const notifications = await NotificationModel.getNotificationsByUserId(
      limit,
      cursor,
      userId
    );

    const nextCursor =
      notifications.length === formattedLimit
        ? notifications[notifications.length - 1].id
        : null;

    res.status(200).json({ notifications, nextCursor });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Error fetching notifications" });
  }
};
