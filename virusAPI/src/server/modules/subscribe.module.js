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

/* User  POST 新增 */
const createSubscribe = (insertValues) => {
  return new Promise((resolve, reject) => {
    connectionPool.getConnection((connectionError, connection) => { // 資料庫連線
      if (connectionError) {
        reject(connectionError); // 若連線有問題回傳錯誤
      } else {
        connection.query('INSERT INTO subscribes SET ?', insertValues, (error, result) => { // User資料表寫入一筆資料
          if (error) {
            console.error('SQL error: ', error);
            reject(error); // 寫入資料庫有問題時回傳錯誤
          } else if (result.affectedRows === 1) {
            const subscribed = true;
            const responseData = {
              status: 'ok',
              msg: 'subscribed!',
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
  isSubscribed,
  countBySubscribedId,
  createSubscribe,
  deleteSubscribe
};
