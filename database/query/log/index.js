const getConnection = require("../../maria");
const dayjs = require('dayjs')

const saveEvent = (userId,method,logName,successYn,logDesc) => new Promise((resolve, reject) => {
    getConnection((conn) => {
        const createdAt = dayjs().format('YYYY-MM-DD HH:mm:ss');

        const data = {
            user_id: userId,
            method,
            log_name: logName,
            success_yn: successYn,
            log_desc:logDesc,
            created_at:createdAt
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
module.exports = {saveEvent};