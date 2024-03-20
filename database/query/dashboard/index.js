const getConnection = require("../../maria");

const getTotalExec = () => new Promise((resolve, reject) => {
    const sql = `
        SELECT COUNT(*) as cnt 
        FROM chat_history as a
        LEFT JOIN chat_scenario AS B ON A.scenario_id = B.id
        WHERE B.level = 0
    `

    getConnection((conn) => {
        conn.query(sql, (err, rows, fields) => {
            conn.release();
            if (err) {
                reject(err);
            } else {
                resolve(rows[0]);
            }
        });
    });
});
const getRangeExec = (startDate, endDate) => new Promise((resolve, reject) => {
    const sql = `SELECT COUNT(*) as cnt
                        FROM chat_history as A
                        LEFT JOIN chat_scenario AS B ON A.scenario_id = B.id
                        WHERE B.level = 0
                        AND DATE(created_at) BETWEEN STR_TO_DATE(?, '%Y-%m-%d') AND STR_TO_DATE(?, '%Y-%m-%d')`
    getConnection((conn) => {
        conn.query(sql,[startDate,endDate], (err, rows, fields) => {
            conn.release();
            if (err) {
                reject(err);
            } else {
                resolve(rows[0]);
            }
        });
    });
});

const getRangeExecGroupByLevel1 = (startDate, endDate) => new Promise((resolve, reject) => {
    const sql = `SELECT A.scenario_id as id, B.name , COUNT(A.scenario_id) as cnt
                        FROM chat_history as A
                        LEFT JOIN chat_scenario AS B
                        ON A.scenario_id  = B.id
                        WHERE DATE(created_at) BETWEEN STR_TO_DATE(?, '%Y-%m-%d') AND STR_TO_DATE(?, '%Y-%m-%d')
                        AND B.level = 1
                        group by A.scenario_id ;
                        `
    getConnection((conn) => {
        conn.query(sql,[startDate,endDate], (err, rows, fields) => {
            conn.release();
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
});
const getRangeExecRank = (startDate, endDate) => new Promise((resolve, reject) => {
    const sql = `SELECT id, name, cnt
                        FROM (
                                 SELECT A.scenario_id as id, B.name, COUNT(A.scenario_id) as cnt
                                 FROM chat_history as A
                                          LEFT JOIN chat_scenario AS B ON A.scenario_id = B.id
                                 WHERE DATE(created_at) BETWEEN STR_TO_DATE(?, '%Y-%m-%d') AND STR_TO_DATE(?, '%Y-%m-%d')
                                 AND B.LEVEL != 0
                                 GROUP BY A.scenario_id
                             ) AS subquery
                        ORDER BY cnt DESC;
                        `
    getConnection((conn) => {
        conn.query(sql,[startDate,endDate], (err, rows, fields) => {
            conn.release();
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
});

const getRangeTimezone = (startDate, endDate) => new Promise((resolve, reject) => {
    const sql = `
        SELECT
            hours.hour_slot AS hour,
            IFNULL(chat_counts.chat_count, 0) AS cnt
        FROM
            (
                SELECT '00' AS hour_slot UNION ALL
                SELECT '01' UNION ALL
                SELECT '02' UNION ALL
                SELECT '03' UNION ALL
                SELECT '04' UNION ALL
                SELECT '05' UNION ALL
                SELECT '06' UNION ALL
                SELECT '07' UNION ALL
                SELECT '08' UNION ALL
                SELECT '09' UNION ALL
                SELECT '10' UNION ALL
                SELECT '11' UNION ALL
                SELECT '12' UNION ALL
                SELECT '13' UNION ALL
                SELECT '14' UNION ALL
                SELECT '15' UNION ALL
                SELECT '16' UNION ALL
                SELECT '17' UNION ALL
                SELECT '18' UNION ALL
                SELECT '19' UNION ALL
                SELECT '20' UNION ALL
                SELECT '21' UNION ALL
                SELECT '22' UNION ALL
                SELECT '23'
            ) AS hours
        LEFT JOIN
            (
                SELECT
                    DATE_FORMAT(A.created_at, '%H') AS hour_slot,
                    COUNT(*) AS chat_count
                FROM
                    chat_history as A
                        LEFT JOIN chat_scenario AS B ON A.scenario_id = B.id
                WHERE DATE(A.created_at) BETWEEN STR_TO_DATE(?, '%Y-%m-%d') AND STR_TO_DATE(?, '%Y-%m-%d')
                  AND B.LEVEL != 0
                GROUP BY
                    DATE_FORMAT(A.created_at, '%H')
            ) AS chat_counts
        ON
            hours.hour_slot = chat_counts.hour_slot
        ORDER BY
            CAST(hours.hour_slot AS UNSIGNED);
    `
    getConnection((conn) => {
        conn.query(sql,[startDate,endDate], (err, rows, fields) => {
            conn.release();
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
});
module.exports = {getTotalExec, getRangeExec,getRangeExecGroupByLevel1,getRangeExecRank,getRangeTimezone};
