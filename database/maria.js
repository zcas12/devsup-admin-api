const maria = require('mysql');
const config = require('../db.config.json');
let pool = maria.createPool(config);
function getConnection(callback) {
    pool.getConnection(function (err, conn) {
        if(!err) {
            callback(conn);
        }
    });
}
module.exports = getConnection;