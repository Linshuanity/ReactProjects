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

export const userBid = (req, res, next) => {
  const user_id = req.body.user_id;
  const post_id = req.body.post_id;
  const price = req.body.price;
  const is_bid = req.body.is_bid;
  addUserBid(user_id, post_id, price, is_bid).then((result) => {
    res.send(result); // 成功回傳result結果
  }).catch((error) => { next(error); }); // 失敗回傳錯誤訊息
};

export const userPurchase = (req, res, next) => {
  const trader_id = req.body.trader_id;
  const post_id = req.body.post_id;
  const user_id = req.body.user_id;
  const for_sell = req.body.for_sell;
  transfer_post(trader_id, post_id, user_id, for_sell).then((result) => {
    res.send(result); // 成功回傳result結果
  }).catch((error) => { next(error); }); // 失敗回傳錯誤訊息
};

export const userComment = (req, res, next) => {
  // 取得帳密
  const user_id = req.body.user_id;
  const post_id = req.body.post_id;
  const context = req.body.context;
  addUserComment(user_id, post_id, context).then((result) => {
    res.send(result); // 成功回傳result結果
  }).catch((error) => { next(error); }); // 失敗回傳錯誤訊息
};

export const userComments = (req, res, next) => {
  const post_id = req.body.post_id;
  selectUserComments(post_id).then((result) => {

    res.send(result);
  }).catch((error) => { next(error); });
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
          const queries = is_liked ? [
            {
              sql: `DELETE from likes WHERE post_id = ? and liker_id = ?`,
              params: [post_id, liker_id]
            },
            {
              sql: `UPDATE posts SET likes = likes - 1 WHERE pid = ?`,
              params: [post_id]
            }
          ] :
          [ 
            {
              sql: `INSERT INTO likes VALUES (DEFAULT, ?, ?, DEFAULT)`,
              params: [liker_id, post_id]
            },
            {
              sql: `UPDATE posts SET likes = likes + 1 WHERE pid = ?`,
              params: [post_id]
            }
          ];

          const results = []; // Array to store the results of each query

          function executeQueries() {
            const queryPromises = [];
            for (const query of queries) {
              const queryPromise = new Promise((resolve, reject) => {
                connection.query(query.sql, query.params, (error, result) => {
                  if (error) {
                    reject(error); // If there is an error in any query, reject with the error
                  } else {
                    results.push(result); // Store the result of the current query
                    resolve(); // Resolve the Promise after successful query execution
                  }
                });
              });
              queryPromises.push(queryPromise);
            }

            // Use Promise.all to wait for all queries to complete
            Promise.all(queryPromises)
              .then(() => {
                resolve(results); // All queries have been executed successfully
              })
              .catch((error) => {
                reject(error); // If any query encounters an error, reject with the error
              });
          }
          executeQueries();
      }
    });
  });
};

const addUserBid = (user_id, post_id, price, is_bid) => {
  return new Promise((resolve, reject) => {
    connectionPool.getConnection((connectionError, connection) => { // 資料庫連線
      const query = `INSERT INTO bids VALUES (DEFAULT, ${user_id}, ${post_id}, ${is_bid}, ${price}, DEFAULT) ON DUPLICATE KEY UPDATE price = ${price}, create_time = DEFAULT`
      if (connectionError) {
        reject(connectionError); // 若連線有問題回傳錯誤
      } else {
        connection.query(query, (error, result) => {
            if (error) {
              console.error('SQL error: ', error);
              reject(error); // 寫入資料庫有問題時回傳錯誤

            } else {
              const update_query = 
              `UPDATE posts p
              JOIN (
                  SELECT post_id, price, user_id
                  FROM bids
                  WHERE post_id = ${post_id}
                  ORDER BY price DESC
                  LIMIT 1
              ) b ON p.pid = b.post_id
              SET p.bid_price = b.price, p.bid_user_id = user_id`
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
                        const jsonResponse = JSON.stringify(result);
                        resolve(jsonResponse);
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

const transfer_post = (trader_id, post_id, user_id, for_sell) => {
  const new_owner_id = for_sell ? trader_id : user_id;
  return new Promise((resolve, reject) => {
    connectionPool.getConnection((connectionError, connection) => { // 資料庫連線
      const query = `DELETE FROM bids WHERE user_id = ${user_id} and post_id = ${post_id}`;
      if (connectionError) {
        reject(connectionError); // 若連線有問題回傳錯誤
      } else {
        connection.query(query, (error, result) => {
            if (error) {
              console.error('SQL error: ', error);
              reject(error); // 寫入資料庫有問題時回傳錯誤

            } else {
              const update_query = 
              `UPDATE posts p
              LEFT JOIN (
                  SELECT post_id, price, user_id
                  FROM bids
                  WHERE post_id = ${post_id}
                  ORDER BY price DESC
                  LIMIT 1
              ) b ON p.pid = b.post_id
              SET p.bid_price = b.price, p.bid_user_id = user_id, p.owner_uid = ${new_owner_id} where p.pid = ${post_id}`
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
                        const jsonResponse = JSON.stringify(result);
                        resolve(jsonResponse);
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

const addUserComment = (user_id, post_id, context) => {
  return new Promise((resolve, reject) => {
    connectionPool.getConnection((connectionError, connection) => { // 資料庫連線
        const query = `INSERT INTO comments VALUES (DEFAULT, ${user_id}, ${post_id}, "${context}" , DEFAULT)`;
      if (connectionError) {
        reject(connectionError); // 若連線有問題回傳錯誤
      } else {
        connection.query(query, (error, result) => {
            if (error) {
              console.error('SQL error: ', error);
              reject(error); // 寫入資料庫有問題時回傳錯誤

            } else {
              const update_query = `UPDATE posts SET comments = comments + 1 WHERE pid = ${post_id}`;
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
                        const jsonResponse = JSON.stringify(result);
                        resolve(jsonResponse);
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

const selectUserComments = (post_id) => {
  return new Promise((resolve, reject) => {
    connectionPool.getConnection((connectionError, connection) => { // 資料庫連線
    const query = `SELECT c.context, u.user_name, u.user_image_path FROM comments as c JOIN virus_platform_user as u on c.user_id = u.user_id WHERE c.post_id = ${post_id}`;
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
