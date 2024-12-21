const sequelize = require('./sequelize');
const User = require('./User'); // User 모델 불러오기
const Recipe = require('./Recipe'); // Recipe 모델 불러오기
const SavedRecipe = require('./SavedRecipe'); // SavedRecipe 모델 불러오기

(async () => {
    try {
        await sequelize.authenticate(); // 연결 테스트
        console.log('Database connected!');

        // 모든 모델 동기화
        await sequelize.sync({ alter: true }); // 테이블 변경사항 반영 (필요 시 옵션 변경)
        console.log('All models were synchronized successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    } finally {
        process.exit(); // 프로세스 종료
    }
})();