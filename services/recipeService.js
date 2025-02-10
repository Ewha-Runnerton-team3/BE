import dotenv from "dotenv";
dotenv.config(); // 환경 변수 먼저 로드

import puppeteer from "puppeteer";
import axios from "axios";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_API_KEY = process.env.GROQ_API_KEY;

export async function getRecipe(menu) {
  let browser;
  try {
    browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    const searchUrl = `https://www.10000recipe.com/recipe/list.html?q=${encodeURIComponent(menu)}`;
    await page.goto(searchUrl, { waitUntil: "domcontentloaded" });

    const recipeLink = await page.evaluate(() => {
      const firstRecipe = document.querySelector(".common_sp_link");
      return firstRecipe ? firstRecipe.href : null;
    });

    if (!recipeLink) throw new Error("레시피를 찾을 수 없습니다.");

    await page.goto(recipeLink, { waitUntil: "domcontentloaded" });

    const recipeData = await page.evaluate(() => {
      const title = document.querySelector(".view2_summary h3")?.innerText.trim() || "제목 없음";
      const thumbnail = document.querySelector(".centeredcrop img")?.src || null;
      const finalImage = document.querySelector(".carouItem.centercrop img")?.src || null;

      // 재료 목록 가져오기
      const ingredients = Array.from(document.querySelectorAll(".ingre_list_name")).map((el, index) => {
        const name = el.innerText.trim();
        const quantity = document.querySelectorAll(".ingre_list_ea")[index]?.innerText.trim() || "수량 없음";
        return `${name} (${quantity})`;
      });


      const steps = Array.from(document.querySelectorAll(".view_step_cont")).map(step => {
        const textElement = step.querySelector(".media-body");
        const toolElement = textElement?.querySelector(".step_add.add_tool"); // 불필요한 요소

        // 오븐, 전자레인지 등 불필요한 텍스트 제거
        if (toolElement) toolElement.remove();

        const text = textElement?.innerText.trim() || "단계 정보 없음";

        // 이미지가 있을 경우 가져오기
        const imgElement = step.querySelector(".media-right img");
        const img = imgElement ? imgElement.src : null;

        return { text, img };
      });

      // 추가 정보 (몇인분, 난이도, 조리시간)
        const servingSize = document.querySelector(".view2_summary_info1")?.innerText.trim() || "정보 없음";
        const cookingTime = document.querySelector(".view2_summary_info2")?.innerText.trim() || "정보 없음";
        const difficulty = document.querySelector(".view2_summary_info3")?.innerText.trim() || "정보 없음";

        return { 
            title, 
            thumbnail, 
            finalImage, 
            ingredients, 
            steps, 
            servingSize, 
            difficulty, 
            cookingTime 
          };
    });

    console.log("크롤링된 데이터:", JSON.stringify(recipeData, null, 2));

    await browser.close();
    return await formatRecipe(recipeData, recipeLink);
  } catch (error) {
    console.error("크롤링 오류:", error);
    if (browser) await browser.close();
    throw error;
  }
}

async function formatRecipe(recipe, recipeLink) {
  const minimalRecipe = {
    title: recipe.title,
    steps: recipe.steps.map(step => ({ text: step.text })),
  };

  const stepCount = recipe.steps.length;
  const systemPrompt = `
    You are a text refinement assistant specialized in cooking instructions. 🍳
    Your role is to refine Korean cooking instructions, making them more natural, warm, and friendly while maintaining clarity and accuracy.

    ### 🚨 IMPORTANT RULES 🚨
    - Always respond in **polite and formal Korean (존댓말)**.
    - **DO NOT** add any explanations or comments outside the JSON format.
    - **DO NOT** return anything other than JSON.
    - **DO NOT** merge or split any steps.
    - **DO NOT** omit, shorten, or simplify any cooking steps.
    - Ensure that **each instruction is warm and friendly**, using various emojis and exclamation marks.
    - **Check JSON validity before returning the output.** It must start with '{' and end with '}'.

    ### ✅ Guidelines
    - The **title** should be a general Korean dish name (e.g., "돼지고기 김치찌개").
    (❌ Remove brand names, specific names, and phrases like "really delicious.")
    - Convert **ingredients** into a JSON array.
    - Refine each **step** into **polite, warm, and natural sentences**.
    - Remove unrelated personal remarks (e.g., "I should eat and sleep now," "My child loves this dish").
    `;

   const userPrompt = `
    ### **Recipe Information**
    - **Total Steps:** ${stepCount} (❗ Absolutely DO NOT increase or decrease this number.)

    ### **Recipe Steps to Refine**
    ${JSON.stringify(minimalRecipe.steps, null, 2)}

    ### **Output Example (JSON)**
    {
    "title": "돼지고기 김치찌개",
    "steps": [
            {"text": "돼지고기는 핏물을 빼주세요. 칼로 썰어주면 더욱 빨리 익어요! 😊🍖"},
            {"text": "신 김치는 적당한 크기로 잘라주세요. 김치의 톡 쏘는 맛이 더욱 살아나요! 🌶️🥢"},
            {"text": "냄비에 들기름을 두르고 김치를 볶아주세요. 김치가 노릇노릇해질 때까지 달달 볶으면 감칠맛이 UP! 🔥😋"},
            {"text": "이제 물을 붓고 팔팔 끓여주세요. 국물이 끓으면서 깊은 맛이 우러나올 거예요! 💨🍲"},
            {"text": "뚝배기에 담아 맛있게 즐기세요! 따끈한 밥과 함께 먹으면 정말 최고예요! 🍚🔥😋"}
        ]
    }

    ### 🔍 VERY IMPORTANT
    Before returning the output, **double-check that the response is strictly valid JSON.**  
    Ensure there are **no extra characters, explanations, or markdown formatting**.  
    The response **must start with '{' and end with '}'** without any additional text.
    `;

  try {
    const response = await queryGroq(systemPrompt, userPrompt);
    if (!response || !response.data || !response.data.choices) {
      throw new Error("Invalid response from Groq API");
    }

    let formattedText = response.data.choices[0]?.message?.content?.trim() || "{}";

    formattedText = formattedText.replace(/^```json\s*/i, "").replace(/\s*```$/, "");

    const formattedRecipe = JSON.parse(formattedText);

    return {
      title: formattedRecipe.title || recipe.title,
      thumbnail: recipe.thumbnail,
      finalImage: recipe.finalImage,
      ingredients: recipe.ingredients,
      steps: formattedRecipe.steps?.map((step, index) => ({
        text: step.text,
        img: recipe.steps[index]?.img || null,
      })) || recipe.steps,
      servingSize: recipe.servingSize,  
      difficulty: recipe.difficulty,   
      cookingTime: recipe.cookingTime,  
      recipeLink,
    };
  } catch (error) {
    console.error("Groq API 호출 오류:", error);
    return { ...recipe, recipeLink };
  }
}

async function queryGroq(systemPrompt, userPrompt) {
  try {
    const response = await axios.post(GROQ_API_URL, {
      model: "gemma2-9b-it",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.5,
      max_tokens: 1024,
      top_p: 1,
      stream: false
    }, {
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json"
      }
    });
    return response;
  } catch (error) {
    console.error("Groq API 호출 오류:", error.response ? error.response.data : error.message);
  }
}
