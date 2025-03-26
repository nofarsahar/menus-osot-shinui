document.addEventListener("DOMContentLoaded", async function () {
  const listContainer = document.querySelector(".list-group"); // Container for displaying recipes
  const searchInput = document.getElementById("search"); // Search input field
  const category = new URLSearchParams(window.location.search).get("category"); // Get category from URL

  // List of JSON files to load
  const jsonFiles = [
    "data/recipes_feb_2021_week_1.json",
    "data/recipes_mar_2025_week_3.json",
  ];

  async function loadRecipes() {
    let allRecipes = [];

    // Load all recipe JSON files
    for (let file of jsonFiles) {
      try {
        console.log(`Loading file: ${file}`);
        let response = await fetch(file);
        if (!response.ok) throw new Error(`Error loading ${file}`);
        let data = await response.json();

        if (data.recipes && Array.isArray(data.recipes)) {
          allRecipes = allRecipes.concat(data.recipes);
        } else {
          console.warn(`File ${file} is not in the expected format`, data);
        }
      } catch (error) {
        console.error(`Error loading ${file}:`, error);
      }
    }

    console.log("All loaded recipes:", allRecipes);

    // Filter recipes by category if specified
    if (category) {
      allRecipes = allRecipes.filter((recipe) => {
        if (!recipe) {
          console.warn("Skipping undefined recipe");
          return false;
        }
        return (
          recipe.category &&
          recipe.category.toLowerCase() === category.toLowerCase()
        );
      });
    }

    displayRecipes(allRecipes);
  }

  function displayRecipes(recipes) {
    listContainer.innerHTML = ""; // Clear previous list

    if (recipes.length === 0) {
      listContainer.innerHTML =
        "<li class='list-group-item text-center'>אין מתכונים זמינים</li>";
      return;
    }

    // Sort recipes alphabetically by title
    recipes.sort((a, b) => a.title.localeCompare(b.title, "he"));

    // Populate the list with recipes (ONLY SHOW TITLE)
    recipes.forEach((recipe) => {
      let item = document.createElement("li");
      item.classList.add("list-group-item", "cursor-pointer");
      item.textContent = recipe.title;
      item.onclick = () =>
        (window.location.href = `recipe.html?id=${recipe.id}`);
      listContainer.appendChild(item);
    });
  }

  await loadRecipes(); // Call function to load recipes

  // Search filter
  searchInput?.addEventListener("input", function () {
    let filter = this.value.toLowerCase();
    let items = document.querySelectorAll(".list-group-item");
    items.forEach((item) => {
      let text = item.innerText.toLowerCase();
      item.style.display = text.includes(filter) ? "" : "none";
    });
  });
});
