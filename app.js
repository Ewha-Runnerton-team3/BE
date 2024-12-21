import express from 'express';
import cors from 'cors';
import { sequelize } from './models/index.js';

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors());

//데이터베이스 연결
sequelize.sync({ force: true })
    .then(() => {
        console.log("데이터 베이스 연결 성공")
    })
    .catch((err) => {
        console.log(err);
    });


//라우터
