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

const selectUser = () => {
  return new Promise((resolve, reject) => {
    connectionPool.getConnection((connectionError, connection) => {
      if (connectionError) {
        reject(connectionError);
        return; // Make sure to return after rejecting to avoid continuing the execution
      }

      const query = 'SELECT user_name AS result FROM virus_platform_user';

      connection.query(query, (queryError, result) => {
        connection.release(); // Release the connection regardless of the query result

        if (queryError) {
          console.error('SQL error:', queryError);
          reject(queryError);
        } else {
          resolve(result);
        }
      });
    });
  });
};


/*  User GET 取得  */
const selectUserById = (userId) => {
  return new Promise((resolve, reject) => {
    console.log('selectUserById userId:', userId);

    connectionPool.getConnection((connectionError, connection) => {
      if (connectionError) {
        console.log('connectionError');
        reject(connectionError);
        return; // Early return after rejecting to avoid continuing execution
      }

      console.log('query');
      console.log('connection.query userId:', userId);

      const query = 'SELECT * FROM virus_platform_user WHERE user_id = ?';

      connection.query(query, [userId], (queryError, result) => {
        console.log('inside query');
        connection.release();

        if (queryError) {
          console.error('SQL error:', queryError);
          reject(queryError);
        } else if (result.length === 0) {
          resolve({
            status: 'error',
            msg: 'user not found'
          });
        } else {
          resolve({
            picturePath: result[0].user_image_path,
            _id: result[0].user_id,
            subscriber: result[0].subscriber,
            user_name: result[0].user_name,
            holding: result[0].virus
          });
        }
      });
    });
  });
};

/* User  POST 新增 */
const createUser = (insertValues) => {
  return new Promise((resolve, reject) => {
    connectionPool.getConnection((connectionError, connection) => {
      if (connectionError) {
        reject(connectionError);
        return; // Early return after rejecting to avoid continuing execution
      }

      const insertQuery = 'INSERT INTO virus_platform_user SET ?';

      connection.query(insertQuery, insertValues, (queryError, result) => {
        connection.release();

        if (queryError) {
          console.error('SQL error:', queryError);
          reject(queryError);
        } else if (result.affectedRows === 1) {
          resolve({
            status: 'ok',
            msg: '註冊成功！',
            user_id: result.insertId
          });
        } else {
          // Consider rejecting with an error if the expected number of affected rows is not met
          reject(new Error('Unexpected result from the database query.'));
        }
      });
    });
  });
};

/* User PUT 修改 */
const modifyUser = (insertValues, userId) => {
  return new Promise((resolve, reject) => {
    connectionPool.getConnection((connectionError, connection) => {
      if (connectionError) {
        reject(connectionError);
        return; // Early return after rejecting to avoid continuing execution
      }

      const updateQuery = 'UPDATE virus_platform_user SET ? WHERE user_id = ?';

      connection.query(updateQuery, [insertValues, userId], (queryError, result) => {
        connection.release();

        if (queryError) {
          console.error('SQL error:', queryError);
          reject(queryError);
        } else if (result.affectedRows === 0) {
          resolve({
            status: 'fail',
            msg: '請確認修改Id！'
          });
        } else if (result.message && result.message.match('Changed: 1')) {
          resolve({
            status: 'ok',
            msg: '資料修改成功'
          });
        } else {
          resolve({
            status: 'ok',
            msg: '資料無異動'
          });
        }
      });
    });
  });
};

/* User  DELETE 刪除 */
const deleteUser = (userId) => {
  return new Promise((resolve, reject) => {
    connectionPool.getConnection((connectionError, connection) => {
      if (connectionError) {
        reject(connectionError);
        return; // Early return after rejecting to avoid continuing execution
      }

      const deleteQuery = 'DELETE FROM virus_platform_user WHERE user_id = ?';

      connection.query(deleteQuery, userId, (queryError, result) => {
        connection.release();

        if (queryError) {
          console.error('SQL error:', queryError);
          reject(queryError);
        } else if (result.affectedRows === 1) {
          resolve({
            status: 'ok',
            msg: '刪除成功！'
          });
        } else {
          resolve({
            status: 'fail',
            msg: '刪除失敗！'
          });
        }
      });
    });
  });
};

/*  User GET (Login)登入取得資訊  */
const selectUserLogin = (insertValues) => {
  return new Promise((resolve, reject) => {
    connectionPool.getConnection((connectionError, connection) => {
      if (connectionError) {
        reject(connectionError);
        return; // Early return after rejecting to avoid continuing execution
      }

      const selectQuery = 'SELECT * FROM virus_platform_user WHERE user_email = ?';

      connection.query(selectQuery, insertValues.user_email, (queryError, result) => {
        if (queryError) {
          console.error('SQL error:', queryError);
          reject(queryError);
        } else if (result.length === 0) {
          resolve({
            status: 'false',
            msg: '信箱尚未註冊！'
          });
        } else {
          const dbHashPassword = result[0].user_password;
          const userPassword = insertValues.user_password;

          console.log('dbHashPassword:', dbHashPassword);
          console.log('userPassword:', userPassword);

          bcrypt.compare(userPassword, dbHashPassword).then((res) => {
            if (res) {
              resolve({
                status: 'ok',
                msg: '登入成功',
                user_name: result[0].user_name,
                user_id: result[0].user_id
              });
            } else {
              resolve({
                status: 'false',
                msg: '帳號或密碼有誤！'
              });
            }
          });
        }
        connection.release();
      });
    });
  });
};

const addRemoveFriend = (id, insertValues, userId) => {
  return new Promise((resolve, reject) => {
    connectionPool.getConnection((connectionError, connection) => {
      if (connectionError) {
        reject(connectionError);
        return;
      }

      const updateQuery = 'UPDATE virus_platform_user SET ? WHERE user_id = ?';

      connection.query(updateQuery, [insertValues, userId], (queryError, result) => {
        connection.release();

        if (queryError) {
          console.error('SQL error:', queryError);
          reject(queryError);
        } else if (result.affectedRows === 0) {
          resolve({
            status: 'fail',
            msg: '請確認修改Id！'
          });
        } else if (result.message && result.message.match('Changed: 1')) {
          resolve({
            status: 'ok',
            msg: '資料修改成功'
          });
        } else {
          resolve({
            status: 'ok',
            msg: '資料無異動'
          });
        }
      });
    });
  });
};

export default {
  selectUser,
  selectUserById,
  createUser,
  modifyUser,
  deleteUser,
  selectUserLogin
};
