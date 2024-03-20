const express = require('express');
const router = express.Router();
const Log = require('../../database/query/log');
const Scenario = require('../../database/query/scenario');
const {verifyToken} = require("../../middleware/auth");

router.get('/log-history',verifyToken, async(req,res)=>{
    const {startDate, endDate} = req.query;

    try {
        if (!startDate || !endDate){
            return res.status(200).json({ resultCd:"400", resultMsg: "필수값 누락" });
        }
        const result = await Log.getLogHistory(startDate,endDate);

        res.status(200).json({resultCd:"200", resultMsg: "조회성공", resultData: result });

    }catch (error) {
        res.status(500).json({resultCd:"500", resultMsg: "load fail"});

    }
})

/*챗 호출 히스토리 저장*/
router.post('/chat-history', async (req, res)=>{
    const {scenarioId} = req.body;
    try {
        const scenario= await Scenario.findScenarioById(scenarioId);

        if (!scenarioId){
            return res.status(200).json({ resultCd:"400", resultMsg: "필수값 누락" });
        }else if (!scenario){
            return res.status(200).json({ resultCd:"400", resultMsg: "해당 시나리오를 찾을수 없습니다." });
        } else {
            Log.saveChatHistory(scenarioId,req.ip).then(()=>{
                return res.status(200).json({ resultCd:"200", resultMsg: "저장했습니다." });
            }).catch(()=>{
                return res.status(200).json({ resultCd:"500", resultMsg: "저장에 실패했습니다." });
            })
        }
    }catch (error) {
        res.status(500).json({resultCd:"500", resultMsg: "server error"})

    }
})
module.exports = router;