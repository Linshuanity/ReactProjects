import mysql from 'mysql';
import bcrypt from 'bcrypt';
import config from '../../config/config';
import APPError from '../helper/AppError';

const connectionPool = mysql.createPool({
  connectionLimit: 10,
  host: config.mysqlHost,
  port: config.mysqlPort,
  user: config.mysqlUserName,
  password: config.mysqlPass,
  database: config.mysqlDatabase,
  charset: 'utf8mb4',
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
const selectUserById = (userId, loginId) => {
  return new Promise((resolve, reject) => {
    console.log('selectUserById userId:', userId);

    connectionPool.getConnection((connectionError, connection) => {
      if (connectionError) {
        console.log('connectionError');
        reject(connectionError);
        return; // Early return after rejecting to avoid continuing execution
      }

      const query = 
       `SELECT
            vpu.*,
            EXISTS (
                SELECT 1
                FROM subscribes s
                WHERE s.subscriber_id = ?
                  AND s.subscribed_id = vpu.user_id
            ) AS is_friend
        FROM
            virus_platform_user vpu
        WHERE
            vpu.user_id = ?`

      connection.query(query, [loginId, userId], (queryError, result) => {
        connection.release();

        if (queryError) {
          console.error('SQL error:', queryError);
          reject(queryError);
        } else if (result.length === 0) {
          resolve({
            status: 'error',
            msg: 'user not found',
          });
        } else {
          resolve({
            picturePath: result[0].user_image_path,
            _id: result[0].user_id,
            subscriber: result[0].subscriber,
            user_name: result[0].user_name,
            holding: result[0].virus,
            totalLiked: result[0].user_total_liked_count,
            maxLike: result[0].user_most_liked_count,
            isFriend: result[0].is_friend,
            postCount: result[0].user_post_count,
            description: result[0].user_description,
            netWorth: result[0].net_worth,
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
            user_id: result.insertId,
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

      connection.query(
        updateQuery,
        [insertValues, userId],
        (queryError, result) => {
          connection.release();

          if (queryError) {
            console.error('SQL error:', queryError);
            reject(queryError);
          } else if (result.affectedRows === 0) {
            resolve({
              status: 'fail',
              msg: '請確認修改Id！',
            });
          } else if (result.message && result.message.match('Changed: 1')) {
            resolve({
              status: 'ok',
              msg: '資料修改成功',
            });
          } else {
            resolve({
              status: 'ok',
              msg: '資料無異動',
            });
          }
        },
      );
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
            msg: '刪除成功！',
          });
        } else {
          resolve({
            status: 'fail',
            msg: '刪除失敗！',
          });
        }
      });
    });
  });
};

export const selectUserLogin = async (insertValues) => {
  let connection;

  try {
    // Obtain a connection from the pool
    connection = await new Promise((resolve, reject) => {
      connectionPool.getConnection((err, conn) => {
        if (err) {
          reject(new Error(`Connection Error: ${err.message}`));
        } else {
          resolve(conn);
        }
      });
    });

    // Perform the SELECT query
    const [result] = await new Promise((resolve, reject) => {
      const selectQuery = 'SELECT * FROM virus_platform_user WHERE user_email = ?';
      connection.query(selectQuery, [insertValues.user_email], (err, results) => {
        if (err) {
          reject(new Error(`Query Error: ${err.message}`));
        } else {
          resolve(results);
        }
      });
    });

    if (result.length === 0) {
      return {
        status: 'false',
        msg: '信箱尚未註冊！',
      };
    }

    const dbHashPassword = result[0].user_password;
    const userPassword = insertValues.user_password;

    console.log('dbHashPassword:', dbHashPassword);
    console.log('userPassword:', userPassword);

    // Compare passwords using bcrypt
    const isPasswordMatch = await bcrypt.compare(userPassword, dbHashPassword);

    if (isPasswordMatch) {
      return {
        status: 'ok',
        msg: '登入成功',
        user_name: result[0].user_name,
        user_id: result[0].user_id,
      };
    } else {
      return {
        status: 'false',
        msg: '帳號或密碼有誤！',
      };
    }

  } catch (error) {
    console.error('Error during database operation:', error);
    throw error; // Propagate the error to be handled by the caller

  } finally {
    // Ensure the connection is always released
    if (connection) {
      connection.release();
    }
  }
};

export const addRemoveFriend = async (id, insertValues, userId) => {
  let connection;

  try {
    // Obtain a connection from the pool
    connection = await new Promise((resolve, reject) => {
      connectionPool.getConnection((err, conn) => {
        if (err) {
          reject(new Error(`Connection Error: ${err.message}`));
        } else {
          resolve(conn);
        }
      });
    });

    // Perform the UPDATE query
    const [result] = await new Promise((resolve, reject) => {
      const updateQuery = 'UPDATE virus_platform_user SET ? WHERE user_id = ?';
      connection.query(updateQuery, [insertValues, userId], (err, results) => {
        if (err) {
          reject(new Error(`Query Error: ${err.message}`));
        } else {
          resolve(results);
        }
      });
    });

    if (result.affectedRows === 0) {
      return {
        status: 'fail',
        msg: '請確認修改Id！',
      };
    }

    if (result.changedRows > 0) {
      return {
        status: 'ok',
        msg: '資料修改成功',
      };
    }

    return {
      status: 'ok',
      msg: '資料無異動',
    };

  } catch (error) {
    console.error('Error during database operation:', error);
    throw error; // Propagate the error to be handled by the caller

  } finally {
    // Ensure the connection is always released
    if (connection) {
      connection.release();
    }
  }
};

export default {
  selectUser,
  selectUserById,
  createUser,
  modifyUser,
  deleteUser,
  selectUserLogin,
};
