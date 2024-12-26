import pandas as pd
import json
import sys
import io

# CSV 파일 경로
file_path = "menu_data.csv" 

# CSV 파일 읽기 (UTF-8-SIG 처리)
menu_df = pd.read_csv(file_path, encoding="utf-8-sig")

# 중복 데이터 제거
menu_df = menu_df.drop_duplicates(subset=["menu", "ingredients", "cuisine", "method"])

# Menu recommendation function
def recommend_menu(user_ingredients, user_method, user_cuisine, min_match_rate=30):
    recommendations = []
    menu_duplicate_check = set()  # Set to prevent duplicate menus

    for _, row in menu_df.iterrows():
        # Extract menu information
        menu_ingredients = set(row["ingredients"].split(", "))
        menu_method = row["method"]
        menu_cuisine = row["cuisine"]

        # Calculate ingredient match rate
        common_ingredients = menu_ingredients.intersection(set(user_ingredients))
        ingredient_match_rate = (len(common_ingredients) / len(user_ingredients)) * 70 if user_ingredients else 0

        # Method score
        method_score = 15 if menu_method == user_method else 0

        # Cuisine score
        cuisine_score = 15 if menu_cuisine == user_cuisine else 0
        
        # Final match rate calculation
        final_match_rate = ingredient_match_rate + method_score + cuisine_score

        # Apply minimum match rate filter and check for duplicates
        if final_match_rate >= min_match_rate and row["menu"] not in menu_duplicate_check:
            recommendations.append({
                "menu": row["menu"],
                "ingredients": row["ingredients"],
                "method": menu_method,
                "cuisine": menu_cuisine,
                "match_rate (%)": final_match_rate
            })
            menu_duplicate_check.add(row["menu"])  # Add already recommended menu

    # Sort by final match rate
    recommendations = sorted(recommendations, key=lambda x: x["match_rate (%)"], reverse=True)
    return recommendations


# Main execution
def main():
    try:
        input_data = sys.stdin.read()
        input_json = json.loads(input_data)
        print(input_json)
        
        # Extract user input
        user_ingredients = input_json.get("ingredients", [])
        user_method = input_json.get("method", "")
        user_cuisine = input_json.get("cuisine", "")
        
        # Get menu recommendations
        recommendations = recommend_menu(user_ingredients, user_method, user_cuisine, min_match_rate=30)

        # Output results
        if recommendations:
            recommendations_json = json.dumps(recommendations[:3], ensure_ascii=False, indent=4)  # Return top 3
            print(recommendations_json)
        else:
            print(json.dumps({"message": "No menus found meeting the minimum match rate."}, ensure_ascii=False))

    except Exception as e:
        # Return error message if an exception occurs
        print(json.dumps({"error": str(e)}, ensure_ascii=False, indent=4))

        
if __name__ == "__main__":
    main()