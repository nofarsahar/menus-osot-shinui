from pdf2image import convert_from_path
import pytesseract
from PIL import Image
from bidi.algorithm import get_display  # Fix RTL Hebrew text
import json
import re

# 📝 PDF file path
PDF_PATH = "march_2025_week_3.pdf"

# 🖼 Convert PDF pages to images
print("📄 Converting PDF to images...")
pages = convert_from_path(PDF_PATH, dpi=300)

def fix_rtl_text(text):
    """Fixes RTL text extracted by OCR for proper readability."""
    return get_display(text)

# 📜 Extract text from all pages
all_text = []
for i, page in enumerate(pages):
    extracted_text = pytesseract.image_to_string(page, lang="heb")
    fixed_text = fix_rtl_text(extracted_text)  # Fix text direction
    all_text.append(fixed_text)

# 💾 Save raw extracted text to JSON for verification
with open("extracted_raw_text.json", "w", encoding="utf-8") as f:
    json.dump(all_text, f, ensure_ascii=False, indent=4)

print("\n✅ Raw text saved in extracted_raw_text.json for verification!")

# 🎯 Step 1: Filter out irrelevant pages
skip_pages = ["Example Products", "Carb Substitutes", "Fruits"]
filtered_text = [text for text in all_text if not any(skip in text for skip in text)]

if len(filtered_text) < 3:
    print("\n⚠ Not enough relevant pages after filtering! Here is what remains:")
    for i, text in enumerate(filtered_text):
        print(f"\n📜 **Page {i+1} (After Filtering):**")
        print(text[:500])  # Display first 500 characters for debugging
    exit()

# 📋 Step 2: Identify potential recipe names from pages 1-3 (for later category matching)
potential_categories = []
for i in range(3):
    potential_categories.extend([line.strip() for line in filtered_text[i].split("\n") if line.strip()])

print("\n🔍 Potential Recipe Mentions in First 3 Pages (For Category Matching):")
for recipe in potential_categories:
    print(f"🔹 {recipe}")

# 📖 Step 3: Extract structured recipe data
recipes = []
current_recipe = None
inside_ingredients = False
inside_instructions = False

for text in filtered_text[3:]:  # Start from page 4 since first three pages are just references
    lines = text.split("\n")
    
    for line in lines:
        line = line.strip()

        # ✅ Identify recipe title (usually the largest text)
        if re.match(r"^[א-ת ]+$", line) and len(line) > 3 and not inside_ingredients and not inside_instructions:
            if current_recipe:
                recipes.append(current_recipe)  # Save the previous recipe
            current_recipe = {"title": line, "ingredients": [], "instructions": []}
            inside_ingredients = False
            inside_instructions = False
            print(f"\n📌 Detected Recipe Title: {line}")
            continue

        # 🥕 Identify "Ingredients" section
        if "מצרכים" in line:
            inside_ingredients = True
            inside_instructions = False
            print(f"📌 Ingredients section started for {current_recipe['title']}")
            continue

        # 👨‍🍳 Identify "Preparation" section
        if "אופן הכנה" in line:
            inside_instructions = True
            inside_ingredients = False
            print(f"📌 Preparation section started for {current_recipe['title']}")
            continue

        # 📌 If inside the ingredients list
        if inside_ingredients:
            current_recipe["ingredients"].append(line)

        # 🔥 If inside the preparation steps
        if inside_instructions:
            current_recipe["instructions"].append(line)

# ✅ Save the last detected recipe
if current_recipe:
    recipes.append(current_recipe)

# ✅ Print summary of detected recipes
print("\n✅ Total Recipes Found:", len(recipes))
for recipe in recipes:
    print(f"🔹 {recipe['title']} - {len(recipe['ingredients'])} ingredients, {len(recipe['instructions'])} preparation steps")

# 🔄 Step 4: Match extracted recipes with category references from pages 1-3
categorized_recipes = {"breakfast": [], "lunch": [], "snacks": []}

for recipe in recipes:
    for cat in categorized_recipes:
        if recipe["title"] in potential_categories:
            categorized_recipes[cat].append(recipe)
            break  # Prevent duplicate assignment

# 💾 Save final JSON file with all recipes
output_json = "recipes.json"
with open(output_json, "w", encoding="utf-8") as f:
    json.dump(categorized_recipes, f, ensure_ascii=False, indent=4)

print(f"\n✅ Recipe file successfully created: {output_json}")
