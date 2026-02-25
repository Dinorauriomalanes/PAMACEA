// Please see documentation at https://learn.microsoft.com/aspnet/core/client-side/bundling-and-minification
// for details on configuring this project to bundle and minify static web assets.

// Write your JavaScript code.

console.log("SofIA: System initialized");
document.addEventListener('DOMContentLoaded', function () {
    console.log("SofIA: DOM Content Loaded");
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

    // Shared State for Widget
    let isSoundOn = true;
    let welcomeRead = false;

    // Helper functions (moved to higher scope for widget)
    function typeWriter(element, text, speed = 30) {
        return new Promise(resolve => {
            let i = 0;
            element.innerHTML = '';
            function type() {
                if (i < text.length) {
                    element.innerHTML += text.charAt(i);
                    i++;
                    widgetHistory.scrollTop = widgetHistory.scrollHeight;
                    setTimeout(type, speed);
                } else {
                    resolve();
                }
            }
            type();
        });
    }

    // Simplified Audio Playback Function
    async function speak(text) {
        if (!isSoundOn) {
            console.log("SofIA: Sound is OFF, skipping speech.");
            return;
        }
        console.log("SofIA: Requesting audio for:", text.substring(0, 30) + "...");
        try {
            const response = await fetch('/api/gemini/tts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: text })
            });

            if (response.ok) {
                const data = await response.json();
                console.log("SofIA: Playing audio from URL:", data.url);
                const audio = new Audio(data.url);
                return audio.play().catch(e => console.error("SofIA: Play error:", e));
            } else {
                console.error("SofIA: TTS Server Error");
            }
        } catch (e) {
            console.error("SofIA: Network error during TTS", e);
        }
    }

    if (widgetContainer && toggleBtn && closeBtn) {
        // Toggle Widget
        toggleBtn.addEventListener('click', async () => {
            widgetContainer.classList.add('open');
            widgetContainer.style.display = 'flex';
            if (widgetInput) widgetInput.focus();

            if (isSoundOn && !welcomeRead) {
                console.log("SofIA: Reading welcome message...");
                welcomeRead = true;
                const welcomeMsg = widgetHistory.querySelector('.ai-message .message-content')?.textContent;
                if (welcomeMsg) {
                    speak(welcomeMsg.trim());
                }
            }
        });

        closeBtn.addEventListener('click', () => {
            widgetContainer.classList.remove('open');
            setTimeout(() => {
                widgetContainer.style.display = 'none';
            }, 300); // Match animation duration
        });

        // Chat Logic for Widget
        if (widgetInput && widgetSendBtn && widgetHistory) {
            widgetSendBtn.addEventListener('click', () => sendWidgetMessage());
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
                    let transcript = event.results[event.results.length - 1][0].transcript;
                    if (transcript.toLowerCase().includes('enviar mensaje') || transcript.toLowerCase().includes('enviar el mensaje')) {
                        const cleanedTranscript = transcript.replace(/enviar mensaje|enviar el mensaje/gi, '').trim();
                        if (cleanedTranscript) widgetInput.value += (widgetInput.value ? ' ' : '') + cleanedTranscript;
                        recognition.stop();
                        isRecording = false;
                        micIcon.src = '/images/micon.png';
                        setTimeout(() => sendWidgetMessage(), 100);
                        return;
                    }
                    widgetInput.value += (widgetInput.value ? ' ' : '') + transcript;
                };

                recognition.onerror = () => {
                    isRecording = false;
                    micIcon.src = '/images/micon.png';
                };

                recognition.onend = () => {
                    isRecording = false;
                    micIcon.src = '/images/micon.png';
                };

                if (micBtn) {
                    micBtn.addEventListener('click', () => {
                        if (isRecording) {
                            recognition.stop();
                        } else {
                            recognition.start();
                            isRecording = true;
                            micIcon.src = '/images/micoff.png';
                        }
                    });
                }
            } else {
                if (micBtn) micBtn.style.display = 'none';
            }

            // Sound Logic
            const soundBtn = document.getElementById('sound-btn');
            const soundIcon = document.getElementById('sound-icon');

            if (soundBtn && soundIcon) {
                soundBtn.addEventListener('click', () => {
                    isSoundOn = !isSoundOn;
                    console.log("SofIA: Sound toggled to:", isSoundOn);
                    soundIcon.src = isSoundOn ? '/images/soundon.png' : '/images/soundoff.png';
                });
            }

            async function sendWidgetMessage() {
                const message = widgetInput.value.trim();
                if (!message) return;

                console.log("SofIA: Sending message, sound is:", isSoundOn);

                // Add user message
                appendWidgetMessage(message, 'user-message');
                widgetInput.value = '';
                widgetInput.disabled = true;
                widgetSendBtn.disabled = true;

                try {
                    const response = await fetch('/api/gemini/chat', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ message: message })
                    });

                    if (!response.ok) throw new Error("Server error");

                    const data = await response.json();
                    console.log("SofIA: AI Response received");

                    const messageContentDiv = appendWidgetMessage('', 'ai-message');

                    // Typewriter and Audio in parallel to reduce delay
                    console.log("SofIA: Starting typing and speech in parallel...");
                    typeWriter(messageContentDiv, data.response);
                    speak(data.response);

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
                return contentDiv;
            }
        }
    }
    // Global test function for user console
    window.testAudio = async () => {
        console.log("--- STARTING MANUAL AUDIO TEST ---");
        try {
            const testText = "Hola, esta es una prueba de sonido de SofIA.";
            const audio = new Audio();
            console.log("1. Unlocking audio...");
            await audio.play().catch(() => { });
            console.log("2. Fetching test audio...");
            await fetchAudioForLater(testText, audio);
            console.log("3. Audio fetched, playing...");
            await audio.play();
            console.log("--- TEST SUCCESSFUL ---");
            return "Prueba iniciada con éxito";
        } catch (e) {
            console.error("--- TEST FAILED ---", e);
            return "Error en la prueba: " + e.message;
        }
    };
});
//Bearer 5dacd35f0dbc4859942cd25c81e4b7e6