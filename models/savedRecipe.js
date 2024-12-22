import { DataTypes } from 'sequelize';

const SavedRecipeModel = (sequelize, Recipe) => {
    const SavedRecipe = sequelize.define('SavedRecipe', {
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        recipeId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Recipe,
                key: 'id',
            },
            onDelete: 'CASCADE', // 부모 테이블이 삭제되면 같이 삭제
            onUpdate: 'CASCADE',
        },
    });

    // 관계 설정
    SavedRecipe.belongsTo(Recipe, { foreignKey: 'recipeId' });
    Recipe.hasMany(SavedRecipe, { foreignKey: 'recipeId' });

    return SavedRecipe;
};

export default SavedRecipeModel;