import React, { useState, useEffect } from 'react';

function App() {
  const [menu, setMenu] = useState('');
  const [recipe, setRecipe] = useState(null);
  const [error, setError] = useState(null);
  const [savedRecipes, setSavedRecipes] = useState([]);

  const userId = 1; // 테스트용 사용자 ID

  const fetchRecipe = async () => {
    setError(null);
    try {
      const response = await fetch('http://localhost:3001/api/recipes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          menu,
          userId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch recipe');
      }

      const data = await response.json();
      setRecipe(data.recipe);
    } catch (err) {
      setError(err.message);
    }
  };

  const saveRecipe = async () => {
    setError(null);
    if (!recipe) {
      alert('먼저 레시피를 생성하세요.');
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/recipes/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          recipeId: recipe.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save recipe');
      }

      alert('레시피가 저장되었습니다.');
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchSavedRecipes = async () => {
    setError(null);
    try {
      const response = await fetch(`http://localhost:3001/api/recipes/saved/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch saved recipes');
      }

      const data = await response.json();
      setSavedRecipes(data.recipes);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchSavedRecipes(); // 앱 시작 시 저장된 레시피 불러오기
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>레시피 추천</h1>
      <div>
        <input
          type="text"
          value={menu}
          onChange={(e) => setMenu(e.target.value)}
          placeholder="메뉴 이름을 입력하세요"
          style={{
            padding: '10px',
            fontSize: '16px',
            width: '300px',
            marginRight: '10px',
          }}
        />
        <button
          onClick={fetchRecipe}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          레시피 가져오기
        </button>
        <button
          onClick={saveRecipe}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginLeft: '10px',
          }}
        >
          레시피 저장
        </button>
      </div>
      {error && <p style={{ color: 'red', marginTop: '20px' }}>{error}</p>}
      {recipe && (
        <div style={{ marginTop: '20px' }}>
          <h2>레시피: {recipe.name}</h2>
          <p>
            <strong>전체 소요시간:</strong> {recipe.totalTime}
          </p>
          <p>
            <strong>조리 난이도:</strong> {recipe.difficultyScore}
          </p>
          <h3>재료:</h3>
          <ul>
            {recipe.ingredients.map((ingredient, index) => (
              <li key={index}>
                {ingredient.ingredient} - {ingredient.quantity}
              </li>
            ))}
          </ul>
          <h3>조리 방법:</h3>
          <ol>
            {recipe.steps.map((step) => (
              <li key={step.id}>{step.step}</li>
            ))}
          </ol>
        </div>
      )}
      <h2>저장된 레시피</h2>
      <ul>
        {savedRecipes.map((savedRecipe) => (
          <li key={savedRecipe.id}>
            <strong>{savedRecipe.name}</strong> - {savedRecipe.totalTime}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;