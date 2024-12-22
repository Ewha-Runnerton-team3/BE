import Sequelize from 'sequelize';
import UserModel from './user.js';
import RecipeModel from './recipe.js';
import SavedRecipeModel from './savedRecipe.js';
import configData from '../config/config.json' assert { type: 'json' };

const env = process.env.NODE_ENV || 'development';
const config = configData[env];

const sequelize = new Sequelize(config.database, config.username, config.password, config);

const User = UserModel(sequelize);
const Recipe = RecipeModel(sequelize);
const SavedRecipe = SavedRecipeModel(sequelize);

// 관계 설정
User.hasMany(Recipe, { foreignKey: 'userId', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
Recipe.belongsTo(User, { foreignKey: 'userId', onDelete: 'CASCADE', onUpdate: 'CASCADE' });

SavedRecipe.belongsTo(Recipe, { foreignKey: 'recipeId', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
Recipe.hasMany(SavedRecipe, { foreignKey: 'recipeId', onDelete: 'CASCADE', onUpdate: 'CASCADE' });


const db = {
  sequelize,
  Sequelize,
  User,
  Recipe,
  SavedRecipe,
};

export { sequelize };
export default db;