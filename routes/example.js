import { Router } from 'express';

const router = Router();
router.get('/', async(req, res) => {
    console.log("Hello World");
    res.send("Hello World"); // 클라이언트에 응답 전송
});

export default router;