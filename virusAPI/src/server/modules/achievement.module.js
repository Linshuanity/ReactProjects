import mysql from 'mysql';
import config from '../../config/config';

const connectionPool = mysql.createPool({
  connectionLimit: 10,
  host: config.mysqlHost,
  user: config.mysqlUserName,
  password: config.mysqlPass,
  database: config.mysqlDatabase,
});

export const getAchievement = async (req, res, next) => {
  try {
    const result = await selectAchievement(req.body);
    res.send(result);
  } catch (error) {
    next(error);
  }
};

const selectAchievement = (insertValues) => {
  return new Promise((resolve, reject) => {
    connectionPool.getConnection((connectionError, connection) => {
      // 資料庫連線
      const query = `
      SELECT ua.achievement_id AS a_id, ac.code_desc AS name, MAX(ua.value) AS value
        FROM user_achievement AS ua
        LEFT JOIN (
            SELECT * FROM app_code WHERE code_type = 'achievement'
        ) AS ac
        ON ua.achievement_id = ac.code_code
        WHERE user_id = ?
        GROUP BY ua.achievement_id`;
      let queryParams = [
        insertValues.userId,
      ];
      if (connectionError) {
        reject(connectionError); // 若連線有問題回傳錯誤
      } else {
        connection.query(query, queryParams, (error, result) => {
          if (error) {
            console.error('SQL error: ', error);
            reject(error); // 寫入資料庫有問題時回傳錯誤
          } else if (Object.keys(result).length === 0) {
            resolve(`{"status":"error", "msg":"achievement not found"}`);
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
