import express from 'express';
import cors from 'cors';
import { sequelize } from './models/index.js';
import authRoutes from './routes/authRoutes.js';
import recipeRoutes from './routes/recipeRoutes.js';
import imageRoutes from './routes/imageRoutes.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// 미들웨어 설정
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// 라우트 설정
app.use('/auth', authRoutes);
app.use('/recipe', recipeRoutes);
app.use('/image', imageRoutes);

// 데이터베이스 초기화 (개발 환경에서만)
const initializeDatabase = async () => {
    if (process.env.NODE_ENV) {
        try {
            console.log("개발 환경에서 데이터베이스 초기화를 시작합니다...");
            await sequelize.models.SavedRecipe.drop(); // SavedRecipe 테이블 삭제
            await sequelize.models.Recipe.drop(); // Recipe 테이블 삭제
            await sequelize.sync({ force: true }); // 모든 테이블 다시 생성
            console.log("데이터베이스 초기화 성공");
        } catch (error) {
            console.error("데이터베이스 초기화 실패:", error);
        }
    } else {
        try {
            console.log("데이터베이스 동기화를 시작합니다...");
            await sequelize.sync(); // force: true 없이 동기화
            console.log("데이터베이스 동기화 성공");
        } catch (error) {
            console.error("데이터베이스 동기화 실패:", error);
        }
    }
};

// 서버 시작
const startServer = async () => {
    await initializeDatabase(); // 데이터베이스 초기화 또는 동기화 호출
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
        console.log(`서버가 ${port}번 포트에서 시작되었습니다.`);
    });
};

startServer();

export default app;
