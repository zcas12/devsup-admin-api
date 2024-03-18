const express = require('express');
const router = express.Router();
const Scenario = require('../../database/query/scenario');
const Log = require('../../database/query/log');
const _ = require('lodash');
router.get('/', async(req,res)=>{
    try {
        let scenario = await Scenario.findAllScenario();
        const tree = buildTree(scenario);

        /*await Log.saveEvent(undefined, 'GET', '시나리오 목록 조회', true,"조회 성공",req.ip);*/

        res.status(200).json({resultCd:"200", resultMsg: "조회성공", resultData: tree });
    }catch (error) {
        await Log.saveEvent(undefined, 'GET', '시나리오 목록 조회', false,"조회 실패",req.ip);
        res.status(500).json({resultCd:"500", resultMsg: "load fail"})
    }
});
router.get('/detail', async(req,res)=>{
    try {
        const {scenarioId} = req.query;
        if (!scenarioId){
            await Log.saveEvent(undefined, 'GET', '시나리오 상세조회', false,"필수값 누락",req.ip);
            return res.status(200).json({ resultCd:"400", resultMsg: "필수값 누락" });
        }
        let scenario= await Scenario.findScenarioById(scenarioId);
        if (!scenario){
            await Log.saveEvent(undefined, 'GET', '시나리오 상세조회', false,"데이터를 찾을수 없습니다.",req.ip);
            return res.status(200).json({ resultCd:"404", resultMsg: "데이터를 찾을수 없습니다." });
        }
        scenario.children = await Scenario.findScenarioByParentId(scenarioId)
        /*await Log.saveEvent(undefined, 'GET', '시나리오 상세조회', true,"조회 성공",req.ip);*/
        res.status(200).json({resultCd:"200", resultMsg: "조회성공", resultData: scenario });

    }catch (error) {
        await Log.saveEvent(undefined, 'GET', '시나리오 상세 조회', false,"조회 실패",req.ip);
        res.status(500).json({resultCd:"500", resultMsg: "load fail"})
    }
});
function buildTree(data) {
    const nodeMap = {};
    let roots = [];

    // node 세팅
    data.forEach(node => {
        nodeMap[node.id] = { id: node.id, label: node.name, children: [] };
    });
    // Build tree
    data.forEach(node => {

        const parentId = node.parentId;
        if (parentId === 0) {
            roots.push(nodeMap[node.id]);
        } else {
            const parent = nodeMap[parentId];
            if (parent) {
                parent.children.push(nodeMap[node.id]);
            }
        }
    });
    return roots;
}


module.exports = router;