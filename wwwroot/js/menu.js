const menuBtn = document.getElementById("menuBtn");
const sidebar = document.getElementById("sidebar");

menuBtn.addEventListener("click", (e) => {
    e.stopPropagation(); // 🔑 evita conflictos
    sidebar.classList.toggle("active");
});