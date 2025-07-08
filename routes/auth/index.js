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

        //필수값 체크
        if(!username || !password){
            await Log.saveEvent(undefined, 'POST', '로그인', false,"[필수값 누락]",req.ip);
            return res.status(200).json({ resultCd:"400", resultMsg: "필수값 누락" });
        }
        // 계정조회
        const user = await User.findUserById(username);

        if(!user){
            await Log.saveEvent(username, 'POST', '로그인', false,'계정을 찾을수없습니다.',req.ip);
            return res.status(200).json({ resultCd:"401", resultMsg: "계정을 찾을수없습니다." });
        } else if(user.id && !(await bcrypt.compare(password, user.password))){
            await Log.saveEvent(user.id, 'POST', '로그인', false,'비밀번호가 틀렸습니다.',req.ip);
            return res.status(200).json({ resultCd:"401", resultMsg: "비밀번호가 틀렸습니다." });
        } else if((await bcrypt.compare(password, user.password))){
            const tokenParam={
                id: user.id,
                username : user.user_name,
                name: user.name
            }

            // JWT 생성 및 전송
            let accessToken = await jwt.sign(tokenParam, secretKey, { expiresIn: '1h' });
            const refreshToken = jwt.sign(tokenParam, secretKey, { expiresIn: '1d' });

            req.session.user = {
                id: user.id,
                userName: user.user_name,
                token: accessToken ,
                authorized: true,
            };
            await Log.saveEvent(user.id, 'POST', '로그인', true,'로그인 성공',req.ip);
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production' ? true : false, // 로컬에서는 false로 설정
                sameSite: 'Lax',
                maxAge: 1 * 24 * 60 * 60 * 1000 // 1일 동안 유효
            });
            res.status(200).json({resultCd:"200", resultMsg: "로그인 했습니다.", token: accessToken });
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

/*토큰 재발급*/
router.post('/refresh-token', async (req, res) => {
    try {

        const refreshToken = req.cookies?.refreshToken;

        if (!refreshToken) {
            return res.status(403).json({ resultCd: "403", resultMsg: "리프레시 토큰이 없습니다." });
        }

        // 리프레시 토큰 검증
        jwt.verify(refreshToken, secretKey, async (err, decoded) => {
            console.log("err", err)
            if (err) {
                return res.status(403).json({ resultCd: "403", resultMsg: "리프레시 토큰이 유효하지 않습니다." });
            }

            // 새로운 액세스 토큰 생성
            const newToken = jwt.sign(
                { id: decoded.id, name: decoded.name,username: decoded.username},
                secretKey,
                { expiresIn: '1h' }
            );
            console.log("newToken", newToken)
            // 새 토큰 반환
            return res.status(200).json({
                resultCd: "200",
                resultMsg: "새로운 액세스 토큰을 발급했습니다.",
                token: newToken
            });
        });
    } catch (error) {
        console.error(error);
        return res.status(403).json({ resultCd: "403", resultMsg: "서버 에러" });
    }
});

/* 로그인 */
router.post('/signup', async (req, res) => {
    try {
        const { username, password, name, deptName } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        //필수값 체크
        if(!username || !password || !name || !deptName){
            await Log.saveEvent(undefined, 'POST', '로그인', false,"[필수값 누락]",req.ip);
            return res.status(200).json({ resultCd:"400", resultMsg: "필수값 누락" });
        }
        // 계정등록
        await User.addUser(username, hashedPassword, name, deptName);
        await Log.saveEvent(undefined, 'POST', '회원가입', true,'회원가입 성공',req.ip);
        res.status(200).json({resultCd:"200", resultMsg: "회원가입에 성공했습니다."});
    } catch (error) {
        await Log.saveEvent(undefined, 'POST', '회원가입', false,'서버 에러',req.ip);
        console.log(error)
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