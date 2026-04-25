const addTab = document.getElementById("addTab");
const settingsTab = document.getElementById("settingsTab");

const addSection = document.getElementById("addSection");
const settingsSection = document.getElementById("settingsSection");

addTab.addEventListener("click", () => {
    addSection.style.display = "block";
    settingsSection.style.display = "none";
});

settingsTab.addEventListener("click", () => {
    addSection.style.display = "none";
    settingsSection.style.display = "block";
});