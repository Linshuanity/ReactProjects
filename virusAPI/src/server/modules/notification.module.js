import mysql from 'mysql';
import config from '../../config/config';

const connectionPool = mysql.createPool({
  connectionLimit: 10,
  host: config.mysqlHost,
  user: config.mysqlUserName,
  password: config.mysqlPass,
  database: config.mysqlDatabase
});


export const insertNotification = async (req, res, next) => {
  try {
    const { user_id, type, source_id, content } = req.body;
    const result = await createNotification(user_id, type, source_id, content);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

const createNotification = (user_id, type, source_id, content) => {
  return new Promise((resolve, reject) => {
    connectionPool.getConnection((connectionError, connection) => {
      if (connectionError) {
        reject(connectionError);
      } else {
        const query = `
          INSERT INTO notifications 
          (user_id, type, source_id, is_read, create_time, content)
          VALUES (?, ?, ?, 0, NOW(), ?)
        `;
        connection.query(query, [user_id, type, source_id, content], (error, result) => {
          if (error) {
            console.error('SQL error: ', error);
            reject(error);
          } else {
            resolve({ id: result.insertId, message: 'Notification inserted successfully' });
          }
          connection.release();
        });
      }
    });
  });
};


export const userReadNotification = async (req, res, next) => {
  try {
    console.log("req.body.user_id: " + req.body.user_id);
    const insertValues = req.body;
    console.log(insertValues);

    const user_id = req.body.user_id;
    const nid = req.body.nid;
    const result = await updateUserReadNotification(user_id, nid);
    res.send(result);
  } catch (error) {
    next(error);
  }
};

const updateUserReadNotification = (user_id, nid) => {
  return new Promise((resolve, reject) => {
    connectionPool.getConnection((connectionError, connection) => {
      if (connectionError) {
        reject(connectionError);
      } else {
        console.log("updateUserReadNotification user_id:" + user_id +  "nid:" + nid);
        const query = `
            UPDATE notifications SET is_read = 1 WHERE nid = ? AND user_id = ?
        `;
        connection.query(query, [nid, user_id], (error, result) => {
          if (error) {
            console.error('SQL error: ', error);
            reject(error);
          } else {
            resolve(result);
          }
          connection.release();
        });
      }
    });
  });
};

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
        console.log("selectUserNotifications user_id:" + user_id);
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
