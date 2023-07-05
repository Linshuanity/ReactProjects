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
// const createUser = (insertValues) => {
//   return new Promise((resolve, reject) => {
//     connectionPool.getConnection((connectionError, connection) => { // 資料庫連線
//       if (connectionError) {
//         reject(connectionError); // 若連線有問題回傳錯誤
//       } else {
//         connection.query('INSERT INTO virus_platform_user SET ?', insertValues, (error, result) => { // User資料表寫入一筆資料
//           if (error) {
//             console.error('SQL error: ', error);
//             reject(error); // 寫入資料庫有問題時回傳錯誤
//           } else if (result.affectedRows === 1) {
//             resolve(`{"status":"ok", "msg":"註冊成功！","user_id":"${result.insertId}"}`); // 寫入成功回傳寫入id
//           }
//           connection.release();
//         });
//       }
//     });
//   });
// };



/* User  POST 新增 */
export const userAdd = (req, res) => {  
  // console.log(req.file);

  const {
    firstName,
    lastName,
    email,
    password,
    picturePath,
    friends,
    location,
    occupation,
  } = req.body;
  // console.log('userAdd password:'+ password);
  // console.log('userAdd req.body.password:'+ req.body.password);
  // console.log('userAdd email:'+ email);

  const insertValues = {
    user_name: firstName+' '+lastName,
    user_email: email,
    user_password: bcrypt.hashSync(password, 10), // 密碼加密
    user_image_path: req.file.path // 將圖片的路徑存入資料庫
  };
  
  try {
    createUser(insertValues).then((result) => {
      res.status(200).json(result); // 成功回傳result結果
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
        reject(connectionError); // 若連線有問題回傳錯誤
      } else {
        connection.query('INSERT INTO virus_platform_user SET ?', insertValues, (error, result) => { // User資料表寫入一筆資料
          if (error) {
            console.error('SQL error: ', error);
            reject(error); // 寫入資料庫有問題時回傳錯誤
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
              resolve(`{"status":"false", "msg":"信箱尚未註冊！"}`);
              // reject(new APPError.LoginError1()); // 信箱尚未註冊
            } else {              
              const dbHashPassword = result[0].user_password; // 資料庫加密後的密碼
              const userPassword = insertValues.password; // 使用者登入輸入的密碼
              console.log('dbHashPassword:'+dbHashPassword);
              console.log('userPassword:'+userPassword);
              bcrypt.compare(userPassword, dbHashPassword).then((res) => { // 使用bcrypt做解密驗證
                if (res) {
                  const token = jwt.sign({ id: result[0].user_id }, process.env.JWT_SECRET);
                  resolve(`{"token":"`+ token + `","status":"ok", "user": {},"msg":"登入成功","user_name":"`+ result[0].user_name + `","user_id":"`+ result[0].user_id + `"}`);
                } else {
                  resolve(`{"status":"false", "msg":"帳號或密碼有誤！"}`);
                  // reject(new APPError.LoginError2()); // 登入失敗 輸入的密碼有誤
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

/* insert Users */
export const insertUsers = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      picturePath,
      friends,
      location,
      occupation,
    } = req.body;

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);

    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// /* REGISTER USER */
// export const register = async (req, res) => {
//   try {
//     const {
//       firstName,
//       lastName,
//       email,
//       password,
//       picturePath,
//       friends,
//       location,
//       occupation,
//     } = req.body;

//     const salt = await bcrypt.genSalt();
//     const passwordHash = await bcrypt.hash(password, salt);

//     const newUser = new User({
//       firstName,
//       lastName,
//       email,
//       password: passwordHash,
//       picturePath,
//       friends,
//       location,
//       occupation,
//       viewedProfile: Math.floor(Math.random() * 10000),
//       impressions: Math.floor(Math.random() * 10000),
//     });
//     const savedUser = await newUser.save();
//     res.status(201).json(savedUser);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// /* LOGGING IN */
// export const login = async (req, res) => {
//   try {
    
//     const { email, password } = req.body;
//     const user = await User.findOne({ email: email });
//     console.log('email:'+email);
//     console.log('password:'+password);
//     if (!user) return res.status(400).json({ msg: "User does not exist. " });

//     console.log('user:'+user);
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) return res.status(400).json({ msg: "Invalid credentials. " });

//     const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
//     delete user.password;
//     res.status(200).json({ token, user });
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({ error: err.message });
//   }
// };
