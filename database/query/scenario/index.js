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
        conn.query('SELECT id, name, level, seq FROM chat_scenario WHERE parent_id = ? and is_deleted = 1 ORDER BY seq ASC;',[id], (err, rows, fields) => {
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
        const sql = `SELECT id, name, level, parent_id as parentId, seq 
                            FROM chat_scenario 
                            WHERE is_deleted = 1
                            ORDER BY level  ASC, seq ASC;
                            `
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
const saveScenario = (id, contents, url) => new Promise((resolve, reject) => {
    const sql =
        `UPDATE chat_scenario  
             SET contents  = ?
                ,url = ?     
            WHERE id = ?;
            `
    getConnection((conn) => {
        conn.query(sql,[contents, url, id], (err, rows, fields) => {
            conn.release();
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
});
const saveChildrenName = (name,id) => new Promise((resolve, reject) => {
    const sql =
        `UPDATE chat_scenario
         SET name  = ?
         WHERE id = ?;
        `
    getConnection((conn) => {
        conn.query(sql,[name, id], (err, rows, fields) => {
            conn.release();
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
});
const addChildren = (name,level,seq,parentId) => new Promise((resolve, reject) => {
    const sql =
        `INSERT INTO chat_scenario(name, level, seq, parent_id)
         VALUES (?,?,?,?)
        `
    getConnection((conn) => {
        conn.query(sql,[name, level, seq,parentId], (err, rows, fields) => {
            conn.release();
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
});
const deleteScenario = (ids) => new Promise((resolve, reject) => {
    const sql = `UPDATE chat_scenario SET is_deleted = 0 WHERE id IN (?)`;

    getConnection((conn) => {
        conn.query(sql,[ids], (err, rows, fields) => {
            conn.release();
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
});
const findAllScenarioExport = () => new Promise((resolve, reject) => {
    const sql = `SELECT id, name, contents, level, parent_id as parentId, seq 
                        FROM  chat_scenario 
                        WHERE is_deleted = 1
                        ORDER BY level ASC, parent_id ASC,seq ASC;
                        `
    getConnection((conn) => {
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

module.exports = {findScenarioById,findScenarioByParentId,findAllScenario,saveScenario,saveChildrenName,addChildren,deleteScenario,findAllScenarioExport};
