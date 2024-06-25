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
      SELECT ua.achievement_id AS a_id, ua.max_v AS value, lm.*, ac.code_desc AS name 
        FROM (
          SELECT achievement_id, max(value) AS max_v 
            FROM user_achievement where user_id in (0, ?) GROUP BY achievement_id) AS ua 
        LEFT JOIN level_map lm ON ua.achievement_id = lm.ach_code AND max_v < lm.next AND max_v >= lm.required
        LEFT JOIN app_code AS ac ON ua.achievement_id = ac.code_code and ac.code_type = "achievement"`
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
