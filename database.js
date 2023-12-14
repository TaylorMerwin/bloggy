import mysql from 'mysql2';
import dotenv from 'dotenv';
dotenv.config();

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
}).promise();

/**
 * Retrieves all users from the database.
 * @return {Promise<Array>} all rows from the Users table.
 */
export async function getUsers() {
  const [rows] = await pool.query(`SELECT * FROM Users`);
  return rows;
}

/**
 * Retrieves a blog post from the database.
 * @param {post_id} postId - The id of the post to retrieve.
 * @return {Promise<Object>} the specified row from the BlogPosts table.
 */
export async function getPost(postId) {
  const [row] = await pool.query(
      `SELECT * FROM BlogPosts WHERE post_id = ?`, [postId]);
  return [row];
}

/**
 * Retrieves all blog posts from the database.
 * @return {Promise<Object>} All rows from the BlogPosts table.
 */
export async function getPosts() {
  const [rows] = await pool.query(`SELECT * FROM BlogPosts`);
  return rows;
}
