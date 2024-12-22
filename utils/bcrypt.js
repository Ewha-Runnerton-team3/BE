//비밀번호 암호화 및 비교

import { hash, compare } from 'bcrypt';

// 비밀번호 암호화
async function hashPassword(password) {
  const saltRounds = 10; // 암호화 강도
  const hashedPassword = await hash(password, saltRounds);
  return hashedPassword;
}

// 비밀번호 비교 (입력 비밀번호 vs 해시된 비밀번호)
async function comparePassword(plainPassword, hashedPassword) {
  const isMatch = await compare(plainPassword, hashedPassword);
  return isMatch;
}

export default {
  hashPassword,
  comparePassword,
};
