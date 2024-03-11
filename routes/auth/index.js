const express = require('express');
const router = express.Router();
const User = require('../../database/query/user');
const Log = require('../../database/query/log');
const bcrypt = require('bcrypt');
const {verifyToken} = require('../../middleware/auth');
const jwt = require('jsonwebtoken');
const secretKey = 'MFswDQYJKoZIhvcNAQEBBQADSgAwRwJAeswwZ+ANz25d7nMVcWkwGrEx3IVUz39/LghHQxW4lLjgXJbz4F+Dam2mNIAmukFdY0F0YzH+52xPiS33Y3FaKwIDAQAB'; // JWT를 서명하는 데 사용할 시크릿 키

/* 로그인 */
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        if(!username || !password){
            return res.status(200).json({ resultCd:"400", resultMsg: "[필수값 누락]" });
        }
        // 계정조회
        const user = await User.findUserById(username);

        const tokenParam={
            id: user.id,
            username : user.user_name,
            name: user.name
        }

        let token;
        // JWT 생성 및 전송
        token = await jwt.sign(tokenParam, secretKey, { expiresIn: 3600 });

        if(!user){
            await Log.saveEvent(username, 'POST', '로그인', false,'계정을 찾을수없습니다.');
            return res.status(200).json({ resultCd:"401", resultMsg: "계정을 찾을수없습니다." });
        } else if(user.id && !(await bcrypt.compare(password, user.password))){
            await Log.saveEvent(user.id, 'POST', '로그인', false,'비밀번호가 틀렸습니다.');
            return res.status(200).json({ resultCd:"401", resultMsg: "비밀번호가 틀렸습니다." });
        } else if((await bcrypt.compare(password, user.password))){
            req.session.user = {
                id: user.id,
                userName: user.user_name,
                token: token,
                authorized: true,
            };
            await Log.saveEvent(user.id, 'POST', '로그인', true,'로그인 성공');
            res.status(200).json({resultCd:"200", resultMsg: "로그인 했습니다.", token: token});
        } else {
            await Log.saveEvent(user.id, 'POST', '로그인', false,'500 error');
        }
    } catch (error) {
        await Log.saveEvent(user.id, 'POST', '로그인', false,'500 error');

        res.status(500).json({
            code: 500,
            message: '서버 에러',
        });
    }
});

router.get('/session-check', verifyToken, async  (req, res) => {
    const session= req.session.user;
    if (session){
        res.status(200).json({resultCd:"200", resultMsg: "session check success"})
    }else{
        res.status(401).json({resultCd:"401", resultMsg: "session check fail"})
    }
});



module.exports = router;