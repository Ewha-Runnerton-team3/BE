const express = require('express');
const { OpenAI } = require('openai');
require('dotenv').config();
const router = express.Router();
const Recipe = require('../models/Recipe');
const SavedRecipe = require('../models/SavedRecipe');

// OpenAI API 설정
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

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
        // ChatGPT API 호출
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: `
                    You are a chef who provides recipes in JSON format. 
                    Include detailed instructions, overall preparation time, 
                    and difficulty level based on a beginner's perspective. 
                    For example:
                    - Difficulty level 1: Easy, such as instant noodles or simple sandwiches.
                    - Difficulty level 2: Basic cooking like frying eggs or boiling pasta.
                    - Difficulty level 3: Moderate recipes requiring multiple steps or special techniques.
                    - Difficulty level 4: Complex recipes with advanced techniques or longer preparation times.
                    - Difficulty level 5: Very challenging recipes like pastries or multi-course meals.`
                },
                {
                    role: 'user',
                    content: `다음 형식의 ${menu}에 대한 JSON 형식의 레시피를 한국어로 작성해주세요. 레시피는 초보자도 쉽게 따라할 수 있도록 전체 소요시간, 조리 난이도(설명과 점수), 재료, 단계별 조리 방법을 포함해야 합니다. 각 단계는 재료 준비 방법, 조리 시간, 그리고 요리 과정을 자세하고 친절하게게 설명해주세요:
                    - 난이도 1: 즉석 요리 또는 매우 간단한 조리법 (예: 라면, 토스트)
                    - 난이도 2: 간단한 채소 손질과 기본적인 끓이기 또는 볶기 (예: 계란 프라이, 간단한 파스타)
                    - 난이도 3: 소스 준비, 다양한 재료 손질 등 (예: 카레, 볶음 요리)
                    - 난이도 4: 오랜 조리 시간 또는 고급 기술이 필요한 요리 (예: 라자냐, 찜요리)
                    - 난이도 5: 고도의 기술과 장비가 필요한 요리 (예: 페이스트리, 직접 면을 뽑는 전통 요리)
                    각 단계는 재료 준비 방법, 조리 시간, 그리고 요리 과정을 자세히 설명해주세요:
                    {
                    "name": "메뉴 이름",
                    "totalTime": "전체 소요시간 (예: 30분)",
                    "difficulty": "조리 난이도 설명 (예: 쉬움, 중간, 어려움)",
                    "difficultyScore": "조리 난이도 점수 (1-5)",
                    "ingredients": [
                        { "ingredient": "재료 이름", "quantity": "대략적인 양" }
                    ],
                    "steps": [
                        { "id": 1, "step": "첫 번째 단계 설명" },
                        { "id": 2, "step": "두 번째 단계 설명" }
                    ]
                    }`
                }
            ],
            max_tokens: 700,
            temperature: 0.7,
        });

        // 응답에서 코드 블록 마커 제거
        const cleanedOutput = response.choices[0].message.content.replace(/```json|```/g, '').trim();

        // JSON으로 파싱
        const recipeData = JSON.parse(cleanedOutput);

        // 레시피를 데이터베이스에 저장
        const newRecipe = await Recipe.create({
            userId,
            name: recipeData.name,
            totalTime: recipeData.totalTime,
            difficulty: recipeData.difficulty,
            difficultyScore: recipeData.difficultyScore,
            ingredients: JSON.stringify(recipeData.ingredients),
            steps: JSON.stringify(recipeData.steps),
        });

        // JSON 데이터를 파싱하여 응답
        res.status(201).json({
            recipe: {
                id: newRecipe.id, // 저장된 레시피의 ID 포함
                name: newRecipe.name,
                totalTime: newRecipe.totalTime,
                difficulty: newRecipe.difficulty,
                difficultyScore: newRecipe.difficultyScore,
                ingredients: JSON.parse(newRecipe.ingredients), // JSON으로 변환
                steps: JSON.parse(newRecipe.steps), // JSON으로 변환
            },
        });
    } catch (error) {
        console.error('API 요청 오류:', error.response?.data || error.message);
        res.status(error.response?.status || 500).json({
            error: error.response?.data || '레시피를 가져오는 중 오류가 발생했습니다.',
        });
    }
});


// 사용자 레시피 히스토리 불러오기
router.get('/history/:userId', async (req, res) => {
    const { userId } = req.params;

    if (!userId) {
        return res.status(400).json({ error: '사용자 ID가 필요합니다.' });
    }

    try {
        // 데이터베이스에서 최신순으로 레시피 가져오기
        const userRecipes = await Recipe.findAll({
            where: { userId },
            order: [['createdAt', 'DESC']], // 최신순 정렬
        });

        // 응답 데이터 변환
        const formattedRecipes = userRecipes.map(recipe => ({
            ...recipe.toJSON(),
            ingredients: JSON.parse(recipe.ingredients), // JSON으로 변환
            steps: JSON.parse(recipe.steps), // JSON으로 변환
        }));

        res.status(200).json({ recipes: formattedRecipes });
    } catch (error) {
        console.error('레시피 히스토리 불러오기 오류:', error.message);
        res.status(500).json({
            error: '레시피 히스토리를 불러오는 중 오류가 발생했습니다.',
        });
    }
});

router.post('/save', async (req, res) => {
    const { userId, recipeId } = req.body;

    if (!userId || !recipeId) {
        return res.status(400).json({ error: '사용자 ID와 레시피 ID가 필요합니다.' });
    }

    try {
        const savedRecipe = await SavedRecipe.create({ userId, recipeId });
        res.status(201).json({ message: '레시피가 저장되었습니다.', savedRecipe });
    } catch (error) {
        console.error('레시피 저장 오류:', error.message);
        res.status(500).json({ error: '레시피 저장 중 오류가 발생했습니다.' });
    }
});

router.get('/saved/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const savedRecipes = await SavedRecipe.findAll({
            where: { userId },
            include: Recipe, // Recipe 데이터 포함
        });

        const formattedRecipes = savedRecipes.map(item => ({
            ...item.Recipe.toJSON(),
            savedAt: item.createdAt, // 저장된 시간 추가
        }));

        res.status(200).json({ recipes: formattedRecipes });
    } catch (error) {
        console.error('저장된 레시피 불러오기 오류:', error.message);
        res.status(500).json({ error: '저장된 레시피를 불러오는 중 오류가 발생했습니다.' });
    }
});

router.delete('/saved', async (req, res) => {
    const { userId, recipeId } = req.body;

    if (!userId || !recipeId) {
        return res.status(400).json({ error: '사용자 ID와 레시피 ID가 필요합니다.' });
    }

    try {
        await SavedRecipe.destroy({ where: { userId, recipeId } });
        res.status(200).json({ message: '저장된 레시피가 삭제되었습니다.' });
    } catch (error) {
        console.error('저장된 레시피 삭제 오류:', error.message);
        res.status(500).json({ error: '저장된 레시피 삭제 중 오류가 발생했습니다.' });
    }
});

module.exports = router;