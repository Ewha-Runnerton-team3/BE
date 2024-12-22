import express from 'express';
import cors from 'cors';
import { sequelize } from './models/index.js';
import authRoutes from './routes/authRoutes.js';
import recipeRoutes from './routes/recipeRoutes.js';
import dotenv from 'dotenv';
const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors());
app.use('/auth', authRoutes);
app.use('/recipe', recipeRoutes);
dotenv.config();

//데이터베이스 연결
sequelize.sync({ force: true })
    .then(() => {
        console.log("데이터 베이스 연결 성공")
    })
    .catch((err) => {
        console.log(err);
    });

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`서버가 ${port}번 포트에서 시작되었습니다.`);
});

export default app;