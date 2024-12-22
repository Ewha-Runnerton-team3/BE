import Sequelize from 'sequelize';
import configData from '../config/config.json' assert { type: 'json' };

const env = process.env.NODE_ENV || 'development';
const config = configData[env];
const db = {};

const sequelize = new Sequelize(config.database, config.username, config.password, config);

db.sequelize = sequelize;

export { sequelize };
export default db;
