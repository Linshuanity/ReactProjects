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
  const insertValues = req.body;
  selectUserPosts(insertValues).then((result) => {

    res.send(result); // 成功回傳result結果
  }).catch((error) => { next(error); }); // 失敗回傳錯誤訊息
};

export const getPost = (req, res, next) => {
  console.log('getPost req.params.post_id: ', req.params.post_id);
  selectUserPost(req.params.post_id).then((result) => {
    res.send(result); // 成功回傳result結果
  }).catch((error) => { next(error); }); // 失敗回傳錯誤訊息
};

export const userLike = (req, res, next) => {
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


/*
export const createPost = async (req, res) => {
  try {
    const { userId, description, picturePath, price} = req.body;
    const user = await User.findById(userId);
    const newPost = new Post({
      userId,
      firstName: user.firstName,
      lastName: user.lastName,
      location: user.location,
      description,
      userPicturePath: user.picturePath,
      picturePath,
      price,
      likes: {},
      comments: [],
    });
    await newPost.save();

    const post = await Post.find();
    res.status(201).json(post);
  } catch (err) {
    res.status(409).json({ message: err.message });
  }
};
*/

export const createUserPost = (req, res, next) => {
  const insertValues = req.body;
  console.log('createUserPost req.body: ', req.body);
  console.log('req.body.content: ', req.body.content);
  console.log('insertValues: ', insertValues);
  createPost(insertValues).then((result) => {
  // const post_id = req.body.post_id;
  // createPost(post_id).then((result) => {

    res.send(result);
  }).catch((error) => { next(error); });
};

/* POST 新增 */
const createPost = (insertValues) => {
  return new Promise((resolve, reject) => {
    connectionPool.getConnection((connectionError, connection) => { // 資料庫連線
      if (connectionError) {
        reject(connectionError); // 若連線有問題回傳錯誤
      } else {
        // 'UPDATE virus_platform_user SET ? WHERE user_id = ?', [insertValues, userId]
        connection.query('INSERT INTO posts (title,content,owner_uid,author_uid,image_path) VALUES (?,?,?,?,?)',  [insertValues.content,insertValues.content,insertValues.userId,insertValues.userId,insertValues.picturePath], (error, result) => { // 資料表寫入一筆資料
          if (error) {
            console.error('SQL error: ', error);
            reject(error); // 寫入資料庫有問題時回傳錯誤
          } else if (result.affectedRows === 1) {
            resolve(`{"status":"ok", "msg":"成功！"}`);
          }
          connection.release();
        });
      }
    });
  });
};

const selectUserPost = (post_id) => {
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
      LEFT JOIN likes AS l ON p.pid = l.post_id 
      WHERE p.pid = ? `;
      if (connectionError) {
        reject(connectionError); // 若連線有問題回傳錯誤
      } else {
        connection.query(query,[post_id], (error, result) => {
            if (error) {
              console.error('SQL error: ', error);
              reject(error); // 寫入資料庫有問題時回傳錯誤
            } else if (Object.keys(result).length === 0) {
              resolve(`{"status":"error", "msg":"post not found"}`);
            } else {              
              // const jsonResponse = JSON.stringify(result);
              // resolve(jsonResponse);
              resolve({
                pid: result[0].pid,
                title: result[0].title,
                content: result[0].content,
                owner_uid: result[0].owner_uid,
                author_uid: result[0].author_uid,
                status: result[0].status,
                expire_date: result[0].expire_date,
                bid_user_id: result[0].bid_user_id,
                bid_price: result[0].bid_price,
                likes: result[0].likes,
                image_path: result[0].image_path,
                create_date: result[0].create_date,
                comments: result[0].comments,
                level: result[0].level,
                ask_price: result[0].ask_price,
                owner_name: result[0].owner_name,
                owner_profile: result[0].owner_profile,
                author_name: result[0].author_name,
                author_profile: result[0].author_profile
              });
            }
            connection.release();
          }
        );
      }
    });
  });
};

const selectUserPosts = (insertValues) => {
  return new Promise((resolve, reject) => {
    connectionPool.getConnection((connectionError, connection) => { // 資料庫連線
    let filter_string = "";
    if (insertValues.filter_mode === 0)
    {
        filter_string = "WHERE p.author_uid = ?";
    }
    if (insertValues.filter_mode === 1)
    {
        filter_string = "WHERE p.owner_uid = ?";
    }
    if (insertValues.filter_mode === 2)
    {
        filter_string = "LEFT JOIN bids AS b ON p.pid = b.post_id WHERE b.user_id = ?"
    }

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
      LEFT JOIN likes AS l ON p.pid = l.post_id AND l.liker_id = ?
      ${filter_string} order by p.pid desc`;
      if (connectionError) {
        reject(connectionError); // 若連線有問題回傳錯誤
      } else {
        connection.query(query,[insertValues.as_user, insertValues.as_user], (error, result) => {
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
            },
            {
              sql: `INSERT INTO accounting VALUES (DEFAULT, 0, ?, 1, 0, DEFAULT, DEFAULT)`,
              params: [liker_id]
            },
            {
              sql: `UPDATE virus_platform_user SET virus = virus + 1 where user_id = ?`,
              params: [liker_id]
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
