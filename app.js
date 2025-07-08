const express = require("express");
const serveStatic = require("serve-static");
const cookieParser = require("cookie-parser");
const expressSession = require("express-session");
const bodyParser = require("body-parser");

const cors = require("cors");
const path = require('path');
const app = express();
const port = 8080;
const corsOptions = {
    origin: process.env.NODE_ENV === 'production'
        ? 'https://devsup.kcp.co.kr' // 배포 환경에서의 URL
        : 'http://localhost:3000', // 개발 환경에서의 URL
    credentials: true, // 쿠키나 인증 정보를 포함한 요청을 허용
};
app.use(cors(corsOptions));
app.use(serveStatic(path.join(__dirname, "public")));
app.use(bodyParser.json());
app.use(
    bodyParser.urlencoded({
        extended: false,
    })
);
// 세션세팅
app.use(
    expressSession({
        secret: "NHNKCP",
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: false, // 자바스크립트를 통해 세션 쿠키를 사용할 수 없도록 함
            secure: process.env.NODE_ENV === 'production', // 프로덕션 환경에서만 true
            maxAge: 60 * 60 * 1000,// 60분
            //domain: 'your-domain.com' // 특정 도메인을 여기에 입력
        }
    })
);
// cookie and session assign middleWare
app.use(cookieParser());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set('trust proxy', true);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const indexRouter = require('./routes/index');
const logRouter = require('./routes/log/index');
const authRouter = require('./routes/auth/index');
const scenarioRouter = require('./routes/scenario/index');
const dashboardRouter = require('./routes/dashboard/index');
app.use('/devsup/api', indexRouter);
app.use('/devsup/api/auth', authRouter);
app.use('/devsup/api/log', logRouter);
app.use('/devsup/api/scenario', scenarioRouter);
app.use('/devsup/api/dashboard', dashboardRouter);
app.listen(port, () => {
    console.log(`start! express server on http://localhost:${port}`);
    console.log('__dirname :' + __dirname);
});
module.exports = app;