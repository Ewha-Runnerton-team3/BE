import express from "express";
import { getRecipe } from "../services/recipeService.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { menu } = req.query;
    if (!menu) {
      return res.status(400).json({ error: "메뉴 이름을 입력하세요." });
    }

    const recipe = await getRecipe(menu);
    return res.json(recipe);
  } catch (error) {
    console.error("레시피 요청 오류:", error);
    return res.status(500).json({ error: error.message });
  }
});

export default router;