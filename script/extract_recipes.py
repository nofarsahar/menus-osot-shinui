import json
import arabic_reshaper
from bidi.algorithm import get_display

def fix_hebrew_text(text):
    """מתקן את כיווניות הטקסט העברי כך שיופיע נכון"""
    if not text:  # בדיקה אם השדה ריק
        return text
    reshaped_text = arabic_reshaper.reshape(text)  # סידור אותיות עבריות
    fixed_text = get_display(reshaped_text)  # שינוי הכיווניות להצגה נכונה
    return fixed_text

# קריאת הקובץ המקורי
input_file = "march_2025_week_3.pdf"
output_file = "recipes_fixed.json"

try:
    with open(input_file, "r", encoding="utf-8") as f:
        data = json.load(f)

    # מעבר על כל הנתונים ותיקון הטקסטים
    for entry in data:
        if "title" in entry:
            entry["title"] = fix_hebrew_text(entry["title"])
        if "ingredients" in entry:
            entry["ingredients"] = [fix_hebrew_text(ing) for ing in entry["ingredients"]]
        if "instructions" in entry:
            entry["instructions"] = [fix_hebrew_text(inst) for inst in entry["instructions"]]

    # שמירת הקובץ המתוקן
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=4)

    print(f"✅ הקובץ תוקן ונשמר כ- {output_file}")

except Exception as e:
    print(f"❌ שגיאה בעת עיבוד הקובץ: {e}")
