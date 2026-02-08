console.log("JS cargado");

const menuBtn = document.getElementById("menuBtn");
const sidebar = document.getElementById("sidebar");

menuBtn.addEventListener("click", () => {
    console.log("CLICK");
    sidebar.classList.toggle("active");
});