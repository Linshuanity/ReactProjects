import mysql from 'mysql';
import config from '../../config/config';

import {
  createNotification,
  createNotificationWithSQL
} from './notification.module.js';

const connectionPool = mysql.createPool({
  connectionLimit: 10,
  host: config.mysqlHost,
  port: config.mysqlPort,
  user: config.mysqlUserName,
  password: config.mysqlPass,
  database: config.mysqlDatabase,
  charset: 'utf8mb4',
});

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
    const result = await selectUserPost(req.body);
    res.send(result);
  } catch (error) {
    next(error);
  }
};

export const searchPost = async (req, res, next) => {
  try {
    const result = await searchUserPost(req.body);
    res.send(result);
  } catch (error) {
    next(error);
  }
};

export const userLike = async (req, res, next) => {
  try {
    const rand = Math.random();
    let reward = 0;
    if (rand > 0.7) reward = 2;
    else if (rand > 0.3) reward = 1;

    const { liker_id, post_id } = req.body;
    const result = await addUserLike(liker_id, post_id, reward);

    let content_sql = 'SELECT CONCAT(vp.user_name, \' likes your post!\') as content FROM virus_platform_user vp WHERE vp.user_id = ?';
    if (reward > 0) {
      content_sql = 'SELECT CONCAT(vp.user_name, \' likes your post! You made' + reward + ' virus!\') as content FROM virus_platform_user vp WHERE vp.user_id = ?';
      createNotificationWithSQL(3, post_id,
        'SELECT ? as user_id FROM dual', [liker_id],
        'SELECT \'You like a post! You made ' + reward + ' virus!\' as content FROM dual', []);
    }
    createNotificationWithSQL(1, post_id,
      'SELECT owner_uid as user_id FROM posts WHERE pid = ?', [post_id],
      content_sql, [liker_id]);
    res.send(result);

  } catch (error) {
    next(error);
  }
};

export const commentlike = async (req, res, next) => {
  try {
    const rand = Math.random();
    let reward = 0;
    if (rand > 0.7) reward = 2;
    else if (rand > 0.3) reward = 1;

    const { liker_id, comment_id } = req.body;
    const result = await addCommentlike(liker_id, comment_id, reward);

    let content_sql = 'SELECT CONCAT(vp.user_name, \' likes your comment!\') as content FROM virus_platform_user vp WHERE vp.user_id = ?';
    if (reward > 0) {
      content_sql = 'SELECT CONCAT(vp.user_name, \' likes your comment! You made ' + reward + ' virus!\') as content FROM virus_platform_user vp WHERE vp.user_id = ?';
      createNotificationWithSQL(3, comment_id,
        'SELECT ? as user_id FROM dual', [liker_id],
        'SELECT \'You like a comment! You made ' + reward + ' virus!\' as content FROM dual', []);
    }
    createNotificationWithSQL(2, comment_id,
      'SELECT user_id as user_id FROM comments WHERE cid = ?', [comment_id],
      content_sql, [liker_id]);
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
    const result = await transfer_post(
      trader_id,
      post_id,
      user_id,
      for_sell,
      price,
    );
    res.send(result);
  } catch (error) {
    next(error);
  }
};

export const userRefuel = async (req, res, next) => {
  try {
    const { doner_id, post_id, price } = req.body;
    const result = await extend_post(
      doner_id,
      post_id,
      price,
    );
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
    const result = await selectUserComments(req.body.user_id, req.body.post_id);
    // const result = await selectUserComments(req.body.user_id, req.body.post_id);
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
  const post_cost = 1;
  return new Promise((resolve, reject) => {
    connectionPool.getConnection((connectionError, connection) => {
      if (connectionError) {
        reject(connectionError);
        return;
      }

      connection.beginTransaction((err) => {
        if (err) {
          connection.release();
          reject(err);
          return;
        }

        const queries = [
          {
            tag: 'FUND_CHECK',
            sql: `UPDATE virus_platform_user SET virus = virus - ? WHERE user_id = ? 
                        AND virus >= ?`,
            params: [
              post_cost,
              insertValues.userId,
              post_cost
            ],
          },
          {
            tag: 'ADD_ACC',
            sql: `INSERT INTO accounting (from_id, to_id, amount, type, note) VALUES (?, 0, ?, 0, "create post")`,
            params: [
              insertValues.userId,
              post_cost
            ]
          },
          {
            tag: 'INS_POST',
            sql: `INSERT INTO posts (title, content, owner_uid, author_uid, image_path, expire_date) 
                  VALUES (?, ?, ?, ?, ?, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 7 DAY))`,
            params: [
              insertValues.content,
              insertValues.content,
              insertValues.userId,
              insertValues.userId,
              insertValues.picturePath,
            ],
          },
          {
            tag: 'INC_SUBS',
            sql: `UPDATE virus_platform_user SET user_post_count = user_post_count + 1 WHERE user_id = ?`,
            params: [insertValues.userId],
          },
          {
            tag: 'ADD_ACH',
            sql: `INSERT INTO user_achievement (user_id, achievement_id, create_time, value, last_update_time, level, previous, next)
                SELECT vp.user_id, 4, NOW(),
                       user_post_count, 
                       NOW(), 
                       lm.level, lm.required, lm.next
                FROM virus_platform_user vp
                    LEFT JOIN level_map lm
                    ON lm.required <= vp.user_post_count
                WHERE vp.user_id = ? AND lm.ach_code = 4
                ORDER BY lm.required DESC
                LIMIT 1
                ON DUPLICATE KEY UPDATE value = VALUES(value), last_update_time = Now()`,
            params: [
              insertValues.userId,
            ],
          },
        ];

        const executeQuery = (tag, sql, params) => {
          return new Promise((resolve, reject) => {
            connection.query(sql, params, (error, result) => {
              if (error) {
                return reject(error);
              }
              resolve(result);
            });
          });
        };

        Promise.all(
          queries.map((query) =>
            executeQuery(query.tag, query.sql, query.params),
          ),
        )
          .then((results) => {
            // Check if the post was inserted successfully
            const affectedRows = results[0].affectedRows;
            if (affectedRows === 0) {
              return resolve({ success: false });
            }

            connection.commit((err) => {
              if (err) {
                connection.rollback(() => {
                  reject(err);
                });
                return;
              }
              resolve({ success: true });
            });
          })
          .catch((error) => {
            connection.rollback(() => {
              reject(error);
            });
          }).finally(() => {
            connection.release();
          });
      });
    });
  });
};

const searchUserPost = (insertValues) => {
  return new Promise((resolve, reject) => {
    connectionPool.getConnection((connectionError, connection) => {
      // 資料庫連線
      const query = `
        SELECT DISTINCT p.*,
               v1.user_name AS owner_name,
               v1.user_image_path AS owner_profile,
               v2.user_name AS author_name,
               v2.user_image_path AS author_profile,
               CASE WHEN b.price IS NOT NULL THEN b.price ELSE 0 END AS my_bid,
               CASE WHEN l.post_id IS NOT NULL THEN 1 ELSE 0 END AS is_liked
        FROM posts AS p
        JOIN virus_platform_user AS v1 ON p.owner_uid = v1.user_id
        JOIN virus_platform_user AS v2 ON p.author_uid = v2.user_id
        LEFT JOIN bids AS b ON p.pid = b.post_id and b.user_id = ?
        LEFT JOIN likes AS l ON p.pid = l.post_id AND l.liker_id = ?

      WHERE p.content LIKE ? `;
      let queryParams = [
        insertValues.login_user,
        insertValues.login_user,
        `%${insertValues.keyword}%`,
      ];
      if (connectionError) {
        reject(connectionError); // 若連線有問題回傳錯誤
      } else {
        connection.query(query, queryParams, (error, result) => {
          if (error) {
            console.error('SQL error: ', error);
            reject(error); // 寫入資料庫有問題時回傳錯誤
          } else {
            const jsonResponse = JSON.stringify(result);
            resolve(jsonResponse);
          }
          connection.release();
        });
      }
    });
  });
};

const selectUserPost = (insertValues) => {
  return new Promise((resolve, reject) => {
    connectionPool.getConnection((connectionError, connection) => {
      // 資料庫連線
      const query = `
        SELECT DISTINCT p.*,
               v1.user_name AS owner_name,
               v1.user_image_path AS owner_profile,
               v2.user_name AS author_name,
               v2.user_image_path AS author_profile,
               CASE WHEN b.price IS NOT NULL THEN b.price ELSE 0 END AS my_bid,
               CASE WHEN l.post_id IS NOT NULL THEN 1 ELSE 0 END AS is_liked
        FROM posts AS p
        JOIN virus_platform_user AS v1 ON p.owner_uid = v1.user_id
        JOIN virus_platform_user AS v2 ON p.author_uid = v2.user_id
        LEFT JOIN bids AS b ON p.pid = b.post_id and b.user_id = ?
        LEFT JOIN likes AS l ON p.pid = l.post_id AND l.liker_id = ?

      WHERE p.pid = ? `;
      let queryParams = [
        insertValues.login_user,
        insertValues.login_user,
        insertValues.post_id,
      ];
      if (connectionError) {
        reject(connectionError); // 若連線有問題回傳錯誤
      } else {
        connection.query(query, queryParams, (error, result) => {
          if (error) {
            console.error('SQL error: ', error);
            reject(error); // 寫入資料庫有問題時回傳錯誤
          } else if (Object.keys(result).length === 0) {
            resolve(`{"status":"error", "msg":"post not found"}`);
          } else {
            const jsonResponse = JSON.stringify(result);
            resolve(jsonResponse);
          }
          connection.release();
        });
      }
    });
  });
};

const selectUserPosts = (insertValues) => {
  return new Promise((resolve, reject) => {
    const page = insertValues.page || 1; // Default to page 1 if not provided
    const limit = insertValues.limit || 5; // Default limit to 5 posts
    const offset = (page - 1) * limit;

    connectionPool.getConnection((connectionError, connection) => {
      if (connectionError) {
        reject(connectionError);
        return;
      }

      let filter_string = '';
      let order_string = '';
      let queryParams = [
        insertValues.login_user,
        insertValues.login_user,
        insertValues.as_user,
        limit,
        offset,
      ];

      switch (insertValues.filter_mode) {
        case 0:
          queryParams = [
            insertValues.login_user,
            insertValues.login_user,
            limit,
            offset,
          ];
          filter_string = 'WHERE expire_date > NOW()';
          order_string = ' ORDER BY p.pid DESC';
          break;
        case 1:
          filter_string = 'WHERE p.author_uid = ?';
          order_string = ' ORDER BY p.pid DESC';
          break;
        case 2:
          filter_string = 'WHERE p.owner_uid = ?';
          order_string = ' ORDER BY p.pid DESC';
          break;
        case 3:
          filter_string = 'WHERE b.user_id = ? AND b.price > 0';
          order_string = ' ORDER BY p.pid DESC';
          break;
      }

      const query = `
        SELECT DISTINCT p.*,
               v1.user_name AS owner_name,
               v1.user_image_path AS owner_profile,
               v2.user_name AS author_name,
               v2.user_image_path AS author_profile,
               CASE WHEN b.price IS NOT NULL THEN b.price ELSE 0 END AS my_bid,
               CASE WHEN l.post_id IS NOT NULL THEN 1 ELSE 0 END AS is_liked
        FROM posts AS p
        JOIN virus_platform_user AS v1 ON p.owner_uid = v1.user_id
        JOIN virus_platform_user AS v2 ON p.author_uid = v2.user_id
        LEFT JOIN bids AS b ON p.pid = b.post_id AND b.user_id = ?
        LEFT JOIN likes AS l ON p.pid = l.post_id AND l.liker_id = ?
        ${filter_string} ${order_string}
        LIMIT ? OFFSET ?`;

      connection.query(query, queryParams, (error, result) => {
        connection.release();
        if (error) {
          console.error('SQL error: ', error);
          reject(error);
          return;
        }

        // Construct the response with both page and posts
        const response = {
          page: page,
          posts: result, // Posts data
        };

        resolve(JSON.stringify(response)); // Return response as JSON string
      });
    });
  });
};


// const selectUserPosts = (insertValues) => {
//   return new Promise((resolve, reject) => {
//     connectionPool.getConnection((connectionError, connection) => {
//       if (connectionError) {
//         reject(connectionError); // 若連線有問題回傳錯誤
//         return;
//       }

//       let filter_string = '';
//       let order_string = '';
//       let queryParams = [
//         insertValues.login_user,
//         insertValues.login_user,
//         insertValues.as_user,
//       ];
//       switch (insertValues.filter_mode) {
//         case 0:
//           filter_string = 'where 1=1';
//           order_string = ' order by p.pid desc';
//           break;
//         case 1:
//           filter_string = 'WHERE p.author_uid = ?';
//           order_string = ' order by p.pid desc';
//           break;
//         case 2:
//           filter_string = 'WHERE p.owner_uid = ?';
//           order_string = ' order by p.pid desc';
//           break;
//         case 3:
//           filter_string = 'WHERE b.user_id = ? and b.price > 0';
//           order_string = ' order by p.pid desc';
//           break;
//       }

//       const query = `
//         SELECT DISTINCT p.*,
//                v1.user_name AS owner_name,
//                v1.user_image_path AS owner_profile,
//                v2.user_name AS author_name,
//                v2.user_image_path AS author_profile,
//                CASE WHEN b.price IS NOT NULL THEN b.price ELSE 0 END AS my_bid,
//                CASE WHEN l.post_id IS NOT NULL THEN 1 ELSE 0 END AS is_liked
//         FROM posts AS p
//         JOIN virus_platform_user AS v1 ON p.owner_uid = v1.user_id
//         JOIN virus_platform_user AS v2 ON p.author_uid = v2.user_id
//         LEFT JOIN bids AS b ON p.pid = b.post_id and b.user_id = ?
//         LEFT JOIN likes AS l ON p.pid = l.post_id AND l.liker_id = ?
//         ${filter_string} ${order_string}`;

//       connection.query(query, queryParams, (error, result) => {
//         connection.release();
//         if (error) {
//           console.error('SQL error: ', error);
//           reject(error); // 寫入資料庫有問題時回傳錯誤
//           return;
//         }
//         const jsonResponse = JSON.stringify(result);
//         resolve(jsonResponse);
//       });
//     });
//   });
// };

const addCommentlike = (liker_id, comment_id, reward) => {
  return new Promise((resolve, reject) => {
    connectionPool.getConnection((connectionError, connection) => {
      if (connectionError) {
        reject(connectionError);
        return;
      }

      const queries =
        [
          {
            sql: `UPDATE virus_platform_user
            SET activeness = IF(DATE(update_time) < CURDATE() - INTERVAL 1 DAY, 1, activeness + 1),
                update_time = NOW()
            WHERE user_id = ?
            AND DATE(update_time) != CURDATE()`,
            params: [liker_id],
          },
          {
            sql: `INSERT INTO user_achievement (user_id, achievement_id, create_time, value, last_update_time, level, previous, next)
                  SELECT vp.user_id, 1, NOW(),
                      activeness, 
                      NOW(), 
                      lm.level, lm.required, lm.next
                  FROM virus_platform_user vp
                      LEFT JOIN level_map lm
                      ON lm.required <= vp.activeness
                  WHERE vp.user_id = ? AND lm.ach_code = 1
                  ORDER BY lm.required DESC
                  LIMIT 1
                  ON DUPLICATE KEY UPDATE value = GREATEST(value, VALUES(value)), last_update_time = Now()`,
            params: [liker_id],
          },
          {
            sql: `UPDATE comments SET likes = likes + 1 WHERE cid = ?`,
            params: [comment_id],
          },
          {
            sql: `UPDATE virus_platform_user SET user_total_likes_count = user_total_likes_count + 1 WHERE user_id = ?`,
            params: [liker_id],
          },
          {
            sql: `UPDATE virus_platform_user SET user_total_liked_count = user_total_liked_count + 1 WHERE user_id = (SELECT user_id FROM comments WHERE cid = ?)`,
            params: [comment_id],
          },
          {
            sql: `UPDATE virus_platform_user SET user_most_liked_count = 
            CASE WHEN (SELECT likes FROM comments WHERE cid = ?) > user_most_liked_count
                  THEN (SELECT likes FROM comments WHERE cid = ?)
                  ELSE user_most_liked_count
            END
            WHERE user_id = (SELECT user_id FROM comments WHERE cid = ?)`,
            params: [comment_id, comment_id, comment_id],
          },
          {
            sql: `INSERT INTO comment_likes (liker_id, comment_id) select ?, ? FROM DUAL`,
            params: [liker_id, comment_id],
          },
          {
            tag: 'UP_ACC',
            sql: `INSERT INTO accounting (from_id, to_id, amount, type, note) SELECT 0, ?, ?, 0, "like a comment" FROM DUAL
                          WHERE EXISTS (SELECT 1 FROM virus_platform_user AS liker
                                          WHERE liker.user_id = ? AND liker.daily_paid_likes > 0)`,
            params: [liker_id, reward, liker_id],
          },
          {
            tag: 'UP_ACC2',
            sql: `INSERT INTO accounting (from_id, to_id, amount, type, note) SELECT 0, (SELECT user_id FROM comments WHERE cid = ?), ?, 0, "comment liked" FROM DUAL
                          WHERE EXISTS (SELECT 1 FROM virus_platform_user AS liker
                                          WHERE liker.user_id = ? AND liker.daily_paid_likes > 0)`,
            params: [comment_id, reward, liker_id],
          },
          {
            // Note: Need two layers of select to avoid error.
            tag: 'ADD_VIR',
            sql: `UPDATE virus_platform_user
                          SET virus = virus + ?
                          WHERE user_id = (SELECT user_id FROM comments WHERE cid = ?)
                              AND EXISTS (SELECT 1 FROM (SELECT user_id AS uid FROM virus_platform_user
                                          WHERE user_id = ? AND daily_paid_likes > 0) as X)`,
            params: [reward, comment_id, liker_id],
          },
          {
            tag: 'ADD_VIR2',
            sql: `UPDATE virus_platform_user
                          SET virus = virus + ?, daily_paid_likes = daily_paid_likes - 1
                          WHERE user_id = ?
                              AND daily_paid_likes > 0`,
            params: [reward, liker_id],
          },
          {
            tag: 'ADD_ACH',
            sql: `INSERT INTO user_achievement (user_id, achievement_id, create_time, value, last_update_time, level, previous, next)
                  SELECT vp.user_id, 5, NOW(),
                      user_total_liked_count, 
                      NOW(), 
                      lm.level, lm.required, lm.next
                  FROM virus_platform_user vp
                      LEFT JOIN level_map lm
                      ON lm.required <= vp.user_total_liked_count
                  WHERE vp.user_id = (SELECT user_id FROM comments WHERE cid = ?) AND lm.ach_code = 5
                  ORDER BY lm.required DESC
                  LIMIT 1
                  ON DUPLICATE KEY UPDATE value = VALUES(value), last_update_time = Now()`,
            params: [comment_id],
          },
          {
            tag: 'ADD_ACH_2',
            sql: `INSERT INTO user_achievement (user_id, achievement_id, create_time, value, last_update_time, level, previous, next)
                  SELECT vp.user_id, 9, NOW(),
                      user_most_liked_count, 
                      NOW(), 
                      lm.level, lm.required, lm.next
                  FROM virus_platform_user vp
                      LEFT JOIN level_map lm
                      ON lm.required <= vp.user_most_liked_count
                  WHERE vp.user_id = (SELECT user_id FROM comments WHERE cid = ?) AND lm.ach_code = 9
                  ORDER BY lm.required DESC
                  LIMIT 1
                  ON DUPLICATE KEY UPDATE value = VALUES(value), last_update_time = Now()`,
            params: [comment_id],
          },
        ];

      const executeQuery = async (query) => {
        return new Promise((resolve, reject) => {
          connection.query(query.sql, query.params, (error, result) => {
            if (error) {
              return reject(error);
            }
            resolve(result);
          });
        });
      };

      const executeQueriesWithTransaction = async (queries) => {
        try {
          await new Promise((resolve, reject) => {
            connection.beginTransaction((err) => {
              if (err) {
                return reject(err);
              }
              resolve();
            });
          });

          const results = [];
          for (const query of queries) {
            if (reward !== 0 || (query.tag !== 'ADD_VIR' && query.tag !== 'ADD_VIR2' && query.tag !== 'UP_ACC' && query.tag !== 'UP_ACC2')) {
              const result = await executeQuery(query);
              results.push(result);
            }
          }

          await new Promise((resolve, reject) => {
            connection.commit((err) => {
              if (err) {
                return reject(err);
              }
              resolve();
            });
          });

          resolve({ results });
        } catch (error) {
          await new Promise((resolve, reject) => {
            connection.rollback(() => {
              resolve();
            });
          });
          reject(error);
        } finally {
          connection.release();
        }
      };

      executeQueriesWithTransaction(queries)
        .then((result) => resolve(result))
        .catch((error) => reject(error));
    });
  });
};

const addUserLike = async (liker_id, post_id, reward) => {
  return new Promise((resolve, reject) => {
    connectionPool.getConnection((connectionError, connection) => {
      if (connectionError) {
        reject(connectionError);
        return;
      }

      const queries = [
        {
          tag: 'UP_VAL',
          sql: `UPDATE virus_platform_user
          SET activeness = IF(DATE(update_time) < CURDATE() - INTERVAL 1 DAY, 1, activeness + 1),
              update_time = NOW()
          WHERE user_id = ?
          AND DATE(update_time) != CURDATE()`,
          params: [liker_id],
        },
        {
          tag: 'ADD_ACH',
          sql: `INSERT INTO user_achievement (user_id, achievement_id, create_time, value, last_update_time, level, previous, next)
                SELECT vp.user_id, 1, NOW(),
                    activeness, 
                    NOW(), 
                    lm.level, lm.required, lm.next
                FROM virus_platform_user vp
                    LEFT JOIN level_map lm
                    ON lm.required <= vp.activeness
                WHERE vp.user_id = ? AND lm.ach_code = 1
                ORDER BY lm.required DESC
                LIMIT 1
                ON DUPLICATE KEY UPDATE value = GREATEST(value, VALUES(value)), last_update_time = Now()`,
          params: [liker_id],
        },
        {
          tag: 'ADD_LK',
          sql: `UPDATE posts SET likes = likes + 1 WHERE pid = ?`,
          params: [post_id],
        },
        {
          tag: 'ADD_LK_CNT1',
          sql: `UPDATE virus_platform_user SET user_total_likes_count = user_total_likes_count + 1 WHERE user_id = ?`,
          params: [liker_id],
        },
        {
          tag: 'ADD_LK_CNT2',
          sql: `UPDATE virus_platform_user SET user_total_liked_count = user_total_liked_count + 1 WHERE user_id = (SELECT author_uid FROM posts WHERE pid = ?)`,
          params: [post_id],
        },
        {
          tag: 'ADD_LK_CNT3',
          sql: `UPDATE virus_platform_user SET user_most_liked_count = 
            CASE WHEN (SELECT likes FROM posts WHERE pid = ?) > user_most_liked_count
                  THEN (SELECT likes FROM posts WHERE pid = ?)
                  ELSE user_most_liked_count
            END
          WHERE user_id = (SELECT author_uid FROM posts WHERE pid = ?)`,
          params: [post_id, post_id, post_id],
        },
        {
          tag: 'UP_ACC',
          sql: `INSERT INTO accounting (from_id, to_id, amount, type, note) SELECT 0, ?, ?, 0, "like a post" FROM DUAL
                        WHERE EXISTS (SELECT 1 FROM virus_platform_user AS liker
                                        WHERE liker.user_id = ? AND liker.daily_paid_likes > 0)`,
          params: [liker_id, reward, liker_id],
        },
        {
          tag: 'UP_ACC2',
          sql: `INSERT INTO accounting (from_id, to_id, amount, type, note) SELECT 0, (SELECT owner_uid FROM posts WHERE pid = ?), ?, 0, "post liked" FROM DUAL
                        WHERE EXISTS (SELECT 1 FROM virus_platform_user AS liker
                                        WHERE liker.user_id = ? AND liker.daily_paid_likes > 0)`,
          params: [post_id, reward, liker_id],
        },
        {
          // Note: Need two layers of select to avoid error.
          tag: 'ADD_VIR',
          sql: `UPDATE virus_platform_user
                        SET virus = virus + ?
                        WHERE user_id = (SELECT owner_uid FROM posts WHERE pid = ?)
                            AND EXISTS (SELECT 1 FROM (SELECT user_id AS uid FROM virus_platform_user
                                        WHERE user_id = ? AND daily_paid_likes > 0) as X)`,
          params: [reward, post_id, liker_id],
        },
        {
          tag: 'ADD_VIR2',
          sql: `UPDATE virus_platform_user
                        SET virus = virus + ?, daily_paid_likes = daily_paid_likes - 1
                        WHERE user_id = ?
                            AND daily_paid_likes > 0`,
          params: [reward, liker_id],
        },
        {
          tag: 'INS_LK',
          sql: `INSERT INTO likes (liker_id, post_id) select ?, ? FROM DUAL`,
          params: [liker_id, post_id],
        },
        {
          tag: 'ADD_ACH_2',
          sql: `INSERT INTO user_achievement (user_id, achievement_id, create_time, value, last_update_time, level, previous, next)
                  SELECT vp.user_id, 5, NOW(),
                      user_total_liked_count, 
                      NOW(), 
                      lm.level, lm.required, lm.next
                  FROM virus_platform_user vp
                      LEFT JOIN level_map lm
                      ON lm.required <= vp.user_total_liked_count
                  WHERE vp.user_id = (SELECT owner_uid FROM posts WHERE pid = ?)
                      AND lm.ach_code = 5
                  ORDER BY lm.required DESC
                  LIMIT 1
                  ON DUPLICATE KEY UPDATE value = VALUES(value), last_update_time = Now()`,
          params: [post_id],
        },
        {
          tag: 'ADD_ACH_3',
          sql: `INSERT INTO user_achievement (user_id, achievement_id, create_time, value, last_update_time, level, previous, next)
                  SELECT vp.user_id, 9, NOW(),
                      user_most_liked_count, 
                      NOW(), 
                      lm.level, lm.required, lm.next
                  FROM virus_platform_user vp
                      LEFT JOIN level_map lm
                      ON lm.required <= vp.user_most_liked_count
                  WHERE vp.user_id = (SELECT owner_uid FROM posts WHERE pid = ?)
                      AND lm.ach_code = 9
                  ORDER BY lm.required DESC
                  LIMIT 1
                  ON DUPLICATE KEY UPDATE value = VALUES(value), last_update_time = Now()`,
          params: [post_id],
        },
      ];

      const executeQuery = async (query) => {
        return new Promise((resolve, reject) => {
          connection.query(query.sql, query.params, (error, result) => {
            if (error) {
              return reject(error);
            }
            if (query.tag === 'ADD_VIR' && result.affectedRows === 0) {
              reward = 0;
            }
            resolve(result);
          });
        });
      };

      const executeQueriesWithTransaction = async (queries) => {
        try {
          await new Promise((resolve, reject) => {
            connection.beginTransaction((err) => {
              if (err) {
                return reject(err);
              }
              connection.query('SET autocommit=0', (err) => {
                if (err) {
                  return reject(err);
                }
                resolve();
              });
            });
          });

          const results = [];
          for (const query of queries) {
            if (reward !== 0 || (query.tag !== 'ADD_VIR' && query.tag !== 'ADD_VIR2' && query.tag !== 'UP_ACC' && query.tag !== 'UP_ACC2')) {
              const result = await executeQuery(query);
              results.push(result);
            }
          }

          await new Promise((resolve, reject) => {
            connection.commit((err) => {
              if (err) {
                return reject(err);
              }
              resolve();
            });
          });

          resolve({ results: results, reward: reward });
        } catch (error) {
          await new Promise((resolve, reject) => {
            connection.rollback(() => {
              resolve();
            });
          });
          reject(error);
        } finally {
          connection.release();
        }
      };

      executeQueriesWithTransaction(queries)
        .then((result) => resolve(result))
        .catch((error) => reject(error));
    });
  });
};

const selectUserBids = (post_id) => {
  return new Promise((resolve, reject) => {
    connectionPool.getConnection((connectionError, connection) => {
      if (connectionError) {
        reject(connectionError);
        return;
      }
      const query = `SELECT * FROM bids as b 
                            JOIN virus_platform_user as u on b.user_id = u.user_id 
                            WHERE b.post_id = ? and b.is_bid = 1 
                            ORDER BY b.price DESC`;

      const params = [post_id];

      connection.query(query, params, (error, result) => {
        if (error) {
          console.error('SQL error: ', error);
          reject(error); // 寫入資料庫有問題時回傳錯誤
        } else {
          const jsonResponse = JSON.stringify(result);
          resolve(jsonResponse);
        }
        connection.release();
      });
    });
  });
};

const addUserBid = (user_id, post_id, price, is_bid) => {
  return new Promise((resolve, reject) => {
    connectionPool.getConnection((connectionError, connection) => {
      if (connectionError) {
        reject(connectionError);
        return;
      }
      const queries = [
        {
          sql: `UPDATE virus_platform_user
                        SET virus = virus + COALESCE((SELECT price FROM bids WHERE user_id = ?
                                                        AND post_id = ?
                                                        AND is_bid = True), 0)
                        WHERE user_id = ?`,
          params: [user_id, post_id, user_id],
          need_change: false,
        },
        {
          sql: `INSERT INTO accounting (from_id, to_id, amount, type, note)
                SELECT ?, ?, price, 2, "bid refund"
                FROM (
                    SELECT price
                    FROM bids
                    WHERE user_id = ? AND post_id = ? AND is_bid = TRUE
                ) AS bid_price
                WHERE bid_price.price > 0`,
          params: [post_id, user_id, user_id, post_id],
          need_change: false,
        },
        {
          sql: `DELETE FROM bids WHERE user_id = ? AND post_id = ? AND is_bid = True`,
          params: [user_id, post_id],
          need_change: false,
        },
        {
          sql: `INSERT INTO bids (user_id, post_id, is_bid, price) SELECT ?, ?, ?, ?
                        WHERE ? <= (SELECT virus FROM virus_platform_user WHERE user_id = ?) or ? = False
                        ON DUPLICATE KEY UPDATE price = ?, create_time = DEFAULT`,
          params: [
            user_id,
            post_id,
            is_bid,
            price,
            price,
            user_id,
            is_bid,
            price,
          ],
          need_change: true,
        },
        {
          sql: `INSERT INTO accounting (from_id, to_id, amount, type, note) SELECT ?, ?, ?, 1, "new bid" FROM DUAL WHERE ? = true and ? > 0`,
          params: [user_id, post_id, price, is_bid, price],
          need_change: false,
        },
        {
          sql: `UPDATE virus_platform_user
                        SET virus = virus - ? WHERE user_id = ? AND ? = True`,
          params: [price, user_id, is_bid],
          need_change: false,
        },
        {
          sql: `UPDATE posts p
                        SET
                        p.bid_user_id = (
                            SELECT user_id
                            FROM bids
                            WHERE post_id = p.pid AND is_bid = true
                            ORDER BY price DESC
                            LIMIT 1
                        ),
                        p.bid_price = (
                            SELECT MAX(price)
                            FROM bids
                            WHERE post_id = p.pid AND is_bid = true
                        ),
                        p.ask_price = (
                            SELECT price
                            FROM bids
                            WHERE post_id = p.pid AND is_bid = false
                        )
                        WHERE p.pid = ?`,
          params: [post_id],
          need_change: false,
        },
      ];

      const executeQuery = async (query) => {
        return new Promise((resolve, reject) => {
          connection.query(query.sql, query.params, (error, result) => {
            if (error) {
              return reject(error);
            }
            const affectedRows = result.affectedRows;
            if (affectedRows === 0 && query.need_change) {
              return reject('transfer failed');
            }
            resolve(result);
          });
        });
      };

      const executeQueriesWithTransaction = async (queries) => {
        try {
          await new Promise((resolve, reject) => {
            connection.beginTransaction((err) => {
              if (err) {
                return reject(err);
              }
              resolve();
            });
          });

          for (const query of queries) {
            try {
              await executeQuery(query);
            } catch (error) {
              return resolve({ successful: false, reason: 1 });
            }
          }

          await new Promise((resolve, reject) => {
            connection.commit((err) => {
              if (err) {
                return reject(err);
              }
              resolve();
            });
          });

          resolve({ successful: true, reason: 0 });
        } catch (error) {
          await new Promise((resolve, reject) => {
            connection.rollback(() => {
              resolve();
            });
          });
          reject(error);
        } finally {
          connection.release();
        }
      };

      executeQueriesWithTransaction(queries)
        .then((result) => resolve(result))
        .catch((error) => reject(error));
    });
  });
};

const transfer_post = (trader_id, post_id, user_id, for_sell, price) => {
  return new Promise((resolve, reject) => {
    connectionPool.getConnection((connectionError, connection) => {
      if (connectionError) {
        reject(connectionError);
        return;
      }
      const seller_id = for_sell ? trader_id : user_id;
      const buyer_id = for_sell ? user_id : trader_id;
      const queries = [
        {
          sql: `DELETE FROM bids
                        WHERE user_id = ?
                        AND post_id = ?
                        AND (? <= (SELECT virus FROM virus_platform_user WHERE user_id = ?) OR ? = True)
                        AND EXISTS (
                          SELECT 1
                          FROM posts
                          WHERE pid = ?
                            AND is_bid = ?
                            AND price = ?
                        )`,
          params: [
            user_id,
            post_id,
            price,
            trader_id,
            for_sell,
            post_id,
            for_sell,
            price,
          ],
          need_change: true,
        },
        {
          sql: `INSERT INTO accounting
                    (from_id, to_id, amount, type, note)
                    SELECT ?, ?, ?, 1, "Taker buy"
                        FROM DUAL WHERE ? = false and ? > 0`,
          params: [buyer_id, post_id, price, for_sell, price],
          need_change: false,
        },
        {
          sql: `UPDATE virus_platform_user SET virus = virus - ? WHERE user_id = ? and ? = False`,
          params: [price, buyer_id, for_sell],
          need_change: false,
        },
        {
          sql: `UPDATE virus_platform_user SET virus = virus + ? WHERE user_id = ?`,
          params: [price, seller_id],
          need_change: true,
        },
        {
          sql: `INSERT INTO accounting
                    (from_id, to_id, amount, type, note)
                    SELECT ?, ?, ?, 2, "Sales settled"
                        FROM DUAL WHERE ? > 0`,
          params: [post_id, seller_id, price, price],
          need_change: true,
        },
        {
          sql: `UPDATE posts p
                  LEFT JOIN (
                      SELECT post_id, price, user_id
                      FROM bids
                      WHERE post_id = ? AND is_bid = true
                      ORDER BY price DESC
                      LIMIT 1
                  ) b ON p.pid = b.post_id
                  SET p.bid_price = b.price, p.bid_user_id = b.user_id, p.owner_uid = ? where p.pid = ?`,
          params: [post_id, buyer_id, post_id],
          need_change: true,
        },
        {
          sql: `DELETE FROM bids
                  WHERE post_id = ? AND is_bid = false`,
          params: [post_id],
          need_change: false,
        },
        {
          sql: `UPDATE posts SET ask_price = 0
                  WHERE pid = ?`,
          params: [post_id],
          need_change: false,
        },
      ];

      const parallelQueries = [
        {
          sql: `UPDATE virus_platform_user SET user_buy_post_count = user_buy_post_count + 1 WHERE user_id = ?`,
          params: [buyer_id],
        },
        {
          sql: `UPDATE virus_platform_user SET user_sell_post_count = user_sell_post_count + 1 WHERE user_id = ?`,
          params: [seller_id],
        },
        {
          sql: `INSERT INTO accounting (from_id, to_id, amount, type, note) SELECT ?, ?, ?, 1, "purchase a post" FROM DUAL WHERE ? = false`,
          params: [buyer_id, post_id, price, for_sell],
        },
        {
          sql: `INSERT INTO accounting (from_id, to_id, amount, type, note) VALUES (?, ?, ?, 2, "post sold")`,
          params: [post_id, seller_id, price],
        },
        {
          sql: `INSERT INTO user_achievement (user_id, achievement_id, create_time, value, last_update_time, level, previous, next)
                  SELECT vp.user_id, 7, NOW(),
                      user_buy_post_count,
                      NOW(),
                      lm.level, lm.required, lm.next
                  FROM virus_platform_user vp
                      LEFT JOIN level_map lm
                      ON lm.required <= vp.user_buy_post_count
                  WHERE vp.user_id = ?
                  ON DUPLICATE KEY UPDATE value = VALUES(value), last_update_time = Now()`,
          params: [buyer_id],
        },
        {
          sql: `INSERT INTO user_achievement (user_id, achievement_id, create_time, value, last_update_time, level, previous, next)
                  SELECT vp.user_id, 8, NOW(),
                      user_sell_post_count,
                      NOW(),
                      lm.level, lm.required, lm.next
                  FROM virus_platform_user vp
                      LEFT JOIN level_map lm
                      ON lm.required <= vp.user_sell_post_count
                  WHERE vp.user_id = ?
                  ON DUPLICATE KEY UPDATE value = VALUES(value), last_update_time = Now()`,
          params: [seller_id],
        },
      ];

      const executeQuery = async (query) => {
        return new Promise((resolve, reject) => {
          connection.query(query.sql, query.params, (error, result) => {
            if (error) {
              return reject(error);
            }
            const affectedRows = result.affectedRows;
            if (affectedRows === 0 && query.need_change) {
              return reject('transfer failed');
            }
            resolve(result);
          });
        });
      };

      const executeQueriesWithTransaction = async (queries) => {
        try {
          await new Promise((resolve, reject) => {
            connection.beginTransaction((err) => {
              if (err) {
                return reject(err);
              }
              resolve();
            });
          });

          // Execute sequential queries
          for (const query of queries) {
            try {
              await executeQuery(query);
            } catch (error) {
              // Handle error here
              return resolve({ successful: false, reason: 1 });
            }
          }

          // Execute parallel queries
          const parallelPromises = parallelQueries.map((query) =>
            executeQuery(query),
          );
          const parallelResults = await Promise.all(parallelPromises);

          if (parallelResults[0].affectedRows === 0) {
            // Rollback the transaction
            await new Promise((resolve, reject) => {
              connection.rollback(() => {
                reject(new Error('The first query did not affect any rows. Transaction rolled back.'));
              });
            });
          }

          await new Promise((resolve, reject) => {
            connection.commit((err) => {
              if (err) {
                return reject(err);
              }
              resolve();
            });
          });

          resolve({ successful: true, reason: 0 });
        } catch (error) {
          await new Promise((resolve, reject) => {
            connection.rollback(() => {
              resolve();
            });
          });
          reject(error);
        } finally {
          connection.release();
        }
      };

      executeQueriesWithTransaction(queries)
        .then((result) => resolve(result))
        .catch((error) => reject(error));
    });
  });
};

const extend_post = (donor_id, post_id, price) => {
  return new Promise((resolve, reject) => {
    connectionPool.getConnection((connectionError, connection) => {
      if (connectionError) {
        reject(connectionError);
        return;
      }
      const parallelQueries = [
        {
          sql: `INSERT INTO accounting (from_id, to_id, amount, type, note)
                    SELECT ?, ?, ?, 1, 'extend post lifetime'
                    FROM virus_platform_user
                    WHERE user_id = ? AND virus >= ?`,
          params: [donor_id, post_id, price, donor_id, price],
          need_change: true,
        },
        {
          sql: `UPDATE virus_platform_user AS vpu
                    JOIN (SELECT virus FROM virus_platform_user WHERE user_id = ?) AS subquery
                    ON subquery.virus >= ?
                    SET vpu.virus = vpu.virus - ?
                    WHERE vpu.user_id = ?`,
          params: [donor_id, price, price, donor_id],
          need_change: true,
        },
        {
          sql: `UPDATE posts
                    SET expire_date = DATE_ADD(expire_date, INTERVAL 8 * ? HOUR)
                    WHERE pid = ?`,
          params: [price, post_id],
          need_change: true,
        },
        {
          sql: `INSERT INTO accounting
                    (from_id, to_id, amount, type, note) SELECT ?, ?, ?, 1, "extend post lifetime"`,
          params: [donor_id, post_id, price],
          need_change: true,
        },
        {
          sql: `INSERT INTO accounting 
                    (from_id, to_id, amount, type, note) SELECT ?, ?, ?, 2, "exchange for lifetime with system"`,
          params: [post_id, 0, price],
          need_change: true,
        },
      ];
      const executeQuery = async (query) => {
        return new Promise((resolve, reject) => {
          connection.query(query.sql, query.params, (error, result) => {
            if (error) {
              return reject(error);
            }
            // Check affected rows and resolve or reject accordingly
            if (result.affectedRows === 0 && query.need_change) {
              return reject(new Error('Transfer failed: No rows affected.'));
            }
            resolve(result);
          });
        });
      };

      const executeQueriesWithTransaction = async () => {
        const result = {
          successful: false,
          reason: null,
        };

        try {
          // Start the transaction
          await new Promise((resolve, reject) => {
            connection.beginTransaction((err) => {
              if (err) return reject(err);
              resolve();
            });
          });

          // Execute all queries in parallel
          const parallelPromises = parallelQueries.map((query) => executeQuery(query));
          await Promise.all(parallelPromises);

          // Commit the transaction if all queries are successful
          await new Promise((resolve, reject) => {
            connection.commit((err) => {
              if (err) return reject(err);
              resolve();
            });
          });

          // Mark the result as successful
          result.successful = true;
        } catch (error) {
          // Rollback the transaction on error
          await new Promise((resolve) => {
            connection.rollback(() => {
              resolve();
            });
          });
          result.reason = error.message; // Capture the error message
        } finally {
          connection.release();
        }

        return result; // Return the result object
      };

      executeQueriesWithTransaction()
        .then((result) => resolve(result))
        .catch((error) => reject(error));
    });
  });
};

const addUserComment = (user_id, post_id, context) => {
  return new Promise((resolve, reject) => {
    connectionPool.getConnection((connectionError, connection) => {
      if (connectionError) {
        reject(connectionError);
        return;
      }
      const queries = [
        {
          sql: `INSERT INTO comments (cid, user_id, post_id, context, create_time, likes)  VALUES (DEFAULT, ?, ?, ? , Now(), DEFAULT)`,
          params: [user_id, post_id, context],
        },
        {
          sql: `UPDATE posts SET comments = comments + 1 WHERE pid = ?`,
          params: [post_id],
        },
      ];
      const executeQuery = async (query) => {
        return new Promise((resolve, reject) => {
          connection.query(query.sql, query.params, (error, result) => {
            if (error) {
              return reject(error);
            }
            resolve(result);
          });
        });
      };

      const executeQueriesWithTransaction = async (queries) => {
        try {
          await new Promise((resolve, reject) => {
            connection.beginTransaction((err) => {
              if (err) {
                return reject(err);
              }
              resolve();
            });
          });

          const results = [];
          for (const query of queries) {
            const result = await executeQuery(query);
            results.push(result);
          }

          await new Promise((resolve, reject) => {
            connection.commit((err) => {
              if (err) {
                return reject(err);
              }
              resolve();
            });
          });

          resolve({ results });
        } catch (error) {
          await new Promise((resolve, reject) => {
            connection.rollback(() => {
              resolve();
            });
          });
          reject(error);
        } finally {
          connection.release();
        }
      };

      executeQueriesWithTransaction(queries)
        .then((result) => resolve(result))
        .catch((error) => reject(error));
    });
  });
};

const selectUserComments = (user_id, post_id) => {
  return new Promise((resolve, reject) => {
    connectionPool.getConnection((connectionError, connection) => {
      if (connectionError) {
        reject(connectionError);
      } else {
        const query = `SELECT c.cid, c.context, u.user_id, u.user_name, u.user_image_path, c.likes,
        CASE WHEN (SELECT COUNT(1) FROM comment_likes cl WHERE cl.liker_id = ? AND cl.comment_id = c.cid) <> 0 THEN true
        ELSE false END AS isLiked
        FROM comments as c JOIN virus_platform_user as u on c.user_id = u.user_id WHERE c.post_id = ?`;
        connection.query(query, [user_id, post_id], (error, result) => {
          if (error) {
            console.error('SQL error: ', error);
            reject(error);
          } else {
            const jsonResponse = JSON.stringify(result);
            resolve(jsonResponse);
          }
          connection.release();
        });
      }
    });
  });
};
