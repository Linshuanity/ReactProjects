import mysql from 'mysql';
import bcrypt from 'bcrypt';
import config from '../../config/config';
import APPError from '../helper/AppError';

const connectionPool = mysql.createPool({
  connectionLimit: 10,
  host: config.mysqlHost,
  user: config.mysqlUserName,
  password: config.mysqlPass,
  database: config.mysqlDatabase
});

const getFriends = (userId) => {
  return new Promise((resolve, reject) => {
    connectionPool.getConnection((connectionError, connection) => { // 資料庫連線
      if (connectionError) {
        reject(connectionError); // 若連線有問題回傳錯誤
      } else {
          const getSubscribeList = `SELECT s.subscribed_id as _id, u.user_name as name, u.user_image_path as picturePath FROM subscribes as s JOIN virus_platform_user as u ON u.user_id = s.subscribed_id where s.subscriber_id = ?`;
          connection.query(getSubscribeList, [userId], (error, result) => {
            if (error) {
              console.error('Error retrieving friends:', error);
              reject(error);
            }
            resolve(result); // 寫入成功回傳寫入id
          });
        }
    });
  });
};

const isSubscribed = (suberId, subedId) => {
  return new Promise((resolve, reject) => {
    connectionPool.getConnection((connectionError, connection) => { // 資料庫連線
      if (connectionError) {
        reject(connectionError); // 若連線有問題回傳錯誤
      } else {
        connection.query( // User撈取所有欄位的值組
          `select * from subscribes where subscriber_id = ? and subscribed_id = ?`, [suberId, subedId], (error, result) => {
            if (error) {
              console.error('SQL error: ', error);
              reject(error); // 寫入資料庫有問題時回傳錯誤
            } else if (result.length > 0) {
              const subscribed = true;
              const responseData = {
                status: 'ok',
                msg: 'subscribed',
                subscribed: subscribed
              };
              resolve(responseData);
            } else {
              const subscribed = false;
              const responseData = {
                status: 'ok',
                msg: 'not subscribed',
                subscribed: subscribed
              };
              resolve(responseData);
            }

            connection.release();
          }
        );
      }
    });
  });
};

/*  User GET 取得  */
const countBySubscribedId = (subscribedId) => {
  return new Promise((resolve, reject) => {
    connectionPool.getConnection((connectionError, connection) => { // 資料庫連線
      if (connectionError) {
        reject(connectionError); // 若連線有問題回傳錯誤
      } else {
        console.log('subscribedId'+subscribedId);
        connection.query( // User撈取所有欄位的值組
          `select count(subscriber_id) as result from subscribes where subscribed_id = ?`, subscribedId
          , (error, result) => {
            if (error) {
              console.error('SQL error: ', error);
              reject(error); // 寫入資料庫有問題時回傳錯誤
            } else {
              resolve(result); // 撈取成功回傳 JSON 資料
            }
            connection.release();
          }
        );
      }
    });
  });
};

const addRemoveSubscribe = async (req, res, isFriend) => {
  const userId = req.params.id; // User ID
  const friendId = req.params.friendId; // Friend ID
  return new Promise((resolve, reject) => {
    connectionPool.getConnection((connectionError, connection) => { // 資料庫連線
      if (connectionError) {
        reject(connectionError); // 若連線有問題回傳錯誤
      } else { // User資料表修改指定id一筆資料
        const query = isFriend ? `DELETE from subscribes WHERE subscriber_id = ${userId} and subscribed_id = ${friendId}` : `INSERT INTO subscribes VALUES (DEFAULT, ${userId}, ${friendId}, DEFAULT)`;
        connection.query(query, (error, result) => {
          if (error) {
            console.error('SQL error: ', error);// 寫入資料庫有問題時回傳錯誤
            reject(error);
          }
          connection.release();
        });
      }
    });
  });
};

/* User POST 新增 */
const createSubscribe = (insertValues) => {
  const userId = insertValues.user_id;
  const friendId = insertValues.friend_id;
  const isDelete = insertValues.is_delete === 'true';
  return new Promise((resolve, reject) => {
    connectionPool.getConnection((connectionError, connection) => { // 資料庫連線
      if (connectionError) {
        reject(connectionError); // 若連線有問題回傳錯誤
        return;
      }

      const query = isDelete 
        ? `DELETE from subscribes WHERE subscriber_id = ? and subscribed_id = ?`
        : `INSERT INTO subscribes VALUES (DEFAULT, ?, ?, DEFAULT)`;
      
      connection.query(query, [userId, friendId], (error, result) => { // User資料表寫入一筆資料
        if (error) {
          console.error('SQL error: ', error);
          connection.release();
          reject(error); // 寫入資料庫有問題時回傳錯誤
          return;
        }

        if (result.affectedRows === 1) {
          const getSubscribeList = `SELECT s.subscribed_id as _id, u.user_name as name, u.user_image_path as picturePath FROM subscribes as s JOIN virus_platform_user as u ON u.user_id = s.subscribed_id where s.subscriber_id = ?`;
          connection.query(getSubscribeList, [userId], (error, friends) => {
            connection.release();
            if (error) {
              console.error('Error retrieving friends:', error);
              reject(error);
              return;
            }
            resolve(friends); // 寫入成功回傳好友列表
          });
        } else {
          connection.release();
          reject(new Error('No rows affected'));
        }
      });
    });
  });
};

/* User  POST 新增 */
const deleteSubscribe = (deleteValues) => {
  return new Promise((resolve, reject) => {
    connectionPool.getConnection((connectionError, connection) => { // 資料庫連線
      if (connectionError) {
        reject(connectionError); // 若連線有問題回傳錯誤
      } else {
        connection.query('DELETE FROM subscribes WHERE subscriber_id = ? and subscribed_id = ?', deleteValues, (error, result) => { // User資料表寫入一筆資料
          if (error) {
            console.error('SQL error: ', error);
            reject(error); // 寫入資料庫有問題時回傳錯誤
          } else if (result.affectedRows === 1) {
            const subscribed = false;
            const responseData = {
              status: 'ok',
              msg: 'unsubscribed!',
              subscribed: subscribed
            };
            resolve(responseData); // 寫入成功回傳寫入id
          }
          connection.release();
        });
      }
    });
  });
};

export default {
  getFriends,
  isSubscribed,
  countBySubscribedId,
  createSubscribe,
  deleteSubscribe
};
