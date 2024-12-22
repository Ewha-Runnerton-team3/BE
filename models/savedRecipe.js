import { DataTypes } from 'sequelize';

const SavedRecipeModel = (sequelize) => {
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

    return SavedRecipe;
};

export default SavedRecipeModel;