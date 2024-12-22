const SavedRecipe = require('../models/savedRecipe');
const Recipe = require('../models/recipe');

// 레시피 저장
async function saveRecipe(userId, recipeId) {
    return await SavedRecipe.create({ userId, recipeId });
}

// 저장된 레시피 가져오기
async function getSavedRecipes(userId) {
    const savedRecipes = await SavedRecipe.findAll({
        where: { userId },
        include: Recipe,
    });

    return savedRecipes.map(item => ({
        ...item.Recipe.toJSON(),
        savedAt: item.createdAt,
    }));
}

// 저장된 레시피 삭제
async function deleteSavedRecipe(userId, recipeId) {
    return await SavedRecipe.destroy({
        where: { userId, recipeId },
    });
}

module.exports = {
    saveRecipe,
    getSavedRecipes,
    deleteSavedRecipe,
};