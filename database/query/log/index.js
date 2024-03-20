const getConnection = require("../../maria");
const dayjs = require('dayjs')

const getLogHistory = (startDate,endDate) => new Promise((resolve, reject) => {
    const sql =`
            SELECT  l.id,
                    l.user_id    as userId,
                    U.user_name  as userName,
                    U.name       as name,
                    l.method,
                    l.log_name   as logName,
                    l.is_success as isSuccess,
                    l.log_desc   as logDesc,
                    l.ip_address as ipAddress,
                    DATE_FORMAT(l.created_at, '%Y-%m-%d %H:%i') as createdAt
            FROM log_history as l
                LEFT JOIN user as U
                on l.user_id = U.id
            WHERE DATE(l.created_at) BETWEEN STR_TO_DATE(?, '%Y-%m-%d') AND STR_TO_DATE(?, '%Y-%m-%d')
            ORDER BY l.created_at DESC;
        `
    getConnection((conn) => {
        conn.query(sql, [startDate,endDate],(err, rows, fields) => {
            conn.release();
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
});

const saveEvent = (userId = 0,method,logName,isSuccess,logDesc, ipAddress) => new Promise((resolve, reject) => {
    getConnection((conn) => {
        const createdAt = dayjs().format('YYYY-MM-DD HH:mm:ss');

        const data = {
            user_id: userId,
            method,
            log_name: logName,
            is_success: isSuccess,
            log_desc: logDesc,
            ip_address: ipAddress,
            created_at: createdAt
        };

        conn.query('insert into log_history set ?',data, (err, rows, fields) => {
            conn.release();
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
});

const saveChatHistory = (scenarioId, ipAddress ) => new Promise((resolve, reject) => {
    getConnection((conn) => {
        const createdAt = dayjs().format('YYYY-MM-DD HH:mm:ss');
        const data = {
            scenario_id: scenarioId,
            ip_address: ipAddress,
            created_at: createdAt
        };
        conn.query('insert into chat_history set ?', data, (err, rows, fields) => {
            conn.release();
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
});

module.exports = {getLogHistory,saveEvent,saveChatHistory};