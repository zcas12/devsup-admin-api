const express = require('express');
const router = express.Router();
const User = require('../../database/query/user');
const Log = require('../../database/query/log');
const bcrypt = require('bcrypt');
const {verifyToken} = require('../../middleware/auth');
const jwt = require('jsonwebtoken');
const secretKey = 'MFswDQYJKoZIhvcNAQEBBQADSgAwRwJAeswwZ+ANz25d7nMVcWkwGrEx3IVUz39/LghHQxW4lLjgXJbz4F+Dam2mNIAmukFdY0F0YzH+52xPiS33Y3FaKwIDAQAB'; // JWT를 서명하는 데 사용할 시크릿 키
const requestIp = require('request-ip');

/* 로그인 */
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        console.log("ip" + req.ip)
        console.log("ipAddress" + ipAddress)
        console.log("requestIp" + requestIp.getClientIp(req))
        //필수값 체크
        if(!username || !password){
            await Log.saveEvent(undefined, 'POST', '로그인', false,"[필수값 누락]",req.ip);
            return res.status(200).json({ resultCd:"400", resultMsg: "필수값 누락" });
        }
        // 계정조회
        const user = await User.findUserById(username);

        const tokenParam={
            id: user.id,
            username : user.user_name,
            name: user.name
        }

        // JWT 생성 및 전송
        let token = await jwt.sign(tokenParam, secretKey, { expiresIn: 3600 });

        if(!user){
            await Log.saveEvent(username, 'POST', '로그인', false,'계정을 찾을수없습니다.',req.ip);
            return res.status(200).json({ resultCd:"401", resultMsg: "계정을 찾을수없습니다." });
        } else if(user.id && !(await bcrypt.compare(password, user.password))){
            await Log.saveEvent(user.id, 'POST', '로그인', false,'비밀번호가 틀렸습니다.',req.ip);
            return res.status(200).json({ resultCd:"401", resultMsg: "비밀번호가 틀렸습니다." });
        } else if((await bcrypt.compare(password, user.password))){
            req.session.user = {
                id: user.id,
                userName: user.user_name,
                token: token,
                authorized: true,
            };
            await Log.saveEvent(user.id, 'POST', '로그인', true,'로그인 성공',req.ip);
            res.status(200).json({resultCd:"200", resultMsg: "로그인 했습니다.", token: token});
        } else {
            await Log.saveEvent(user.id, 'POST', '로그인', false,'500 error',req.ip);
        }
    } catch (error) {
        await Log.saveEvent(undefined, 'POST', '로그인', false,'서버 에러',req.ip);

        res.status(500).json({
            code: 500,
            message: '서버 에러',
        });
    }
});

router.get('/session-check', verifyToken, async  (req, res) => {
    const ip = req.header['x-forwarded-for'] || req.connection.remoteAddress;


    const session= req.session.user;
    if (session){
        res.status(200).json({resultCd:"200", resultMsg: "session check success"})
    }else{
        res.status(401).json({resultCd:"401", resultMsg: "session check fail"})
    }
});



module.exports = router;