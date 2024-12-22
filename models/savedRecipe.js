import { DataTypes } from 'sequelize';

const SavedRecipeModel = (sequelize) => {
    const SavedRecipe = sequelize.define('SavedRecipe', {
        userId: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: false,
        },
        recipeId: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: false,
        },
    }, {
        tableName: 'saved_recipes',
        timestamps: true,
    });
    return SavedRecipe;
};

export default SavedRecipeModel;