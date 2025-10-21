import db from "../config/database.js";

export const getPosts = async (limit, cursor, currentUserId) => {
  let baseQuery = `
    SELECT
      p.id, p.image_url, p.caption, p.created_at,
      JSON_OBJECT(
        'id', u.id, 'name', u.name, 'username', u.username, 'profile_picture_url', u.profile_picture_url
      ) AS user,
      (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id) AS like_count,
      (SELECT COUNT(*) FROM comments WHERE post_id = p.id) AS comment_count,
      EXISTS(SELECT 1 FROM post_likes WHERE post_id = p.id AND user_id = ?) AS is_liked,
      EXISTS(SELECT 1 FROM bookmarks WHERE post_id = p.id AND user_id = ?) AS is_bookmarked
    FROM
      posts p
    JOIN
      users u ON p.user_id = u.id
  `;

  const queryParams = [currentUserId, currentUserId];

  if (cursor) {
    baseQuery += ` WHERE p.id < ?`;
    queryParams.push(cursor);
  }

  baseQuery += `
    ORDER BY
      p.created_at DESC, p.id DESC
  `;

  if (limit) {
    baseQuery += " LIMIT ?";
    queryParams.push(parseInt(limit, 10));
  }

  const [rows] = await db.query(baseQuery, queryParams);

  const posts = rows.map((post) => ({
    ...post,
    is_liked: !!post.is_liked,
    is_bookmarked: !!post.is_bookmarked,
  }));

  return posts;
};

export const getPostsByUsername = async (
  limit,
  cursor,
  currentUserId,
  username
) => {
  let baseQuery = `
    SELECT
      p.id, p.image_url, p.caption, p.created_at,
      JSON_OBJECT(
        'id', u.id, 'name', u.name, 'username', u.username, 'profile_picture_url', u.profile_picture_url
      ) AS user,
      (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id) AS like_count,
      (SELECT COUNT(*) FROM comments WHERE post_id = p.id) AS comment_count,
      EXISTS(SELECT 1 FROM post_likes WHERE post_id = p.id AND user_id = ?) AS is_liked,
      EXISTS(SELECT 1 FROM bookmarks WHERE post_id = p.id AND user_id = ?) AS is_bookmarked
    FROM
      posts p
    JOIN
      users u ON p.user_id = u.id
    WHERE
      u.username = ?
  `;

  const queryParams = [currentUserId, currentUserId, username];

  if (cursor) {
    baseQuery += ` AND p.id < ?`;
    queryParams.push(cursor);
  }

  baseQuery += `
    ORDER BY
      p.created_at DESC, p.id DESC
  `;

  if (limit) {
    baseQuery += " LIMIT ?";
    queryParams.push(parseInt(limit, 10));
  }

  const [rows] = await db.query(baseQuery, queryParams);

  const posts = rows.map((post) => ({
    ...post,
    is_liked: !!post.is_liked,
    is_bookmarked: !!post.is_bookmarked,
  }));

  return posts;
};

export const getPostById = async (postId, currentUserId) => {
  const query = `
    SELECT
      p.id, p.image_url, p.caption, p.created_at,
      JSON_OBJECT(
        'id', u.id, 'name', u.name, 'username', u.username, 'profile_picture_url', u.profile_picture_url
      ) AS user,
      (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id) AS like_count,
      (SELECT COUNT(*) FROM comments WHERE post_id = p.id) AS comment_count,
      EXISTS(SELECT 1 FROM post_likes WHERE post_id = p.id AND user_id = ?) AS is_liked,
      EXISTS(SELECT 1 FROM bookmarks WHERE post_id = p.id AND user_id = ?) AS is_bookmarked
    FROM
      posts p
    JOIN
      users u ON p.user_id = u.id
    WHERE
      p.id = ?;
  `;

  const [rows] = await db.query(query, [currentUserId, currentUserId, postId]);

  if (rows.length === 0) {
    return null;
  }

  const post = {
    ...rows[0],
    is_liked: !!rows[0].is_liked,
    is_bookmarked: !!rows[0].is_bookmarked,
  };

  return post;
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

export const addLike = async (postId, userId) => {
  const [result] = await db.query(
    "INSERT INTO post_likes (post_id, user_id) VALUES (?, ?)",
    [postId, userId]
  );

  return result.affectedRows > 0;
};

export const removeLike = async (postId, userId) => {
  const [result] = await db.query(
    "DELETE FROM post_likes WHERE post_id = ? AND user_id = ?",
    [postId, userId]
  );

  return result.affectedRows > 0;
};

export const addBookmark = async (postId, userId) => {
  const [result] = await db.query(
    "INSERT INTO bookmarks (post_id, user_id) VALUES (?, ?)",
    [postId, userId]
  );

  return result.affectedRows > 0;
};

export const removeBookmark = async (postId, userId) => {
  const [result] = await db.query(
    "DELETE FROM bookmarks WHERE post_id = ? AND user_id = ?",
    [postId, userId]
  );

  return result.affectedRows > 0;
};
