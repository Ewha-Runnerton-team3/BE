from flask import Flask, request, jsonify
from flask_cors import CORS  
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

app = Flask(__name__)
CORS(app)  

# CSV 데이터 로드
file_path = "./utils/TB_RECIPE_SEARCH_241226.csv"
df = pd.read_csv(file_path, encoding="utf-8")

# 필요한 컬럼만 추출 (레시피 제목, 재료)
df = df[['RCP_TTL', 'CKG_MTRL_CN']].dropna()

# 텍스트 정제 (불필요한 문자 제거)
df['CKG_MTRL_CN'] = df['CKG_MTRL_CN'].str.replace(r'\[재료\]|\d+|\|', '', regex=True)

# TF-IDF 벡터 변환기 생성
vectorizer = TfidfVectorizer()
ingredient_vectors = vectorizer.fit_transform(df["CKG_MTRL_CN"])  # 모든 레시피의 재료를 벡터화

def find_top_recipes(user_ingredients, top_n=3):
    """사용자가 입력한 재료 리스트와 가장 유사한 상위 N개 레시피를 찾음"""
    user_query = " ".join(user_ingredients)  # 사용자 입력을 문자열로 변환
    user_vector = vectorizer.transform([user_query])  # 사용자 입력을 벡터로 변환

    # 코사인 유사도 계산
    similarities = cosine_similarity(user_vector, ingredient_vectors).flatten()

    # 상위 top 3개 인덱스 가져오기
    top_indices = similarities.argsort()[-top_n:][::-1]  # 유사도가 높은 순으로 정렬

    # 상위 추천 레시피 리스트 반환
    top_recipes = []
    for idx in top_indices:
        top_recipes.append({
            "recipe_title": df.iloc[idx]["RCP_TTL"],
            "ingredients": df.iloc[idx]["CKG_MTRL_CN"]
        })

    return top_recipes

# Flask API 엔드포인트 설정
@app.route("/recommend", methods=["POST"])
def recommend():
    """사용자가 입력한 재료 리스트를 기반으로 가장 유사한 상위 3개 레시피 추천"""
    data = request.get_json()
    user_ingredients = data.get("ingredients", [])

    if not user_ingredients:
        return jsonify({"error": "재료 목록이 비어 있습니다."}), 400

    top_recipes = find_top_recipes(user_ingredients, top_n=3)
    return jsonify(top_recipes)

# Flask 서버 실행
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
