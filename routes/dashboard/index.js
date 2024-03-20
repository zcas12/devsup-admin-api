const express = require('express');
const router = express.Router();
const Dashboard = require('../../database/query/dashboard');
const Log = require("../../database/query/log");
const {verifyToken} = require("../../middleware/auth");
router.get('/', async(req,res)=>{
    return res.json({resultCd: "200"})
});
router.get('/exec', verifyToken, async(req,res)=>{
    const {startDate, endDate} = req.query;
    try {
        if (!startDate || !endDate){
            return res.status(400).json({ resultCd:"400", resultMsg: "필수값 누락" });
        }
        const totalCnt = await Dashboard.getTotalExec();
        const searchCnt = await Dashboard.getRangeExec(startDate,endDate);
        const categoryCnt = await Dashboard.getRangeExecGroupByLevel1(startDate,endDate);
        const result = {
            totalCnt: totalCnt.cnt ,
            searchCnt: searchCnt.cnt,
            categoryCnt:categoryCnt
        }
        return res.json({resultCd: "200", resultMsg: "조회성공", resultData: result })
    }catch (error) {
        await Log.saveEvent(undefined, 'GET', '[대시보드] 상담톡 Total 실행 조회', false,"조회 실패",req.ip);
        res.status(500).json({resultCd:"500", resultMsg: "load fail"})
    }
});
router.get('/rank', verifyToken, async(req,res)=>{
    const {startDate, endDate} = req.query;
    try {
        if (!startDate || !endDate){
            await Log.saveEvent(undefined, 'GET', '[대시보드] 상담톡 실행 Rank 조회', false,"필수값 누락",req.ip);

            return res.status(400).json({ resultCd:"400", resultMsg: "필수값 누락" });
        }
        const result = await Dashboard.getRangeExecRank(startDate,endDate);
        res.json({resultCd: "200", resultMsg: "조회성공", resultData: result })
    }catch (error) {
        await Log.saveEvent(undefined, 'GET', '[대시보드] 상담톡 실행 Rank 조회', false,"조회 실패",req.ip);
        res.status(500).json({resultCd:"500", resultMsg: "load fail"})
    }
});
router.get('/timezone',verifyToken,  async(req,res)=>{
    const {startDate, endDate} = req.query;
    try {
        if (!startDate || !endDate){
            await Log.saveEvent(undefined, 'GET', '[대시보드] 상담톡 시간대별 조회', false,"필수값 누락",req.ip);
            return res.status(400).json({ resultCd:"400", resultMsg: "필수값 누락" });
        }
        const result = await Dashboard.getRangeTimezone(startDate,endDate);
        res.json({resultCd: "200", resultMsg: "조회성공", resultData: result })
    }catch (error) {
        await Log.saveEvent(undefined, 'GET', '[대시보드] 상담톡 시간대별 조회', false,"조회 실패",req.ip);
        res.status(500).json({resultCd:"500", resultMsg: "load fail"})
    }
});

module.exports = router;