const getConnection = require("../../maria");
const quarters = ['chat_history', 'chat_history_2024_q1'];
const getTotalExec = () => new Promise((resolve, reject) => {

    // 동적 쿼리 생성
    let sql = quarters.map(quarter => `
              (SELECT COUNT(*)
              FROM ${quarter} as A
              LEFT JOIN chat_scenario AS B ON A.scenario_id = B.id
              WHERE B.level = 0)
              `).join(' + ') + ' AS cnt;';
    // 전체 쿼리를 SELECT 문으로 감싸기
    sql = `SELECT ${sql}`;
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

const getBeforeExec = () => new Promise((resolve, reject) => {

    // 동적 쿼리 생성
    let sql = quarters.map(quarter => `
                (SELECT COUNT(*)
                FROM ${quarter} as A
                LEFT JOIN chat_scenario AS B ON A.scenario_id = B.id
                WHERE B.level = 0
                AND A.created_at < CURDATE())
                `).join(' + ') + ' AS cnt;';

    // 전체 쿼리를 SELECT 문으로 감싸기
    sql = `SELECT ${sql}`;

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

    // 동적 쿼리 생성
    const subqueries = quarters.map(quarter => `
      (SELECT COUNT(*)
       FROM ${quarter} as A
       LEFT JOIN chat_scenario AS B ON A.scenario_id = B.id
       WHERE B.level = 0
       AND DATE(A.created_at) BETWEEN STR_TO_DATE(?, '%Y-%m-%d') AND STR_TO_DATE(?, '%Y-%m-%d'))
    `);
    const sql = `SELECT (${subqueries.join(' + ')}) AS cnt;`;

    // 날짜 범위 파라미터 배열 생성
    const params = [];
    quarters.forEach(() => {
        params.push(startDate, endDate);
    });
    getConnection((conn) => {
        conn.query(sql,params, (err, rows, fields) => {
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
    // 동적 쿼리 생성
    const subqueries = quarters.map(quarter => `
      SELECT A.scenario_id as id, B.name, COUNT(A.scenario_id) as cnt
      FROM ${quarter} as A
      LEFT JOIN chat_scenario AS B ON A.scenario_id = B.id
      WHERE DATE(A.created_at) BETWEEN STR_TO_DATE(?, '%Y-%m-%d') AND STR_TO_DATE(?, '%Y-%m-%d')
      AND B.level = 1
      GROUP BY A.scenario_id, B.name
    `);
    // 날짜 범위 파라미터 배열 생성
    const params = [];
    quarters.forEach(() => {
        params.push(startDate, endDate);
    });

    const sql = subqueries.join(' UNION ALL ');
    getConnection((conn) => {
        conn.query(sql,params, (err, rows, fields) => {
            conn.release();
            if (err) {
                reject(err);
            } else {
                // 시나리오 ID별로 결과를 합산
                const resultMap = new Map();
                rows.forEach(row => {
                    const { id, name, cnt } = row;
                    if (resultMap.has(id)) {
                        const existing = resultMap.get(id);
                        resultMap.set(id, { id, name, cnt: existing.cnt + cnt });
                    } else {
                        resultMap.set(id, { id, name, cnt });
                    }
                });

                const result = Array.from(resultMap.values());
                resolve(result);
            }
        });
    });
});
const getRangeExecRank = (startDate, endDate) => new Promise((resolve, reject) => {
    // 동적 쿼리 생성
    const subqueries = quarters.map(quarter => `
      SELECT A.scenario_id as id, B.name, COUNT(A.scenario_id) as cnt
      FROM ${quarter} as A
      LEFT JOIN chat_scenario AS B ON A.scenario_id = B.id
      WHERE DATE(A.created_at) BETWEEN STR_TO_DATE(?, '%Y-%m-%d') AND STR_TO_DATE(?, '%Y-%m-%d')
      AND B.level != 0
      GROUP BY A.scenario_id, B.name
    `);

    const sql = `
      SELECT id, name, SUM(cnt) as cnt
      FROM (${subqueries.join(' UNION ALL ')}) AS subquery
      GROUP BY id, name
      ORDER BY cnt DESC;
    `;

    // 날짜 범위 파라미터 배열 생성
    const params = [];
    quarters.forEach(() => {
        params.push(startDate, endDate);
    });
    getConnection((conn) => {
        conn.query(sql,params, (err, rows, fields) => {
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
    const subQueries = quarters.map(table => `
        SELECT
            DATE_FORMAT(A.created_at, '%H') AS hour_slot,
            COUNT(*) AS chat_count
        FROM
            ${table} AS A
                LEFT JOIN chat_scenario AS B ON A.scenario_id = B.id
        WHERE DATE(A.created_at) BETWEEN STR_TO_DATE(?, '%Y-%m-%d') AND STR_TO_DATE(?, '%Y-%m-%d')
          AND B.LEVEL != 0
        GROUP BY
            DATE_FORMAT(A.created_at, '%H')
    `).join(' UNION ALL ');
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
                    hour_slot,
                    SUM(chat_count) AS chat_count
                FROM
                    (${subQueries}) AS combined
                GROUP BY
                    hour_slot
            ) AS chat_counts
            ON
                hours.hour_slot = chat_counts.hour_slot
        ORDER BY
            CAST(hours.hour_slot AS UNSIGNED);
    `;
    let params = [];
    quarters.forEach(() => {
        params.push(startDate, endDate);
    });
    getConnection((conn) => {
        conn.query(sql,params, (err, rows, fields) => {
            conn.release();
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
});
module.exports = {getTotalExec, getBeforeExec, getRangeExec,getRangeExecGroupByLevel1,getRangeExecRank,getRangeTimezone};
