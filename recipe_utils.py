import re
import unicodedata

def normalize_title(title):
    title = title.strip().lower()
    title = unicodedata.normalize("NFKD", title)
    title = re.sub(r"[^\w\s]", "", title)
    title = re.sub(r"\s+", " ", title)
    return title

def deduplicate_recipes_with_log(recipes):
    seen_ids = set()
    seen_titles = set()
    unique_recipes = []
    duplicates = []

    for recipe in recipes:
        recipe_id = recipe.get("id")
        title_key = normalize_title(recipe.get("title", ""))

        if recipe_id in seen_ids or title_key in seen_titles:
            duplicates.append(recipe)
        else:
            seen_ids.add(recipe_id)
            seen_titles.add(title_key)
            unique_recipes.append(recipe)

    return unique_recipes, duplicates