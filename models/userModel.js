import db from "../config/database.js";

export const getUserByUsername = async (username) => {
  const [rows] = await db.query(
    `SELECT name, username, email, bio, profile_picture_url, gender, created_at, updated_at 
    FROM users WHERE username = ?`,
    [username]
  );
  return rows[0];
};

export const getUserById = async (id) => {
  const [rows] = await db.query(
    `SELECT name, username, email, bio, profile_picture_url, image_cloudinary_id, gender, created_at, updated_at 
    FROM users WHERE id = ?`,
    [id]
  );
  return rows[0];
};

export const getUserForAuth = async (email) => {
  const [rows] = await db.query(
    `SELECT id, username, email, password 
    FROM users WHERE email = ?`,
    [email]
  );
  return rows[0];
};

export const createUser = async (user) => {
  const { name, username, email, password, gender, age } = user;

  const [result] = await db.query(
    `INSERT INTO users (name, username, email, password, gender, age)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [name, username, email, password, gender, age]
  );

  return result.insertId;
};

export const updateUser = async (id, data) => {
  const { name, bio, profile_picture_url, image_cloudinary_id } = data;

  const query = `UPDATE users
    SET name = ?, bio = ? ${
      profile_picture_url
        ? ", profile_picture_url = ?, image_cloudinary_id = ?"
        : ""
    }
    WHERE id = ?`;

  const params = [name, bio];

  if (profile_picture_url) {
    params.push(profile_picture_url);
    params.push(image_cloudinary_id);
  }

  params.push(id);

  const [result] = await db.query(query, params);

  return result.affectedRows > 0;
};

export const getProfileByUsername = async (username, currentUserId) => {
  const [rows] = await db.query(
    `SELECT
      u.id, u.name, u.username, u.bio, u.profile_picture_url, u.gender, u.age,
      (SELECT COUNT(*) FROM posts WHERE user_id = u.id) AS post_count,
      (SELECT COUNT(*) FROM followers WHERE following_id = u.id) AS follower_count,
      (SELECT COUNT(*) FROM followers WHERE follower_id = u.id) AS following_count,
      EXISTS(SELECT 1 FROM followers WHERE follower_id = ? AND following_id = u.id) AS is_followed
    FROM
      users u
    WHERE
      u.username = ?;
  `,
    [currentUserId, username]
  );

  if (rows.length === 0) {
    return null;
  }

  const post = {
    ...rows[0],
    is_followed: !!rows[0].is_followed,
  };

  return post;
};

export const addFollow = async (followingId, followerId) => {
  const [result] = await db.query(
    "INSERT INTO followers (follower_id, following_id) VALUES (?, ?)",
    [followerId, followingId]
  );

  return result.affectedRows > 0;
};

export const removeFollow = async (unfollowedId, followerId) => {
  const [result] = await db.query(
    "DELETE FROM followers WHERE follower_id = ? AND following_id = ?",
    [followerId, unfollowedId]
  );

  return result.affectedRows > 0;
};
