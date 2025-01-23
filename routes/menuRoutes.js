import express from 'express';
import { loadMenuData, recommendMenus } from '../services/menuService.js';

const router = express.Router();

// 서버 시작 시 데이터 로드
loadMenuData();

// 메뉴 추천 요청 처리
router.post('/recommendation', async (req, res) => {
    const { ingredients } = req.body;

    if (!ingredients || !Array.isArray(ingredients)) {
        return res.status(400).json({ message: '재료 리스트를 제공해야 합니다.' });
    }

    const topMenus = recommendMenus(ingredients);
    res.json({ menus: topMenus });
});

export default router;