import { OpenAI } from 'openai';
import Recipe from '../models/recipe.js';
import dotenv from 'dotenv';
dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// OpenAI를 사용하여 레시피 생성
async function createRecipe(menu, userId) {
    const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
            {
                role: 'system',
                content: `
                You are a chef who provides recipes in JSON format. 
                Include detailed instructions, overall preparation time, 
                and difficulty level based on a beginner's perspective. 
                Respond only in valid JSON format without extra markdown.

                Difficulty levels are defined as follows:
                - Difficulty 1: Recipes with 2 or fewer ingredients and less than 20 minutes preparation time (e.g., instant noodles, toast).
                - Difficulty 2: Recipes with 3-4 ingredients and up to 40 minutes preparation time (e.g., simple pasta).
                - Difficulty 3: Recipes with 5-6 ingredients and moderate preparation time (e.g., curry, stir-fry).
                - Difficulty 4: Recipes with 7-8 ingredients requiring advanced techniques or longer preparation time (e.g., lasagna, steamed dishes).
                - Difficulty 5: Recipes with 9+ ingredients and complex techniques (e.g., pastries, handmade noodles).
                `
            },
            {
                role: 'user',
                content: `다음 형식의 ${menu}에 대한 JSON 형식의 레시피를 한국어로 작성해주세요. 레시피는 초보자도 쉽게 따라할 수 있도록 전체 소요시간, 조리 난이도(설명과 점수), 재료, 단계별 조리 방법을 포함해야 합니다. 각 단계는 재료 준비 방법, 조리 시간, 그리고 요리 과정을 자세하고 친절하게게 설명해주세요:
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

    const cleanedOutput = response.choices[0].message.content.replace(/```json|```/g, '').trim();
    const recipeData = JSON.parse(cleanedOutput);

    const newRecipe = await Recipe.create({
        userId,
        name: recipeData.name,
        totalTime: recipeData.totalTime,
        difficulty: recipeData.difficulty,
        difficultyScore: recipeData.difficultyScore,
        ingredients: JSON.stringify(recipeData.ingredients),
        steps: JSON.stringify(recipeData.steps),
    });

    return newRecipe;
}

// 사용자 히스토리 불러오기
async function getUserHistory(userId) {
    const recipes = await Recipe.findAll({
        where: { userId },
        order: [['createdAt', 'DESC']],
    });

    return recipes.map(recipe => ({
        ...recipe.toJSON(),
        ingredients: JSON.parse(recipe.ingredients),
        steps: JSON.parse(recipe.steps),
    }));
}

export { createRecipe, getUserHistory };