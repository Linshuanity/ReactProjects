import mysql from 'mysql';
import config from '../../config/config';

const connectionPool = mysql.createPool({
  connectionLimit: 10,
  host: config.mysqlHost,
  user: config.mysqlUserName,
  password: config.mysqlPass,
  database: config.mysqlDatabase
});

const executeQuery = (sql, params) => {
  return new Promise((resolve, reject) => {
    connectionPool.getConnection((err, connection) => {
      if (err) {
        reject(err);
        return;
      }

      connection.query(sql, params, (error, result) => {
        connection.release();
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  });
};

const getFriends = userId => executeQuery(
  `SELECT s.subscribed_id as _id, u.user_name as name, u.user_image_path as picturePath FROM subscribes as s JOIN virus_platform_user as u ON u.user_id = s.subscribed_id where s.subscriber_id = ? limit 5`, 
  [userId]
);

const getSearch = substring => executeQuery(
  `SELECT user_id as id, user_name as name FROM virus_platform_user WHERE user_name LIKE ?`, 
  [`%${substring}%`]
);

const isSubscribed = (suberId, subedId) => executeQuery(
  `SELECT * FROM subscribes WHERE subscriber_id = ? AND subscribed_id = ?`, 
  [suberId, subedId]
).then(result => result.length > 0 ? { status: 'ok', msg: 'subscribed', subscribed: true } : { status: 'ok', msg: 'not subscribed', subscribed: false });

const countBySubscribedId = subscribedId => executeQuery(
  `SELECT COUNT(subscriber_id) as result FROM subscribes WHERE subscribed_id = ?`, 
  [subscribedId]
);

const createSubscribe = insertValues => {
  const { user_id, friend_id, is_delete } = insertValues;

  const update_query = is_delete === 'true'
    ? `DELETE FROM subscribes WHERE subscriber_id = ? AND subscribed_id = ?`
    : `INSERT INTO subscribes VALUES (DEFAULT, ?, ?, DEFAULT) ON DUPLICATE KEY UPDATE subscriber_id = subscriber_id`;

  const update_user_query = is_delete === 'true'
    ? `UPDATE virus_platform_user SET subscriber = subscriber - 1 WHERE user_id = ?`
    : `UPDATE virus_platform_user SET subscriber = subscriber + 1 WHERE user_id = ?`;

  const select_query = `SELECT user_id as _id, user_name as name, user_image_path as picturePath from virus_platform_user where user_id = ?`;

  // Execute update_query first
  return executeQuery(update_query, [user_id, friend_id])
    .then(updateResult => {
      // Check if update_query affected any rows before executing update_user_query
      if (updateResult && updateResult.affectedRows > 0) {
        // Execute update_user_query and select_query concurrently
        return Promise.all([
          executeQuery(update_user_query, [friend_id]),
          executeQuery(select_query, [friend_id]),
        ]).then(([updateUserResult, selectResult]) => {
          // Handle the results if needed
          console.log('Update Result:', updateResult);
          console.log('Update User Result:', updateUserResult);

          // Return the select result
          return selectResult;
        });
      } else {
        // No changes were made by update_query, you may choose to return something else
        console.log('No changes were made by update_query');
        return null; // Or some other indication of no changes
      }
    })
    .catch(error => {
      console.error('Error executing queries:', error);
      throw error; // Propagate the error to the caller
    });
};

const deleteSubscribe = deleteValues => executeQuery(
  `DELETE FROM subscribes WHERE subscriber_id = ? AND subscribed_id = ?`, 
  deleteValues
);

export default {
  getFriends,
  getSearch,
  isSubscribed,
  countBySubscribedId,
  createSubscribe,
  deleteSubscribe
};
