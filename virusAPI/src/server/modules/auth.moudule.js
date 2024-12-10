import bcrypt from 'bcrypt';
import mysql from 'mysql';
import config from '../../config/config';
import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';
import subscribeModule from '../modules/subscribe.module';

const connectionPool = mysql.createPool({
  connectionLimit: 10,
  host: config.mysqlHost,
  user: config.mysqlUserName,
  password: config.mysqlPass,
  database: config.mysqlDatabase,
});

/* User  POST 新增 */
export const userAdd = (req, res) => {
  const { firstName, lastName, email, password, picturePath } = req.body;

  const insertValues = {
    user_name: firstName + ' ' + lastName,
    user_email: email,
    user_password: bcrypt.hashSync(password, 10), // 密碼加密
    user_image_path: req.file.path.substring(
      req.file.path.lastIndexOf('/') + 1,
    ), // 將圖片的路徑存入資料庫
    // user_image_path: req.file.path // 將圖片的路徑存入資料庫
  };

  try {
    //public/assets/00028-3097149379.png
    // console.log("req.file.path");
    // console.log(req.file.path);
    createUser(insertValues)
      .then((result) => {
        res.send(result); // 成功回傳result結果
      })
      .catch((err) => {
        res.status(500).json({ error: err.message });
      });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createUser = (insertValues) => {
  return new Promise((resolve, reject) => {
    connectionPool.getConnection((connectionError, connection) => {
      // 資料庫連線
      if (connectionError) {
        reject(new Error(`Connection Error: ${connectionError}`));
        return;
      }

      connection.query(
        'INSERT INTO virus_platform_user SET ?',
        insertValues,
        (error, result) => {
          // User資料表寫入一筆資料
          connection.release(); // 無論成功或失敗都應釋放連線

          if (error) {
            reject(new Error(`Query Error: ${error}`));
            return;
          }

          if (result.affectedRows === 1) {
            resolve(
              `{"status":"ok", "msg":"註冊成功！","user_id":"${result.insertId}"}`,
            ); // 寫入成功回傳寫入id
          } else {
            reject(new Error('Unknown error occurred'));
          }
        },
      );
    });
  });
};

/* LOGGING IN */
export const userLogin = (req, res, next) => {
  // 取得帳密
  const insertValues = req.body;
  selectUserLogin(insertValues)
    .then((result) => {
      res.send(result); // 成功回傳result結果
    })
    .catch((error) => {
      next(error);
    }); // 失敗回傳錯誤訊息
};

const selectUserLogin = (insertValues) => {
  return new Promise((resolve, reject) => {
    connectionPool.getConnection((connectionError, connection) => {
      // 資料庫連線
      if (connectionError) {
        reject(connectionError); // 若連線有問題回傳錯誤
      } else {
        connection.query(
          'SELECT * FROM virus_platform_user WHERE user_email = ?',
          [insertValues.email],
          (error, result) => {
            if (error) {
              console.error('SQL error: ', error);
              reject(error); // Reject if there's an SQL error
            } else if (Object.keys(result).length === 0) {
              resolve(`{"status":"error", "msg":"mail not found"}`);
            } else {
              const dbHashPassword = result[0].user_password;
              const userPassword = insertValues.password;
              const picturePath = result[0].user_image_path;

              bcrypt.compare(userPassword, dbHashPassword).then((res) => {
                if (res) {
                  // First query successful, now execute the second query
                  subscribeModule
                    .getFriends(result[0].user_id, result[0].user_id)
                    .then((friends) => {
                      const token = jwt.sign(
                        { id: result[0].user_id },
                        process.env.JWT_SECRET,
                      );
                      const user = {
                        picturePath: picturePath,
                        _id: result[0].user_id,
                        user_name: result[0].user_name,
                        user_id: result[0].user_id,
                        friends: friends, // Add the friends data to the user object
                      };
                      const response = {
                        token: token,
                        status: 'ok',
                        user: user,
                        msg: '登入成功',
                      };

                      const jsonResponse = JSON.stringify(response);
                      resolve(jsonResponse);
                    })
                    .catch((friendsError) => {
                      console.error('Error getting friends: ', friendsError);
                      reject(friendsError);
                    });
                } else {
                  resolve(`{"status":"error", "msg":"password error"}`);
                }
              });
            }
            connection.release();
          },
        );
      }
    });
  });
};
