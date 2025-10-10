import db from "../config/database.js";

export const getPosts = async (limit, cursor, currentUserId) => {
  let baseQuery = `
    SELECT p.id, p.image_url, p.caption, p.created_at,
    JSON_OBJECT(
      'id', u.id,
      'username', u.username,
      'profile_picture_url', u.profile_picture_url
    ) AS user,
    (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id) AS like_count,
    (SELECT COUNT(*) FROM comments WHERE post_id = p.id) AS comment_count,
    EXISTS(SELECT 1 FROM post_likes WHERE post_id = p.id AND user_id = ?) as is_liked,
    EXISTS(SELECT 1 FROM bookmarks WHERE post_id = p.id AND user_id = ?) as is_bookmarked
    FROM posts p
    JOIN users u ON p.user_id = u.id
  `;
  const queryParams = [currentUserId, currentUserId];

  if (cursor) {
    baseQuery += ` WHERE p.created_at < (SELECT created_at FROM posts WHERE id = ?)`;
    queryParams.push(cursor);
  }

  baseQuery += ` ORDER BY p.created_at DESC, p.id DESC`;

  if (limit) {
    baseQuery += " LIMIT ?";
    queryParams.push(parseInt(limit, 10));
  }

  baseQuery += ";";

  const [rows] = await db.query(baseQuery, queryParams);
  const posts = rows.map((post) => ({
    ...post,
    is_liked: !!post.is_liked,
    is_bookmarked: !!post.is_bookmarked,
  }));

  return posts;
};

export const createPost = async (post) => {
  const { user_id, caption, image_url, image_cloudinary_id } = post;

  const [result] = await db.query(
    `INSERT INTO posts (user_id, caption, image_url, image_cloudinary_id)
        VALUES (?, ?, ?, ?)`,
    [user_id, caption, image_url, image_cloudinary_id]
  );

  return result.insertId;
};
