const dotenv = require('dotenv');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const recipeRoutes = require('./routes/recipeRoutes');
const sequelize = require('./models/sequelize'); 

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS 미들웨어 설정 추가
app.use(cors({
    origin: 'http://localhost:3000', // React 앱 주소
    methods: 'GET,POST', // 허용할 HTTP 메서드
    credentials: true, // 쿠키 공유를 활성화할 경우
}));

// Middleware 설정
app.use(bodyParser.json());

// 라우터 설정
app.use('/api/recipes', recipeRoutes);

// 기본 엔드포인트
app.get('/', (req, res) => {
    res.send('Welcome to the Personalized Recipe API!');
});

// 데이터베이스 연결 테스트
sequelize.authenticate()
    .then(() => {
        console.log('Database connected successfully.');
    })
    .catch((err) => {
        console.error('Unable to connect to the database:', err);
    });


// 서버 실행
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});