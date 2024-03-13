const express = require('express');
const router = express.Router();
const Log = require('../../database/query/log');

router.get('/log-history', async(req,res)=>{
    const {startDate, endDate} = req.query;
    try {
        if (!startDate || !endDate){
            return res.status(200).json({ resultCd:"400", resultMsg: "필수값 누락" });
        }
        const result = await Log.getLogHistory(startDate,endDate);

        res.status(200).json({resultCd:"200", resultMsg: "조회성공", resultData: result })

    }catch (error) {
        res.status(500).json({resultCd:"500", resultMsg: "load fail"})

    }
})

module.exports = router;