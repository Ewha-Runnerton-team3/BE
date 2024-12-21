//로그인, 회원가입 로직
import { hash, compare } from 'bcrypt';
import { generateToken, verifyToken } from '../utils/jwt.js';
import UserModel from '../models/user.js';
import { sequelize } from '../models/index.js';

const User = UserModel(sequelize);

// 카카오 로그인 또는 회원가입 처리
async function loginOrSignupKakaoUser(kakaoUserInfo) {
  const { id: kakaoId, kakao_account } = kakaoUserInfo;

  const nickname = kakao_account.profile.nickname? kakao_account.profile.nickname: null;

  try {
    let user = await User.findOne({ where: { loginId: kakaoId } });
    if (!user) {
      user = await User.create({ loginId: kakaoId, nickname, password: ' '});
    }
    const token = generateToken({ id: user.id, loginId: user.loginId, nickname: user.nickname });
    return { user, token };
  } catch (error) {
    console.error('카카오 로그인/회원가입 에러:', error);
    throw new Error('카카오 로그인/회원가입 처리 중 오류가 발생했습니다.');
  }
}

// 일반 회원가입 처리
async function signupUser({ loginId, nickname, password }) {
  
  try {
    const existingUser = await User.findOne({ where: { loginId } });
    if (existingUser) {
      throw new Error('이미 존재하는 아이디입니다.');
    }
    if (password.length < 8) {
      throw new Error('비밀번호는 8자 이상이어야 합니다.');
    }

    const hashedPassword = await hash(password, 10);

    const user = await User.create({
      loginId,
      nickname,
      password: hashedPassword,
    });

    const token = generateToken({ id: user.id, loginId: user.loginId });
    return { user, token };
  }catch (error) {
    console.error('회원가입 에러:', error);
    throw error;
  }
}

// 일반 로그인 처리
async function loginUser({ loginId, password }) {
  try {
    const user = await User.findOne({ where: { loginId } });

    console.log('조회된 사용자:', user ? user.toJSON() : null);

    if (!user) {
      throw new Error('존재하지 않는 사용자입니다.');
    }
    const isPasswordValid = user.password ? await compare(password, user.password) : false;
    console.log('입력된 비밀번호:', password);                //디버깅용
    console.log('비밀번호 일치 여부:', isPasswordValid);
    
    if (!isPasswordValid) {
      throw new Error('비밀번호가 올바르지 않습니다.');
    }
    const token = generateToken({ id: user.id, loginId: user.loginId, nickname: user.nickname });
    return { user, token };
  } catch (error) {
    console.error('로그인 에러:', error);
    throw error;
  }
}

export{
  loginOrSignupKakaoUser,
  signupUser,
  loginUser,
};
