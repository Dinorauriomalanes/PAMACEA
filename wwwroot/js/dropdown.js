document.addEventListener("DOMContentLoaded", function () {

    const dropdownBtn = document.querySelector(".dropdown-button");
    const dropdownMenu = document.querySelector(".dropdown-menu");
    const items = document.querySelectorAll(".dropdown-item");
    const selectedText = document.querySelector(".selected-enfermedad");

    // abrir / cerrar menú
    dropdownBtn.addEventListener("click", function () {
        dropdownMenu.classList.toggle("show");
    });

    items.forEach(item => {
        item.addEventListener("click", function () {

            const enfermedad = this.getAttribute("data-enfermedad");

            // cambiar texto del botón
            selectedText.textContent = this.textContent;

            // ocultar todos los contenidos
            document.querySelectorAll(".estado-content").forEach(content => {
                content.classList.remove("active");
            });

            // mostrar el seleccionado
            const content = document.getElementById("content-" + enfermedad);
            if (content) {
                content.classList.add("active");
            }

            dropdownMenu.classList.remove("show");
        });
    });

});