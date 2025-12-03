// Please see documentation at https://learn.microsoft.com/aspnet/core/client-side/bundling-and-minification
// for details on configuring this project to bundle and minify static web assets.

// Write your JavaScript code.

document.addEventListener('DOMContentLoaded', function () {
    // --- Carousel Logic ---
    const slideContainer = document.querySelector('.carousel-slide');
    const slides = document.querySelectorAll('.carousel-slide img');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    if (slideContainer && slides.length > 0) {
        let currentIndex = 0;
        const totalSlides = slides.length;
        const intervalTime = 6000; // 4 seconds
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
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                nextSlide();
                stopAutoScroll();
                startAutoScroll();
            });
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                prevSlide();
                stopAutoScroll();
                startAutoScroll();
            });
        }

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
    }

    // --- Chat Logic (Full Page) ---
    const chatInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const chatHistory = document.getElementById('chat-history');

    if (chatInput && sendBtn && chatHistory) {
        sendBtn.addEventListener('click', sendMessage);
        chatInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });

        async function sendMessage() {
            const message = chatInput.value.trim();
            if (!message) return;

            // Add user message
            appendMessage(message, 'user-message');
            chatInput.value = '';
            chatInput.disabled = true;
            sendBtn.disabled = true;

            try {
                const response = await fetch('/api/gemini/chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ message: message })
                });

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                const data = await response.json();
                appendMessage(data.response, 'ai-message');
            } catch (error) {
                console.error('Error:', error);
                appendMessage('Lo siento, hubo un error al procesar tu solicitud.', 'ai-message');
            } finally {
                chatInput.disabled = false;
                sendBtn.disabled = false;
                chatInput.focus();
            }
        }

        function appendMessage(text, className) {
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${className}`;

            const contentDiv = document.createElement('div');
            contentDiv.className = 'message-content';
            contentDiv.textContent = text;

            messageDiv.appendChild(contentDiv);
            chatHistory.appendChild(messageDiv);
            chatHistory.scrollTop = chatHistory.scrollHeight;
        }
    }

    // --- Chat Widget Logic ---
    const widgetContainer = document.getElementById('chat-widget-container');
    const toggleBtn = document.getElementById('chat-toggle-btn');
    const closeBtn = document.getElementById('close-chat-btn');
    const widgetInput = document.getElementById('widget-user-input');
    const widgetSendBtn = document.getElementById('widget-send-btn');
    const widgetHistory = document.getElementById('widget-chat-history');

    if (widgetContainer && toggleBtn && closeBtn) {
        // Toggle Widget
        toggleBtn.addEventListener('click', () => {
            widgetContainer.classList.add('open');
            widgetContainer.style.display = 'flex';
            if (widgetInput) widgetInput.focus();
        });

        closeBtn.addEventListener('click', () => {
            widgetContainer.classList.remove('open');
            setTimeout(() => {
                widgetContainer.style.display = 'none';
            }, 300); // Match animation duration
        });

        // Chat Logic for Widget
        if (widgetInput && widgetSendBtn && widgetHistory) {
            widgetSendBtn.addEventListener('click', sendWidgetMessage);
            widgetInput.addEventListener('keypress', function (e) {
                if (e.key === 'Enter') {
                    sendWidgetMessage();
                }
            });

            async function sendWidgetMessage() {
                const message = widgetInput.value.trim();
                if (!message) return;

                // Add user message
                appendWidgetMessage(message, 'user-message');
                widgetInput.value = '';
                widgetInput.disabled = true;
                widgetSendBtn.disabled = true;

                try {
                    const response = await fetch('/api/gemini/chat', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ message: message })
                    });

                    if (!response.ok) {
                        const errorText = await response.text();
                        throw new Error(`Error del servidor: ${errorText}`);
                    }

                    const data = await response.json();
                    appendWidgetMessage(data.response, 'ai-message');
                } catch (error) {
                    console.error('Error:', error);
                    appendWidgetMessage(`Error: ${error.message}`, 'ai-message');
                } finally {
                    widgetInput.disabled = false;
                    widgetSendBtn.disabled = false;
                    widgetInput.focus();
                }
            }

            function appendWidgetMessage(text, className) {
                const messageDiv = document.createElement('div');
                messageDiv.className = `message ${className}`;

                const contentDiv = document.createElement('div');
                contentDiv.className = 'message-content';
                contentDiv.textContent = text;

                messageDiv.appendChild(contentDiv);
                widgetHistory.appendChild(messageDiv);
                widgetHistory.scrollTop = widgetHistory.scrollHeight;
            }
        }
    }
});
