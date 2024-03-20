const express = require('express');
const router = express.Router();
const user = require('../database/query/user');
/* GET home page. */
router.get('/', function(req, res) {
    res.render('index');
});

router.get('/select', async function(req, res, next) { // /select 부분 추가
    try {
        const result = await user.getUsers();
        res.status(200).send({
            success: true,
            result
        });
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
