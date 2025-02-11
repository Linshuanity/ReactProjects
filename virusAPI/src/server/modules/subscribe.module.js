import mysql from 'mysql';
import config from '../../config/config';

const connectionPool = mysql.createPool({
  connectionLimit: 10,
  host: config.mysqlHost,
  port: config.mysqlPort,
  user: config.mysqlUserName,
  password: config.mysqlPass,
  database: config.mysqlDatabase,
  charset: 'utf8mb4',
});

const executeQuery = (sql, params) => {
  return new Promise((resolve, reject) => {
    connectionPool.getConnection((err, connection) => {
      if (err) {
        reject(err);
        return;
      }

      try {
        connection.query(sql, params, (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        });
      } finally {
        connection.release();
      }
    });
  });
};

const getFriends = async (userId, loginId) => {
  const results = await executeQuery(
    `SELECT
        s.subscribed_id AS _id,
        u.user_name AS name,
        u.user_image_path AS picturePath,
        EXISTS (
            SELECT 1
            FROM subscribes
            WHERE subscriber_id = ?
              AND subscribed_id = s.subscribed_id
        ) AS is_friend
    FROM
        subscribes AS s
    JOIN
        virus_platform_user AS u
    ON
        u.user_id = s.subscribed_id
    WHERE
        s.subscriber_id = ? LIMIT 5`,
    [loginId, userId]
  );
  return results;
};

const getSearch = (substring) =>
  executeQuery(
    `SELECT user_id as id, user_name as name, user_image_path as image_path FROM virus_platform_user WHERE user_name LIKE ?`,
    [`%${substring}%`],
  );

const isSubscribed = (suberId, subedId) =>
  executeQuery(
    `SELECT * FROM subscribes WHERE subscriber_id = ? AND subscribed_id = ?`,
    [suberId, subedId],
  ).then((result) =>
    result.length > 0
      ? { status: 'ok', msg: 'subscribed', subscribed: true }
      : { status: 'ok', msg: 'not subscribed', subscribed: false },
  );

const countBySubscribedId = (subscribedId) =>
  executeQuery(
    `SELECT COUNT(subscriber_id) as result FROM subscribes WHERE subscribed_id = ?`,
    [subscribedId],
  );
const createSubscribe = (user_id, friend_id, is_delete) => {
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

        const queries =
          is_delete === 'true'
            ? [
                {
                  tag: 'DEL_SUB',
                  sql: `DELETE FROM subscribes WHERE subscriber_id = ? AND subscribed_id = ?`,
                  params: [user_id, friend_id],
                },
                {
                  tag: 'DEC_SUBS',
                  sql: `UPDATE virus_platform_user SET subscribed = subscribed - 1 WHERE user_id = ?`,
                  params: [user_id],
                },
                {
                  tag: 'DEC_SUBS_2',
                  sql: `UPDATE virus_platform_user SET subscriber = subscriber - 1 WHERE user_id = ?`,
                  params: [friend_id],
                },
              ]
            : [
                {
                  tag: 'INS_SUB',
                  sql: `INSERT INTO subscribes VALUES (DEFAULT, ?, ?, DEFAULT) ON DUPLICATE KEY UPDATE subscriber_id = subscriber_id`,
                  params: [user_id, friend_id],
                },
                {
                  tag: 'INC_SUBS',
                  sql: `UPDATE virus_platform_user SET subscribed = subscribed + 1 WHERE user_id = ?`,
                  params: [user_id],
                },
                {
                  tag: 'INC_SUBS_2',
                  sql: `UPDATE virus_platform_user SET subscriber = subscriber + 1 WHERE user_id = ?`,
                  params: [friend_id],
                },
                {
                  tag: 'ADD_ACH',
                  sql: `INSERT INTO user_achievement (user_id, achievement_id, create_time, value, last_update_time, level, previous, next)
                    SELECT vp.user_id, 2, NOW(),
                           vp.subscribed,
                           NOW(), 
                           lm.level, lm.required, lm.next
                    FROM virus_platform_user vp
                        LEFT JOIN level_map lm
                        ON lm.required <= vp.subscribed
                    WHERE vp.user_id = ? AND lm.ach_code = 2
                    ORDER BY lm.required DESC
                    LIMIT 1
                    ON DUPLICATE KEY UPDATE value = VALUES(value), last_update_time = Now()`, 
                  params: [user_id],
                },
                {
                  tag: 'ADD_ACH_2',
                  sql: `INSERT INTO user_achievement (user_id, achievement_id, create_time, value, last_update_time, level, previous, next)
                    SELECT vp.user_id, 3, NOW(),
                           vp.subscriber,
                           NOW(), 
                           lm.level, lm.required, lm.next
                    FROM virus_platform_user vp
                        LEFT JOIN level_map lm
                        ON lm.required <= vp.subscriber
                    WHERE vp.user_id = ? AND lm.ach_code = 3
                    ORDER BY lm.required DESC
                    LIMIT 1
                    ON DUPLICATE KEY UPDATE value = VALUES(value), last_update_time = Now()`, 
                  params: [friend_id],
                }
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
            // Check if any changes were made
            const affectedRows = results.reduce(
              (total, result) => total + result.affectedRows,
              0,
            );
            if (affectedRows === 0) {
              connection.rollback(() => {
                connection.release();
                resolve(null); // No changes made
              });
              return;
            }

            // Fetch the updated user data
            const selectQuery = `SELECT user_id as _id, user_name as name, user_image_path as picturePath from virus_platform_user where user_id = ?`;
            connection.query(
              selectQuery,
              [friend_id],
              (error, selectResult) => {
                if (error) {
                  connection.rollback(() => {
                    connection.release();
                    reject(error);
                  });
                  return;
                }

                connection.commit((err) => {
                  if (err) {
                    connection.rollback(() => {
                      connection.release();
                      reject(err);
                    });
                    return;
                  }
                  connection.release();
                  resolve(selectResult);
                });
              },
            );
          })
          .catch((error) => {
            connection.rollback(() => {
              connection.release();
              reject(error);
            });
          });
      });
    });
  });
};

const deleteSubscribe = (deleteValues) =>
  executeQuery(
    `DELETE FROM subscribes WHERE subscriber_id = ? AND subscribed_id = ?`,
    deleteValues,
  );

export default {
  getFriends,
  getSearch,
  isSubscribed,
  countBySubscribedId,
  createSubscribe,
  deleteSubscribe,
};
