document.addEventListener("DOMContentLoaded", async function () {
  const listContainer = document.querySelector(".list-group");
  const searchInput = document.getElementById("search");
  const filterIcon = document.getElementById("filter-icon");
  const backLink = document.getElementById("back-link");

  // שליפת הקטגוריה מה-URL
  const urlParams = new URLSearchParams(window.location.search);
  const category = urlParams.get("category");

  if (backLink) {
    backLink.href = `recipes.html?category=${category || ""}`;
  }

  // יצירת רקע אפור מאחורי הפופ-אפ
  const popupOverlay = document.createElement("div");
  popupOverlay.id = "popup-overlay";
  popupOverlay.style.position = "fixed";
  popupOverlay.style.top = "0";
  popupOverlay.style.left = "0";
  popupOverlay.style.width = "100%";
  popupOverlay.style.height = "100%";
  popupOverlay.style.background = "rgba(0, 0, 0, 0.3)";
  popupOverlay.style.display = "none";
  popupOverlay.style.zIndex = "999";
  document.body.appendChild(popupOverlay);

  // יצירת פופ-אפ
  const popupContainer = document.createElement("div");
  popupContainer.id = "popup-container";
  popupContainer.style.position = "fixed";
  popupContainer.style.top = "50%";
  popupContainer.style.left = "50%";
  popupContainer.style.transform = "translate(-50%, -50%)";
  popupContainer.style.width = "80%";
  popupContainer.style.maxWidth = "500px";
  popupContainer.style.background = "white";
  popupContainer.style.border = "2px solid #814eca";
  popupContainer.style.borderRadius = "10px";
  popupContainer.style.boxShadow = "0 4px 10px rgba(0, 0, 0, 0.3)";
  popupContainer.style.padding = "20px";
  popupContainer.style.display = "none";
  popupContainer.style.zIndex = "1000";
  document.body.appendChild(popupContainer);

  // יצירת כפתור X לסגירה
  const closeButton = document.createElement("span");
  closeButton.innerHTML = "&times;";
  closeButton.style.position = "absolute";
  closeButton.style.top = "0px";
  closeButton.style.left = "5px";
  closeButton.style.fontSize = "24px";
  closeButton.style.cursor = "pointer";
  closeButton.style.color = "#814eca";
  closeButton.style.fontWeight = "bold";

  closeButton.addEventListener("click", function () {
    popupContainer.style.display = "none";
    popupOverlay.style.display = "none";
  });

  popupContainer.appendChild(closeButton);

  // יצירת שדה חיפוש תאריך
  const filterSearch = document.createElement("input");
  filterSearch.type = "text";
  filterSearch.id = "filter-search";
  filterSearch.placeholder = "חיפוש תאריך...";
  filterSearch.style.width = "100%";
  filterSearch.style.padding = "10px";
  filterSearch.style.border = "2px solid #814eca";
  filterSearch.style.borderRadius = "8px";
  filterSearch.style.fontSize = "16px";
  popupContainer.appendChild(filterSearch);

  // אזור לבחירת תאריכים
  const dateFiltersDiv = document.createElement("div");
  dateFiltersDiv.id = "date-filters";
  dateFiltersDiv.style.marginTop = "10px";
  popupContainer.appendChild(dateFiltersDiv);

  // יצירת כפתור אישור סינון
  const applyFilterButton = document.createElement("button");
  applyFilterButton.innerText = "אישור";
  applyFilterButton.style.background = "#814eca";
  applyFilterButton.style.color = "white";
  applyFilterButton.style.border = "none";
  applyFilterButton.style.padding = "10px 15px";
  applyFilterButton.style.borderRadius = "5px";
  applyFilterButton.style.cursor = "pointer";
  applyFilterButton.style.display = "block";
  applyFilterButton.style.margin = "10px auto 0";
  popupContainer.appendChild(applyFilterButton);

  let allRecipes = [];

  async function loadRecipes() {
    const jsonFiles = [
      "data/recipes_feb_2021_week_1.json",
      "data/recipes_mar_2025_week_3.json",
      "data/recipes_mar_2025_week_4.json",
    ];

    for (let file of jsonFiles) {
      try {
        let response = await fetch(file);
        if (!response.ok) throw new Error(`Error loading ${file}`);
        let data = await response.json();
        if (data.recipes) allRecipes = allRecipes.concat(data.recipes);
      } catch (error) {
        console.error(`Error loading ${file}:`, error);
      }
    }

    // סינון לפי קטגוריה
    if (category) {
      allRecipes = allRecipes.filter(
        (recipe) =>
          recipe.category &&
          recipe.category.toLowerCase() === category.toLowerCase()
      );
    }

    createDateFilters(allRecipes);
    displayRecipes(allRecipes);
  }

  function createDateFilters(recipes) {
    const uniqueDates = [...new Set(recipes.map((recipe) => recipe.date))];
    dateFiltersDiv.innerHTML = "";

    uniqueDates.forEach((date) => {
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.value = date;
      checkbox.classList.add("date-checkbox");

      const label = document.createElement("label");
      label.appendChild(checkbox);
      label.append(` ${date}`);
      label.style.display = "block";
      label.style.marginBottom = "5px";

      dateFiltersDiv.appendChild(label);
    });

    // הוספת חיפוש תאריכים
    filterSearch.addEventListener("input", function () {
      let filterText = this.value.toLowerCase();
      let labels = dateFiltersDiv.querySelectorAll("label");

      labels.forEach((label) => {
        label.style.display = label.innerText.toLowerCase().includes(filterText)
          ? "block"
          : "none";
      });
    });
  }

  function displayRecipes(recipes) {
    listContainer.innerHTML = "";
    if (recipes.length === 0) {
      listContainer.innerHTML =
        "<li class='list-group-item text-center'>אין מתכונים זמינים</li>";
      return;
    }

    recipes.sort((a, b) => a.title.localeCompare(b.title, "he"));

    // אם מדובר בארוחת צהריים - מחלקים לפי תת קטגוריה
    if (category === "lunch") {
      // יצירת כותרות ואיזורים
      const proteinTitle = document.createElement("h3");
      proteinTitle.textContent = "חלבון";
      proteinTitle.className = "category-title";

      const proteinList = document.createElement("ul");
      proteinList.className = "list-group";

      const carbsTitle = document.createElement("h3");
      carbsTitle.textContent = "פחמימה";
      carbsTitle.className = "category-title";

      const carbsList = document.createElement("ul");
      carbsList.className = "list-group";

      recipes.forEach((recipe) => {
        const item = document.createElement("li");
        item.classList.add("list-group-item", "cursor-pointer");
        item.textContent = recipe.title;
        item.setAttribute("data-date", recipe.date);
        item.onclick = () =>
          (window.location.href = `recipe.html?id=${recipe.id}&category=${category}`);

        if (recipe.subcategory === "protein") {
          proteinList.appendChild(item);
        } else if (recipe.subcategory === "carbs") {
          carbsList.appendChild(item);
        }
      });

      listContainer.appendChild(proteinTitle);
      listContainer.appendChild(proteinList);
      listContainer.appendChild(carbsTitle);
      listContainer.appendChild(carbsList);
    } else {
      // תצוגה רגילה
      recipes.forEach((recipe) => {
        const item = document.createElement("li");
        item.classList.add("list-group-item", "cursor-pointer");
        item.textContent = recipe.title;
        item.setAttribute("data-date", recipe.date);
        item.onclick = () =>
          (window.location.href = `recipe.html?id=${recipe.id}&category=${category}`);
        listContainer.appendChild(item);
      });
    }
  }

  function applyDateFilter() {
    let selectedDates = Array.from(
      document.querySelectorAll(".date-checkbox:checked")
    ).map((checkbox) => checkbox.value);

    if (selectedDates.length > 0) {
      const filteredRecipes = allRecipes.filter((recipe) =>
        selectedDates.includes(recipe.date)
      );
      displayRecipes(filteredRecipes);
    } else {
      displayRecipes(allRecipes);
    }

    popupContainer.style.display = "none";
    popupOverlay.style.display = "none";
  }

  applyFilterButton.addEventListener("click", function () {
    applyDateFilter();
  });

  filterIcon.addEventListener("click", function () {
    popupContainer.style.display = "block";
    popupOverlay.style.display = "block";
  });

  setTimeout(() => {
    popupContainer.style.top = "50%";
    popupContainer.style.left = "50%";
    popupContainer.style.transform = "translate(-50%, -50%)";
  }, 50);

  loadRecipes();
});
