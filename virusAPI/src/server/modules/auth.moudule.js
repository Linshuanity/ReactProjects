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

/* User  POST 新增 */
export const userAdd = (req, res) => {
  const {
    firstName,
    lastName,
    email,
    password,
    picturePath,
  } = req.body;

  const insertValues = {
    user_name: firstName+' '+lastName,
    user_email: email,
    user_password: bcrypt.hashSync(password, 10), // 密碼加密
    user_image_path: req.file.path // 將圖片的路徑存入資料庫
  };
  
  try {
    createUser(insertValues).then((result) => {
      res.send(result); // 成功回傳result結果
    }).catch((err) => { 
      res.status(500).json({ error: err.message });
    }); 
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createUser = (insertValues) => {
  return new Promise((resolve, reject) => {
    connectionPool.getConnection((connectionError, connection) => { // 資料庫連線
      if (connectionError) {
        resolve(`{"status":"error", "msg":"`+connectionError+`"}`);
      } else {
        connection.query('INSERT INTO virus_platform_user SET ?', insertValues, (error, result) => { // User資料表寫入一筆資料
          if (error) {
            resolve(`{"status":"error", "msg":"email already exists"}`);
          } else if (result.affectedRows === 1) {
            resolve(`{"status":"ok", "msg":"註冊成功！","user_id":"${result.insertId}"}`); // 寫入成功回傳寫入id
          }
          connection.release();
        });
      }
    });
  });
};

/* LOGGING IN */
export const userLogin = (req, res, next) => {
  // 取得帳密
  const insertValues = req.body;
  selectUserLogin(insertValues).then((result) => {

    res.send(result); // 成功回傳result結果
  }).catch((error) => { next(error); }); // 失敗回傳錯誤訊息
};

const selectUserLogin = (insertValues) => {
  return new Promise((resolve, reject) => {
    connectionPool.getConnection((connectionError, connection) => { // 資料庫連線
      if (connectionError) {
        reject(connectionError); // 若連線有問題回傳錯誤
      } else {
        connection.query( // User撈取所有欄位的值組
          'SELECT * FROM virus_platform_user WHERE user_email = ?',
          [insertValues.email], (error, result) => {
            if (error) {
              console.error('SQL error: ', error);
              reject(error); // 寫入資料庫有問題時回傳錯誤
            } else if (Object.keys(result).length === 0) {
              resolve(`{"status":"error", "msg":"mail not found"}`);
            } else {              
              const dbHashPassword = result[0].user_password; // 資料庫加密後的密碼
              const userPassword = insertValues.password; // 使用者登入輸入的密碼
              const picturePath = result[0].user_image_path
              bcrypt.compare(userPassword, dbHashPassword).then((res) => { // 使用bcrypt做解密驗證
                if (res) {
                  const token = jwt.sign({ id: result[0].user_id }, process.env.JWT_SECRET);
                  resolve(`{"token":"`+ token + `","status":"ok", "user": {"picturePath":"`+ picturePath + `","_id":"`+ result[0].user_id + `"}, "msg":"登入成功","user_name":"`+ result[0].user_name + `","user_id":"`+ result[0].user_id + `"}`);
                } else {
                  resolve(`{"status":"error", "msg":"password error"}`);
                }
              });
            }
            connection.release();
          }
        );
      }
    });
  });
};