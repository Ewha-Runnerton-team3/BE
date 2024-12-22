import db from './models/index.js';

console.log('Recipe 모델 확인:', db.Recipe);

(async () => {
    try {
        const recipes = await db.Recipe.findAll();
        console.log('Recipes:', recipes);
    } catch (error) {
        console.error('Error:', error.message);
    }
})();