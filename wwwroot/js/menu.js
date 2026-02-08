console.log("JS cargado");

const menuBtn = document.getElementById("menuBtn");
const sidebar = document.getElementById("sidebar");

// Mobile toggle support
if (menuBtn) {
    menuBtn.addEventListener('click', (e) => {
        // Prevent event from bubbling if needed, though usually fine
        e.stopPropagation();
        sidebar.classList.toggle('active');
    });

    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768 &&
            sidebar.classList.contains('active') &&
            !sidebar.contains(e.target) &&
            e.target !== menuBtn) {
            sidebar.classList.remove('active');
        }
    });
}
