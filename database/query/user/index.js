const getConnection = require("../../maria");

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


module.exports = {getUsers,findUserById};
