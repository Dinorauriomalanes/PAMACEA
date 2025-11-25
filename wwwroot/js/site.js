// Please see documentation at https://learn.microsoft.com/aspnet/core/client-side/bundling-and-minification
// for details on configuring this project to bundle and minify static web assets.

// Write your JavaScript code.

document.addEventListener('DOMContentLoaded', function () {
    const slideContainer = document.querySelector('.carousel-slide');
    const slides = document.querySelectorAll('.carousel-slide img');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    if (!slideContainer || slides.length === 0) return;

    let currentIndex = 0;
    const totalSlides = slides.length;
    const intervalTime = 4000; // 4 seconds
    let slideInterval;

    function showSlide(index) {
        if (index >= totalSlides) {
            currentIndex = 0;
        } else if (index < 0) {
            currentIndex = totalSlides - 1;
        } else {
            currentIndex = index;
        }
        const offset = -currentIndex * 100;
        slideContainer.style.transform = `translateX(${offset}%)`;
    }

    function nextSlide() {
        showSlide(currentIndex + 1);
    }

    function prevSlide() {
        showSlide(currentIndex - 1);
    }

    function startAutoScroll() {
        slideInterval = setInterval(nextSlide, intervalTime);
    }

    function stopAutoScroll() {
        clearInterval(slideInterval);
    }

    // Event Listeners
    nextBtn.addEventListener('click', () => {
        nextSlide();
        stopAutoScroll();
        startAutoScroll();
    });

    prevBtn.addEventListener('click', () => {
        prevSlide();
        stopAutoScroll();
        startAutoScroll();
    });

    // Click on image to open link
    slides.forEach(slide => {
        slide.addEventListener('click', () => {
            const link = slide.getAttribute('data-link');
            if (link) {
                window.open(link, '_blank');
            }
        });
    });

    // Start auto-scroll
    startAutoScroll();
});
