const express = require('express');
const router = express.Router();
const Scenario = require('../../database/query/scenario');
const Log = require('../../database/query/log');
const {verifyToken} = require('../../middleware/auth');

router.get('/', verifyToken, async(req,res)=>{
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
router.get('/detail', verifyToken, async(req,res)=>{
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

router.post('/save', verifyToken, async (req, res)=>{
    try {
        const {id, contents, url} = req.body;
        /*필수값 체크*/
        if (!id){
            await Log.saveEvent(undefined, 'GET', '시나리오 저장', false,"필수값 누락",req.ip);
            return res.status(200).json({ resultCd:"400", resultMsg: "시나리오 컨텐츠 필수값 누락" });
        }
        const scenario= await Scenario.findScenarioById(id);
        /*시나리오 데이터 유무 체크*/
        if (!scenario){
            await Log.saveEvent(undefined, 'GET', '시나리오 상세조회', false,"데이터를 찾을수 없습니다.",req.ip);
            return res.status(200).json({ resultCd:"404", resultMsg: "데이터를 찾을수 없습니다." });
        }

        await Scenario.saveScenario(id, contents, url)
        res.status(200).json({resultCd: "200", resultMsg: "저장성공"});
    }catch (error) {
        await Log.saveEvent(undefined, 'POST', '시나리오 컨텐츠 저장', false,"저장 실패",req.ip);
        res.status(500).json({resultCd:"500", resultMsg: "시나리오 컨텐츠 저장 실패"})
    }
});
router.post('/children/save', verifyToken, async (req, res)=>{
    try {
        const {id,children} = req.body;

        if (!id || children?.length < 1) {
            await Log.saveEvent(undefined, 'GET', '시나리오 하위 메뉴 저장', false, "필수값 누락", req.ip);
            return res.status(400).json({resultCd: "400", resultMsg: "[메뉴 저장]필수값 누락"});
        }
        const currentChildren = await Scenario.findScenarioByParentId(id);
        children.forEach((child) => {
            //기존 데이터가 있으면 업데이트
            const updateChk = currentChildren.find(item => item.id === child.id);
            if (!child.id) {
                console.log("child 추가")
                Scenario.addChildren(child.name, child.level, child.seq, child.parentId);
            } else if (updateChk) {
                console.log("==업데이트==", child.id)
                Scenario.saveChildrenName(child.name, child.id);
            }
        })
        await Log.saveEvent(undefined, 'POST', '시나리오 메뉴 저장', true,"시나리오 메뉴 저장성공",req.ip);
        res.status(200).json({resultCd: "200", resultMsg: "저장성공"});
    }catch (error) {
        await Log.saveEvent(undefined, 'POST', '시나리오 메뉴 저장', false,"시나리오 메뉴 저장실패",req.ip);
        res.status(500).json({resultCd:"500", resultMsg: "시나리오 메뉴 저장실패"})
    }
});

/*시나리오 삭제 */
router.post('/delete', verifyToken, async (req, res)=>{
    try {
        const {ids} = req.body;
        if (!ids || ids.length < 1){
            await Log.saveEvent(undefined, 'GET', '시나리오 삭제', false,"필수값 누락",req.ip);
            return res.status(400).json({ resultCd:"400", resultMsg: "시나리오 삭제 필수값 누락" });
        }
        await Scenario.deleteScenario(ids);
        await Log.saveEvent(undefined, 'DELETE', '시나리오 삭제', true, "시나리오 삭제 성공", req.ip);
        res.status(200).json({resultCd:"200", resultMsg: "시나리오 삭제 성공"})
    }catch (error) {
        await Log.saveEvent(undefined, 'POST', '시나리오 삭제', false,"시나리오 삭제 실패",req.ip);
        res.status(500).json({resultCd:"500", resultMsg: "시나리오 삭제 실패"})
    }
});
/*Tree 데이터 생성*/
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