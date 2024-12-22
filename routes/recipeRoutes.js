const express = require('express');
const router = express.Router();
const recipeService = require('../services/recipeService');
const savedRecipeService = require('../services/savedRecipeService');

// 레시피 요청 처리
router.post('/', async (req, res) => {
    const { menu, userId } = req.body;

    if (!menu) {
        return res.status(400).json({ error: '메뉴 이름을 입력하세요.' });
    }

    if (!userId) {
        return res.status(400).json({ error: '사용자 ID가 필요합니다.' });
    }

    try {
        const recipe = await recipeService.createRecipe(menu, userId);
        res.status(201).json({ recipe });
    } catch (error) {
        console.error('레시피 생성 오류:', error.message);
        res.status(500).json({ error: '레시피 생성 중 오류가 발생했습니다.' });
    }
});

// 사용자 레시피 히스토리
router.get('/history/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const recipes = await recipeService.getUserHistory(userId);
        res.status(200).json({ recipes });
    } catch (error) {
        console.error('히스토리 가져오기 오류:', error.message);
        res.status(500).json({ error: '히스토리를 가져오는 중 오류가 발생했습니다.' });
    }
});

// 레시피 저장
router.post('/save', async (req, res) => {
    const { userId, recipeId } = req.body;

    try {
        const savedRecipe = await savedRecipeService.saveRecipe(userId, recipeId);
        res.status(201).json({ message: '레시피가 저장되었습니다.', savedRecipe });
    } catch (error) {
        console.error('레시피 저장 오류:', error.message);
        res.status(500).json({ error: '레시피 저장 중 오류가 발생했습니다.' });
    }
});

// 저장된 레시피 가져오기
router.get('/saved/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const recipes = await savedRecipeService.getSavedRecipes(userId);
        res.status(200).json({ recipes });
    } catch (error) {
        console.error('저장된 레시피 가져오기 오류:', error.message);
        res.status(500).json({ error: '저장된 레시피를 가져오는 중 오류가 발생했습니다.' });
    }
});

// 저장된 레시피 삭제
router.delete('/saved', async (req, res) => {
    const { userId, recipeId } = req.body;

    try {
        await savedRecipeService.deleteSavedRecipe(userId, recipeId);
        res.status(200).json({ message: '저장된 레시피가 삭제되었습니다.' });
    } catch (error) {
        console.error('저장된 레시피 삭제 오류:', error.message);
        res.status(500).json({ error: '저장된 레시피 삭제 중 오류가 발생했습니다.' });
    }
});

module.exports = router;