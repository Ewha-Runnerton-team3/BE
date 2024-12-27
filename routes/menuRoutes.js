import express from 'express';
import { runPythonScript } from '../services/menuService.js';
import authenticateToken from '../middleware/authMiddleware.js';

const router = express.Router();

// 메뉴 추천 요청 처리
router.post('/recommendation', authenticateToken, async (req, res) => {
    try {
        // 요청 본문에서 매개변수 추출
        const { ingredients, cuisine, method } = req.body;

        // 필수 매개변수 검증
        if (!ingredients || !cuisine || !method) {
            return res.status(400).json({ error: '필수 필드 누락: ingredients, cuisine 또는 method' });
        }

        // Python 스크립트로 전달할 입력 데이터 생성
        const inputJson = { ingredients, cuisine, method };
        console.log(inputJson);

        // Python 스크립트를 실행하여 결과를 가져옴
        const result = await runPythonScript(inputJson);
        
        console.log('Python 스크립트 결과:', result); // 결과를 콘솔에 출력
        return res.status(200).json(result); // 결과를 클라이언트에 반환
    } catch (err) {
        console.error('오류 발생:', err.message); // 오류 메시지 출력
        res.status(500).json({ error: err.message }); // 클라이언트에 오류 반환
    }
});
export default router;