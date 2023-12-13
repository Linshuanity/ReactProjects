
import mysql from 'mysql';
import config from '../../config/config';

const connectionPool = mysql.createPool({
  connectionLimit: 10,
  host: config.mysqlHost,
  user: config.mysqlUserName,
  password: config.mysqlPass,
  database: config.mysqlDatabase
});
const executeQuery = async (sql, params = []) => {
  const connection = await getConnection();
  try {
    const [results] = await connection.query(sql, params);
    return results;
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

const getConnection = () => {
  return new Promise((resolve, reject) => {
    connectionPool.getConnection((err, connection) => {
      if (err) reject(err);
      else resolve(connection);
    });
  });
};

export const userPosts = async (req, res, next) => {
  try {
    const result = await selectUserPosts(req.body);
    res.send(result);
  } catch (error) {
    next(error);
  }
};

export const getPost = async (req, res, next) => {
  try {
    const result = await selectUserPost(req.params.post_id);
    res.send(result);
  } catch (error) {
    next(error);
  }
};

export const userLike = async (req, res, next) => {
  try {
    const { liker_id, post_id, is_liked } = req.body;
    const result = await addUserLike(liker_id, post_id, is_liked);
    res.send(result);
  } catch (error) {
    next(error);
  }
};

export const userBid = async (req, res, next) => {
  try {
    const { user_id, post_id, price, is_bid } = req.body;
    const result = await addUserBid(user_id, post_id, price, is_bid);
    res.send(result);
  } catch (error) {
    next(error);
  }
};

export const userPurchase = async (req, res, next) => {
  try {
    const { trader_id, post_id, user_id, for_sell, price } = req.body;
    const result = await transfer_post(trader_id, post_id, user_id, for_sell, price);
    res.send(result);
  } catch (error) {
    next(error);
  }
};

export const userComment = async (req, res, next) => {
  try {
    const { user_id, post_id, context } = req.body;
    const result = await addUserComment(user_id, post_id, context);
    res.send(result);
  } catch (error) {
    next(error);
  }
};

export const userComments = async (req, res, next) => {
  try {
    const result = await selectUserComments(req.body.post_id);
    res.send(result);
  } catch (error) {
    next(error);
  }
};

export const userBids = async (req, res, next) => {
  try {
    const result = await selectUserBids(req.body.post_id);
    res.send(result);
  } catch (error) {
    next(error);
  }
};

export const createUserPost = async (req, res, next) => {
  try {
    const insertValues = req.body;
    const result = await createPost(insertValues);
    res.send(result);
  } catch (error) {
    next(error);
  }
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
    connectionPool.getConnection((connectionError, connection) => {
      if (connectionError) {
        reject(connectionError); // 若連線有問題回傳錯誤
        return;
      }

      let filter_string = "";
      let queryParams = [insertValues.as_user, insertValues.as_user];
      switch (insertValues.filter_mode) {
        case 0:
          filter_string = "WHERE p.author_uid = ?";
          break;
        case 1:
          filter_string = "WHERE p.owner_uid = ?";
          break;
        case 2:
          filter_string = "LEFT JOIN bids AS b ON p.pid = b.post_id WHERE b.user_id = ?";
          queryParams = [insertValues.as_user, insertValues.as_user];
          break;
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

      connection.query(query, queryParams, (error, result) => {
        connection.release();
        if (error) {
          console.error('SQL error: ', error);
          reject(error); // 寫入資料庫有問題時回傳錯誤
          return;
        }
        const jsonResponse = JSON.stringify(result);
        resolve(jsonResponse);
      });
    });
  });
};

const addUserLike = (liker_id, post_id, is_liked) => {
  return new Promise((resolve, reject) => {
    connectionPool.getConnection((connectionError, connection) => {
      if (connectionError) {
        reject(connectionError);
        return;
      }

      connection.beginTransaction(err => {
        if (err) {
          connection.release();
          reject(err);
          return;
        }

        const queries = is_liked ? [
          {
            sql: `UPDATE posts SET likes = likes - 1 WHERE pid = ? AND EXISTS (SELECT 1 FROM likes WHERE post_id = ? AND liker_id = ?)`,
            params: [post_id, post_id, liker_id]
          },
          {
            sql: `DELETE from likes WHERE post_id = ? and liker_id = ?`,
            params: [post_id, liker_id]
          }
        ] : [
          {
            sql: `UPDATE posts SET likes = likes + 1 WHERE pid = ? AND NOT EXISTS (SELECT 1 FROM likes WHERE post_id = ? AND liker_id = ?)`,
            params: [post_id, post_id, liker_id]
          },
          {
            sql: `INSERT INTO accounting (from_id, to_id, amount, type) SELECT 0, ?, 1, 0 FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM likes WHERE post_id = ? AND liker_id = ?)`,
            params: [liker_id, post_id, liker_id]
          },
          {
            sql: `UPDATE virus_platform_user SET virus = virus + 1 where user_id = ? AND NOT EXISTS (SELECT 1 FROM likes WHERE post_id = ? AND liker_id = ?)`,
            params: [liker_id, post_id, liker_id]
          },
          {
            sql: `INSERT INTO likes (liker_id, post_id) select ?, ? FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM likes WHERE post_id = ? AND liker_id = ?)`,
            params: [liker_id, post_id, post_id, liker_id]
          }
        ];

        const executeQuery = (sql, params) => {
          return new Promise((resolve, reject) => {
            console.log(sql, params)
            connection.query(sql, params, (error, result) => {
              if (error) {
                return reject(error);
              }
              resolve(result);
            });
          });
        };

        Promise.all(queries.map(query => executeQuery(query.sql, query.params)))
          .then(results => {
            connection.commit(err => {
              if (err) {
                connection.rollback(() => {
                  connection.release();
                  reject(err);
                });
                return;
              }
              connection.release();
              resolve(results);
            });
          })
          .catch(error => {
            connection.rollback(() => {
              connection.release();
              reject(error);
            });
          });
      });
    });
  });
};

const selectUserBids = (post_id) => {
  return new Promise((resolve, reject) => {
    connectionPool.getConnection((connectionError, connection) => { // 資料庫連線
      const query = `SELECT * FROM bids as b JOIN virus_platform_user as u on b.user_id = u.user_id WHERE b.post_id = ? and b.is_bid = 1 ORDER BY b.price DESC`;
      if (connectionError) {
        reject(connectionError); // 若連線有問題回傳錯誤
      } else {
        connection.query(query, [post_id], (error, result) => {
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

const addUserBid = (user_id, post_id, price, is_bid) => {
  return new Promise((resolve, reject) => {
    connectionPool.getConnection((connectionError, connection) => { // 資料庫連線
      if (connectionError) {
        reject(connectionError); // 若連線有問題回傳錯誤
      } else {
        const queries = [
          {
            sql: `INSERT INTO bids (user_id, post_id, is_bid, price) SELECT ?, ?, ?, ?
                    WHERE ? <= (SELECT virus FROM virus_platform_user WHERE user_id = ?)
                    ON DUPLICATE KEY UPDATE price = ?, create_time = DEFAULT`,
            params: [user_id, post_id, is_bid, price, price, user_id, price]
          },
          {
            sql: `UPDATE posts p
                SET p.bid_price = (
                    SELECT MAX(price)
                    FROM bids
                    WHERE post_id = p.pid AND is_bid = true
                ),
                p.ask_price = (
                    SELECT MAX(price)
                    FROM bids
                    WHERE post_id = p.pid AND is_bid = false
                )
                WHERE p.pid = ?`,
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

const transfer_post = (trader_id, post_id, user_id, for_sell, price) => {
  const seller_id = for_sell ? trader_id : user_id;
  const buyer_id = for_sell ? user_id : trader_id;
  return new Promise((resolve, reject) => {
    connectionPool.getConnection((connectionError, connection) => { // 資料庫連線
      if (connectionError) {
        reject(connectionError); // 若連線有問題回傳錯誤
      } else {
        const queries = [
          {
            sql: `DELETE FROM bids WHERE user_id = ? and post_id = ?`,
            params: [user_id, post_id]
          },
          {
            sql: `UPDATE virus_platform_user SET virus = virus - ? WHERE user_id = ?`,
            params: [price, buyer_id]
          },
          {
            sql: `UPDATE virus_platform_user SET virus = virus + ? WHERE user_id = ?`,
            params: [price, seller_id]
          },
          {
            sql: `UPDATE posts p
              LEFT JOIN (
                  SELECT post_id, price, user_id
                  FROM bids
                  WHERE post_id = ?
                  ORDER BY price DESC
                  LIMIT 1
              ) b ON p.pid = b.post_id
              SET p.bid_price = b.price, p.bid_user_id = b.user_id, p.owner_uid = ? where p.pid = ?`,
            params: [post_id, buyer_id, post_id]
          },
          {
            sql: `DELETE FROM bids
                    WHERE user_id = ? 
                      AND is_bid = True 
                      AND price > (SELECT virus FROM virus_platform_user WHERE user_id = ?)`,
            params: [buyer_id]
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
