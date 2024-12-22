import { verify } from 'jsonwebtoken';

// 인증 미들웨어
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization; // Authorization 헤더에서 토큰 가져오기
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer TOKEN"에서 TOKEN 추출

  if (!token) {
    return res.status(401).json({ message: '인증 토큰이 없습니다.' });
  }

  try {
    const decoded = verify(token, process.env.JWT_SECRET); // 토큰 검증
    req.user = decoded; // 토큰의 페이로드를 req.user에 저장
    next(); // 다음 미들웨어 또는 컨트롤러로 진행
  } catch (error) {
    return res.status(403).json({ message: '유효하지 않은 토큰입니다.' });
  }
};

export default authenticateToken;