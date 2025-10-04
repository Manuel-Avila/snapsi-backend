import db from "../config/database.js";

export const getUserByUsername = async (username) => {
  const [rows] = await db.query(
    `SELECT username, email, bio, profile_picture_url, gender, created_at, updated_at 
    FROM users WHERE username = ?`,
    [username]
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
  const { username, email, password, gender, age } = user;

  const [result] = await db.query(
    `INSERT INTO users (username, email, password, gender, age)
     VALUES (?, ?, ?, ?, ?)`,
    [username, email, password, gender, age]
  );

  return result.insertId;
};

export const updateUser = async (id, user) => {
  const { username, bio, profile_picture_url } = user;

  const [result] = await db.query(
    `UPDATE users
    SET username = ?, bio = ?, profile_picture_url = ?
    WHERE id = ?`,
    [username, bio, profile_picture_url, id]
  );

  return result.affectedRows > 0;
};
