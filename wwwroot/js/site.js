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

            // Microphone Logic
            const micBtn = document.getElementById('mic-btn');
            const micIcon = document.getElementById('mic-icon');
            let recognition;
            let isRecording = false;

            if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
                const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
                recognition = new SpeechRecognition();
                recognition.lang = 'es-ES';
                recognition.continuous = true;
                recognition.interimResults = false;

                recognition.onresult = (event) => {
                    const transcript = event.results[event.results.length - 1][0].transcript;
                    widgetInput.value += (widgetInput.value ? ' ' : '') + transcript;
                };

                recognition.onerror = (event) => {
                    console.error('Speech recognition error', event.error);
                    isRecording = false;
                    micIcon.src = '/images/micon.png';
                };

                // Reset UI if it stops automatically (except manual stop which we handle)
                recognition.onend = () => {
                    if (isRecording) {
                        isRecording = false;
                        micIcon.src = '/images/micon.png';
                    }
                };

                if (micBtn) {
                    micBtn.addEventListener('click', () => {
                        if (isRecording) {
                            recognition.stop();
                            isRecording = false;
                            micIcon.src = '/images/micon.png';
                        } else {
                            recognition.start();
                            isRecording = true;
                            micIcon.src = '/images/micoff.png';
                        }
                    });
                }
            } else {
                if (micBtn) micBtn.style.display = 'none';
                console.log('Web Speech API not supported.');
            }

            // Sound Logic
            const soundBtn = document.getElementById('sound-btn');
            const soundIcon = document.getElementById('sound-icon');
            let isSoundOn = true;

            if (soundBtn && soundIcon) {
                soundBtn.addEventListener('click', () => {
                    isSoundOn = !isSoundOn;
                    soundIcon.src = isSoundOn ? '/images/soundon.png' : '/images/soundoff.png';
                });
            }

            async function playTTS(text) {
                if (!isSoundOn) return;

                try {
                    const response = await fetch('https://api.fish.audio/v1/tts', {
                        method: 'POST',
                        headers: {
                            'Authorization': 'Bearer ',//pegar api de fish.audio
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            text: text,
                            reference_id: '8ef4a238714b45718ce04243307c57a7',
                            format: 'mp3',
                            mp3_bitrate: 128
                        })
                    });

                    if (!response.ok) {
                        console.error('TTS API error:', await response.text());
                        return;
                    }

                    const blob = await response.blob();
                    const url = URL.createObjectURL(blob);
                    const audio = new Audio(url);
                    audio.play();
                } catch (error) {
                    console.error('TTS Error:', error);
                }
            }

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

                    // Play TTS
                    await playTTS(data.response);

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
