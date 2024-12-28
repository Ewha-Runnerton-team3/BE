import { Router } from 'express';
import axios from 'axios';
import qs from 'querystring';
import { loginOrSignupKakaoUser, signupUser, loginUser } from '../services/authService.js'; // 서비스 호출
import jwtUtils from '../utils/jwt.js';
const router = Router();


const kakao = {
    CLIENT_ID: process.env.REST_API_KEY,
    REDIRECT_URI: process.env.REDIRECT_URI,
  };


const blacklist = new Set();


// 카카오 로그인 요청 처리
router.get('/kakao', (req, res) => {
    const KAKAO_AUTH_URL = `https://kauth.kakao.com/oauth/authorize?client_id=${kakao.CLIENT_ID}&redirect_uri=${kakao.REDIRECT_URI}&response_type=code`;
    res.redirect(KAKAO_AUTH_URL);
});
  
router.get('/kakao/callback', async (req, res) => {
    try {
      const tokenResponse = await axios({
        method: 'POST',
        url: 'https://kauth.kakao.com/oauth/token',
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
        },
        data: qs.stringify({
          grant_type: 'authorization_code',
          client_id: kakao.CLIENT_ID,
          redirect_uri: kakao.REDIRECT_URI,
          code: req.query.code,
        }),
      });
  
      const accessToken = tokenResponse.data.access_token;
      console.log('Access Token:', accessToken);
  
      const userResponse = await axios({
        method: 'GET',
        url: 'https://kapi.kakao.com/v2/user/me',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
  
      const kakaoUserInfo = {
        id: userResponse.data.id.toString(),
        kakao_account: userResponse.data.kakao_account,
      };
  
      const { user, token } = await loginOrSignupKakaoUser(kakaoUserInfo);

      // JWT 토큰을 HttpOnly 쿠키에 저장
      res.cookie('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV,
        sameSite: 'strict',
        maxAge: 3600000 // 1시간
      });

      // 클라이언트 리다이렉션 URL (프론트엔드 주소로 변경해야 함)
      const clientRedirectUrl = `http://localhost:5173/?token=${encodeURIComponent(token)}&loginId=${encodeURIComponent(user.loginId)}&nickname=${encodeURIComponent(user.nickname)}`;

      // 클라이언트로 리다이렉션
      res.redirect(clientRedirectUrl);

    } catch (error) {
      console.error('카카오 로그인 에러:', error);
      console.error(error.message);
      console.error('Error getting Kakao token:', error.response ? error.response.data : error.message);
      res.status(500).json({ message: '카카오 로그인 처리 중 오류가 발생했습니다.',
        data: error.data,
       });
    }
  });

// 일반 회원가입 요청 처리
router.post('/signup', async (req, res) => {
  try {
    const { loginId, nickname, password } = req.body;
    
    const user = await signupUser({ loginId, nickname, password });
     // 토큰 생성
     const token = jwtUtils.generateToken({ id: user.id, loginId: user.loginId });

    res.status(201).json({ user, token }); // 성공 응답
  } catch (error) {
    res.status(500).json({ message: error.message }); // 에러 응답
  }
});

// 일반 로그인 요청 처리
router.post('/login', async (req, res) => {
  try {
    const { loginId, password } = req.body;
    if (!loginId || !password) {
      return res.status(400).json({ message: 'loginId와 password를 모두 제공해야 합니다.' });
    }
    const { user, token } = await loginUser({ loginId, password });

    // 쿠키 설정
    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'None',
      secure: true, // SameSite='None'을 사용할 때는 반드시 Secure 플래그도 설정해야 합니다.
      maxAge: 3600000
    });

    res.status(200).json({ user, token }); // 성공 응답
  } catch (error) {
    res.status(401).json({ message: error.message }); // 에러 응답
  }
});


router.post('/logout', (req, res) => {
  // JWT 로그아웃 처리
  const token = req.headers.authorization?.split(' ')[1];
  if (token) {
    blacklist.add(token); // 토큰 블랙리스트 추가
  }
  
  // 쿠키 로그아웃 처리 (예: 카카오 로그인 세션)
  res.clearCookie('token');

  res.status(200).json({ 
    success: true, 
    message: '모든 로그아웃 처리가 완료되었습니다.' 
  });
});


export default router;
