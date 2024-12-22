import { Router } from 'express';
import getImage from '../services/kakaoImageService.js';

const router = Router();

router.get('/image', async (req, res) => {
  const { query } = req.query; // 클라이언트에서 검색어 입력 받음-일단 이렇게 해놓음
  try {
    const image = await getImage(query);
    res.status(200).json(image);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
