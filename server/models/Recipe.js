const { DataTypes } = require('sequelize');
const sequelize = require('./sequelize');
const User = require('./User');

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
            type: DataTypes.INTEGER, // 사용자와 연결될 외래 키
            allowNull: false,
            references: {
                model: 'Users', // Users 테이블과 연결
                key: 'id',
            },
            onDelete: 'CASCADE', // 사용자가 삭제되면 레시피도 삭제
            onUpdate: 'CASCADE',
        },
    },
    {
        tableName: 'Recipes', // 테이블 이름 명시
        timestamps: true, // createdAt, updatedAt 자동 생성
    }
);

module.exports = Recipe;

// 사용자와 레시피의 관계 설정
Recipe.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Recipe, { foreignKey: 'userId' });

module.exports = Recipe;