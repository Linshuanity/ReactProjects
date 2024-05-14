import mysql from 'mysql';
import config from '../../config/config';

const connectionPool = mysql.createPool({
  connectionLimit: 10,
  host: config.mysqlHost,
  user: config.mysqlUserName,
  password: config.mysqlPass,
  database: config.mysqlDatabase
});

export const userNotifications = async (req, res, next) => {
  try {
    console.log("req.body.user_id: " + req.body.user_id);
  const insertValues = req.body;
      console.log(insertValues);

    const user_id = req.body.user_id;
    const result = await selectUserNotifications(user_id);
    res.send(result);
  } catch (error) {
    next(error);
  }
};

const selectUserNotifications = (user_id) => {
  return new Promise((resolve, reject) => {
    connectionPool.getConnection((connectionError, connection) => {
      if (connectionError) {
        reject(connectionError);
      } else {
        const query = `
          SELECT nid, user_id, type, source_id, is_read, create_time, content
          FROM notifications
          WHERE user_id = ?
          ORDER BY create_time DESC
        `;

        connection.query(query, [user_id], (error, result) => {
          if (error) {
            console.error('SQL error: ', error);
            reject(error);
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
