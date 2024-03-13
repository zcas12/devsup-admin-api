const getConnection = require("../../maria");
const dayjs = require('dayjs')

const getLogHistory = (startDate,endDate) => new Promise((resolve, reject) => {
    const sql =`
            SELECT  l.id,
                    l.user_id    as userId,
                    U.user_name  as userName,
                    U.name       as userName2,
                    l.method,
                    l.log_name   as logName,
                    l.success_yn as successYn,
                    l.log_desc   as logDesc,
                    l.ip_address as ipAddress,
                    l.created_at as createdAt
            FROM log_history as l
                LEFT JOIN user as U
                on L.user_id = U.id
            WHERE DATE(created_at) BETWEEN STR_TO_DATE('2024-02-10', '%Y-%m-%d') AND STR_TO_DATE('2024-03-13', '%Y-%m-%d')
            ORDER BY created_at DESC;
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

const saveEvent = (userId = 0,method,logName,successYn,logDesc, ipAddress) => new Promise((resolve, reject) => {
    getConnection((conn) => {
        const createdAt = dayjs().format('YYYY-MM-DD HH:mm:ss');

        const data = {
            user_id: userId,
            method,
            log_name: logName,
            success_yn: successYn,
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
module.exports = {getLogHistory,saveEvent};