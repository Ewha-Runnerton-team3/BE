import fs from 'fs';
import csvParser from 'csv-parser';
import path from 'path';

let recipes = []; // 전체 레시피 데이터
let ingredientIndex = {}; // 해시 테이블

// CSV 데이터 로드 및 해시 테이블 생성 함수
export const loadMenuData = () => {
    const csvFilePath = path.join(process.cwd(), 'utils', 'menus.csv');
    fs.createReadStream(csvFilePath)
        .pipe(csvParser())
        .on('data', (row) => {
            // 재료를 배열로 변환
            row.ingredients = row.ingredients.split(',');
            recipes.push(row);

            // 해시 테이블 생성
            row.ingredients.forEach((ingredient) => {
                if (!ingredientIndex[ingredient]) {
                    ingredientIndex[ingredient] = [];
                }
                ingredientIndex[ingredient].push(row); // 해당 재료가 포함된 메뉴 추가
            });
        })
        .on('end', () => {
            console.log('CSV 데이터 및 해시 테이블 로드 완료');
        })
        .on('error', (err) => {
            console.error('CSV 파일을 읽는 중 오류 발생:', err.message);
        });
};

export const recommendMenus = (ingredients) => {
    // 입력된 재료로 관련 메뉴 검색
    const matchedMenusSet = new Set(); // 중복 제거를 위해 Set 사용
    ingredients.forEach((ingredient) => {
        if (ingredientIndex[ingredient]) {
            ingredientIndex[ingredient].forEach((menu) => matchedMenusSet.add(menu));
        }
    });

    // Set을 배열로 변환하여 일치율 계산
    const matchedMenus = Array.from(matchedMenusSet).map((menu) => {
        const recipeIngredients = menu.ingredients;
        const intersection = ingredients.filter((ingredient) =>
            recipeIngredients.includes(ingredient)
        );
        const matchRate = intersection.length / recipeIngredients.length; // 일치율 계산

        return {
            menu_name: menu.menu_name,
            ingredients: recipeIngredients,
            calories: menu.calories,
            match_rate: matchRate,
        };
    });

    // 일치율 순으로 정렬 후 상위 3개 선택
    return matchedMenus
        .sort((a, b) => b.match_rate - a.match_rate) // 내림차순 정렬
        .slice(0, 3); // 상위 3개 선택
};
