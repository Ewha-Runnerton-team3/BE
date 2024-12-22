const { OpenAI } = require('openai');
const Recipe = require('../models/recipe');

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
                ...`,
            },
            {
                role: 'user',
                content: `다음 형식의 ${menu}에 대한 JSON 형식의 레시피를 한국어로 작성해주세요: {...}`,
            },
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

module.exports = {
    createRecipe,
    getUserHistory,
};