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
  `SELECT s.subscribed_id as _id, u.user_name as name, u.user_image_path as picturePath FROM subscribes as s JOIN virus_platform_user as u ON u.user_id = s.subscribed_id where s.subscriber_id = ?`, 
  [userId]
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
  const query = is_delete === 'true' ? 
    `DELETE FROM subscribes WHERE subscriber_id = ? AND subscribed_id = ?` : 
    `INSERT INTO subscribes VALUES (DEFAULT, ?, ?, DEFAULT)`;

  return executeQuery(query, [user_id, friend_id]);
};

const deleteSubscribe = deleteValues => executeQuery(
  `DELETE FROM subscribes WHERE subscriber_id = ? AND subscribed_id = ?`, 
  deleteValues
);

export default {
  getFriends,
  isSubscribed,
  countBySubscribedId,
  createSubscribe,
  deleteSubscribe
};
