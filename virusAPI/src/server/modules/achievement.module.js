import mysql from 'mysql';
import config from '../../config/config';

const connectionPool = mysql.createPool({
  connectionLimit: 10,
  host: config.mysqlHost,
  port: config.mysqlPort,
  user: config.mysqlUserName,
  password: config.mysqlPass,
  database: config.mysqlDatabase,
  charset: 'utf8mb4',
});

export const claim = async (req, res, next) => {
  try {
    const result = await achievementClaim(req.body);
    res.send(result);
  } catch (error) {
    next(error);
  }
};

export const getAchievement = async (req, res, next) => {
  try {
    const result = await selectAchievement(req.body);
    res.send(result);
  } catch (error) {
    next(error);
  }
};

const achievementClaim = (insertValues) => {
  return new Promise((resolve, reject) => {
    connectionPool.getConnection((connectionError, connection) => {
      if (connectionError) {
        reject(connectionError); // Handle connection error
        return;
      }

      connection.beginTransaction((transactionError) => {
        if (transactionError) {
          reject(transactionError);
          connection.release();
          return;
        }

        // List of queries to be executed
        const queries = [
          {
            sql: `
              SELECT SUM(lm.reward) AS total_reward
              FROM user_achievement ua
              JOIN level_map lm
                ON ua.achievement_id = lm.ach_code AND ua.level - 1 = lm.level
              WHERE ua.user_id = ? AND ua.achievement_id = ? AND ua.claim = false
            `,
            params: [
              insertValues.userId,
              insertValues.aId,
            ],
            processResult: (result) => {
              if (result && result.length > 0) {
                return result[0].total_reward || 0;
              }
              return 0;
            },
          },
          {
            sql: `
              UPDATE user_achievement
              SET claim = true
              WHERE user_id = ? AND achievement_id = ?`,
            params: [
              insertValues.userId,
              insertValues.aId,
            ],
            processResult: () => null, // No need to process result for this query
          },
          {
            sql: `
              INSERT INTO accounting (from_id, to_id, amount, type, note) 
              SELECT 0, ?, ?, 0, "Achievement ?" FROM DUAL`,
            params: [insertValues.userId, null, insertValues.aId], // Placeholder for total_reward
            processResult: () => null,
          },
          {
            sql: `
              UPDATE virus_platform_user
              SET virus = virus + ?
              WHERE user_id = ?`,
            params: [null, insertValues.userId], // Placeholder for total_reward
            processResult: () => null,
          },
        ];

        let totalReward = 0;

        // Function to execute all queries sequentially
        const executeQueries = (index) => {
          if (index >= queries.length) {
            // Commit transaction if all queries succeed
            return connection.commit((commitError) => {
              if (commitError) {
                return connection.rollback(() => {
                  reject(commitError);        
                  connection.release();
                });
              }

              resolve({
                status: 'success',
                totalReward, // Return the totalReward
              });
              connection.release();
            });
          }

          const { sql, params, processResult } = queries[index];

          connection.query(sql, params, (error, result) => {
            if (error) {
              return connection.rollback(() => {
                console.error('SQL error: ', error);
                reject(error);
                connection.release();
              });
            }

            // Process the result of the query
            if (processResult) {
              if (index === 0) {
                totalReward = processResult(result); // Capture total_reward from the first query
                // Update the next queries' params with the total_reward
                queries[2].params[2] = totalReward; // Update the "amount" in accounting query
                queries[3].params[0] = totalReward; // Update the "virus" in virus_platform_user query
              }
            }

            // Move to the next query
            executeQueries(index + 1);
          });
        };

        // Start executing the queries from the first one
        executeQueries(0);
      });
    });
  });
};

const selectAchievement = (insertValues) => {
  return new Promise((resolve, reject) => {
    connectionPool.getConnection((connectionError, connection) => {
      // 資料庫連線
      const query = `
            SELECT
                ua.achievement_id AS a_id,
                MAX(ua.value) AS value,
                SUM(lm2.reward * (NOT ua.claim)) AS claimable_amount,
                MAX(ua.level) AS level,
                MAX(ua.next) As next,
                MAX(ua.previous) As required,
                MAX(lm.reward) As reward,
                ac.code_desc AS name 
            FROM user_achievement ua
            LEFT JOIN level_map lm
                ON ua.achievement_id = lm.ach_code
               AND ua.level = lm.level
            LEFT JOIN level_map lm2
                ON ua.achievement_id = lm2.ach_code
               AND ua.level - 1 = lm2.level
            LEFT JOIN app_code ac
                ON ua.achievement_id = ac.code_code
               AND ac.code_type = 'achievement'
            WHERE ua.user_id in (0, ?)
            GROUP BY ua.achievement_id
            ORDER BY claimable_amount DESC`

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
