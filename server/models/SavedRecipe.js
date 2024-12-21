const { DataTypes } = require('sequelize');
const sequelize = require('./sequelize'); // Sequelize 인스턴스
const Recipe = require('./Recipe');
const User = require('./User');

// models/SavedRecipe.js
const SavedRecipe = sequelize.define('SavedRecipe', {
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    recipeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
});

SavedRecipe.belongsTo(Recipe, { foreignKey: 'recipeId' }); // SavedRecipe는 Recipe에 속합니다.
Recipe.hasMany(SavedRecipe, { foreignKey: 'recipeId' }); // Recipe는 여러 SavedRecipe를 가질 수 있습니다.

module.exports = SavedRecipe;