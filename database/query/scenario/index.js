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

const findScenarioByParentId = (id) => new Promise((resolve, reject) => {
    getConnection((conn) => {
        conn.query('SELECT id, name, level, seq FROM chat_scenario WHERE parent_id = ? ORDER BY seq ASC;',[id], (err, rows, fields) => {
            conn.release();
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
});

const findAllScenario = () => new Promise((resolve, reject) => {
    getConnection((conn) => {
        const sql = `SELECT id, name, level, parent_id as parentId, seq FROM chat_scenario`
        conn.query(sql, (err, rows, fields) => {
            conn.release();

            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
});
module.exports = {findScenarioById,findScenarioByParentId,findAllScenario};
