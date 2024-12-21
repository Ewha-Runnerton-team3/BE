import { DataTypes } from 'sequelize';

const UserModel = (sequelize) => {
    const User = sequelize.define('User', {
        id: {
            type: DataTypes.BIGINT.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        loginId: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        nickname: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        password:{
            type: DataTypes.STRING,
            allowNull: false,
        }
    },
    {
        timestamps: true,
        tableName: 'users',
    });
    return User;
};

export default UserModel;