const getConnection = require("../../maria");
const dayjs = require("dayjs");

/*user테이블 조회*/
function getUsers() {
    return new Promise((resolve, reject) => {
        getConnection((conn) => {
            conn.query('SELECT * FROM user', (err, rows, fields) => {
                conn.release();
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    });
}
const findUserById = (id) => new Promise((resolve, reject) => {
    getConnection((conn) => {
        conn.query('SELECT * FROM user WHERE user_name = ?',[id], (err, rows, fields) => {
            conn.release();
            if (err) {
                reject(err);
            } else {
                resolve(rows[0]);
            }
        });
    });
});

const addUser = (username, password, name,deptName) => new Promise((resolve, reject) => {
    getConnection((conn) => {
        const createdAt = dayjs().format('YYYY-MM-DD HH:mm:ss');
        const data = {
            user_name: username,
            password: password,
            name: name,
            dept_name: deptName,
            created_at: createdAt
        };
        conn.query('insert into user set ?', data, (err, rows, fields) => {
            conn.release();
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
});

module.exports = {getUsers,findUserById,addUser};
