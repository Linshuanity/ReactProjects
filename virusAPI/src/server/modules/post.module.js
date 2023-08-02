import bcrypt from "bcrypt";
import mysql from 'mysql';
import config from '../../config/config';
import fs from 'fs';
import path from 'path';
import jwt from "jsonwebtoken";

const connectionPool = mysql.createPool({
  connectionLimit: 10,
  host: config.mysqlHost,
  user: config.mysqlUserName,
  password: config.mysqlPass,
  database: config.mysqlDatabase
});

/* LOGGING IN */
export const userPosts = (req, res, next) => {
  // 取得帳密
  const insertValues = req.body;
  selectUserPosts(insertValues).then((result) => {

    res.send(result); // 成功回傳result結果
  }).catch((error) => { next(error); }); // 失敗回傳錯誤訊息
};

export const userLike = (req, res, next) => {
  // 取得帳密
  const liker_id = req.body.liker_id;
  const post_id = req.body.post_id;
  const is_liked = req.body.is_liked;
  addUserLike(liker_id, post_id, is_liked).then((result) => {

    res.send(result); // 成功回傳result結果
  }).catch((error) => { next(error); }); // 失敗回傳錯誤訊息
};

const selectUserPosts = (insertValues) => {
  return new Promise((resolve, reject) => {
    connectionPool.getConnection((connectionError, connection) => { // 資料庫連線
    const query = `
      SELECT DISTINCT p.*,
             v1.user_name AS owner_name,
             v1.user_image_path AS owner_profile,
             v2.user_name AS author_name,
             v2.user_image_path AS author_profile,
             CASE WHEN l.post_id IS NOT NULL THEN 1 ELSE 0 END AS is_liked
      FROM posts AS p
      JOIN virus_platform_user AS v1 ON p.owner_uid = v1.user_id
      JOIN virus_platform_user AS v2 ON p.author_uid = v2.user_id
      LEFT JOIN likes AS l ON p.pid = l.post_id AND l.liker_id = ${insertValues.as_user}`;
      if (connectionError) {
        reject(connectionError); // 若連線有問題回傳錯誤
      } else {
        connection.query(query, (error, result) => {
            if (error) {
              console.error('SQL error: ', error);
              reject(error); // 寫入資料庫有問題時回傳錯誤
            } else {              
              const jsonResponse = JSON.stringify(result);
              resolve(jsonResponse);
            }
            connection.release();
          }
        );
      }
    });
  });
};

const addUserLike = (liker_id, post_id, is_liked) => {
  return new Promise((resolve, reject) => {
    connectionPool.getConnection((connectionError, connection) => { // 資料庫連線
      if (connectionError) {
        reject(connectionError); // 若連線有問題回傳錯誤
      } else {
        const query = is_liked ? `DELETE from likes WHERE post_id = ${post_id} and liker_id = ${liker_id}` : `INSERT INTO likes VALUES (DEFAULT, ${liker_id}, ${post_id}, DEFAULT)`;
        connection.query(query, 
          (error, result) => {
            if (error) {
              console.error('First query error:', error);
              connection.rollback(() => {
                reject(error);
              });
            } else {
              const likeId = result.insertId;
              const update_query = is_liked ? `UPDATE posts SET likes = likes - 1 WHERE pid = ${post_id}` : `UPDATE posts SET likes = likes + 1 WHERE pid = ${post_id}`;
              // Assuming you have another query to execute here
              connection.query(update_query,
                (error, result) => {
                  if (error) {
                    console.error('Second query error:', error);
                    connection.rollback(() => {
                      reject(error);
                    });
                  } else {
                    connection.commit((err) => {
                      if (err) {
                        console.error('Commit error:', err);
                        connection.rollback(() => {
                          reject(err);
                        });
                      } else {
                        resolve({ _id: post_id, is_liked: is_liked, message: 'Both queries executed successfully.' });
                      }
                    });
                  }
                }
              );
            }
            connection.release();
          }
        );
      }
    });
  });
};
