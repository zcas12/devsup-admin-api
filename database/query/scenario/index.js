const getConnection = require("../../maria");

const findScenarioById = (id) => new Promise((resolve, reject) => {
    getConnection((conn) => {
        conn.query('SELECT * FROM chat_scenario WHERE id = ?',[id], (err, rows, fields) => {
            conn.release();
            if (err) {
                reject(err);
            } else {
                resolve(rows[0]);
            }
        });
    });
});
module.exports = {findScenarioById};
