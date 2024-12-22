import { DataTypes } from 'sequelize';

const RecipeModel = (sequelize) => {
    const Recipe = sequelize.define(
        'Recipe',
        {
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            totalTime: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            difficulty: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            difficultyScore: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            ingredients: {
                type: DataTypes.TEXT, // JSON 형식으로 저장
                allowNull: false,
            },
            steps: {
                type: DataTypes.TEXT, // JSON 형식으로 저장
                allowNull: false,
            },
            userId: {
                type: DataTypes.BIGINT.UNSIGNED, // 사용자와 연결될 외래 키
                allowNull: false,
            },
        },
        {
            tableName: 'recipes', // 테이블 이름 명시
            timestamps: true, // createdAt, updatedAt 자동 생성
        }
    );

    return Recipe;
};

export default RecipeModel;