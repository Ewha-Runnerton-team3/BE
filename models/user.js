import { Model, DataTypes } from 'sequelize';
import { sequelize } from '.';

module.exports = (sequelize) => {
    class User extends Model{
        static associate(models){
            //모델 간 관계 설정
        }
    }

    User.init(
    {
        social_id: {
            type: DataTypes.STRING,
        },
        password:{
            type: DataTypes.INTEGER,
            allowNull: false,
        }
    },
    {
        sequelize,
        modelNmae: 'User',
        tableName: 'users',
        timestamps: true,
    }
    );
    return User;
}