const messagesContainer = document.getElementById('messages-container');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const loadingScreen = document.getElementById('loading-screen');
const themeToggleBtn = document.getElementById('theme-toggle');

// Theme setup
const THEME_KEY = 'chatbot-theme';
const savedTheme = localStorage.getItem(THEME_KEY);

if (savedTheme === 'dark') {
    document.body.classList.add('theme-dark');
}

// Hide loading screen once the app is ready
window.addEventListener('load', () => {
    if (loadingScreen) {
        loadingScreen.classList.add('hidden');
        setTimeout(() => {
            loadingScreen.remove();
        }, 500);
    }
});

// Theme toggle
if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
        const isDark = document.body.classList.toggle('theme-dark');
        localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light');
    });
}

// Auto-resize textarea
userInput.addEventListener('input', function () {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
});

// Handle send button click
sendBtn.addEventListener('click', handleSendMessage);

// Handle Enter key
userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
    }
});

// Quick prompt buttons
document.addEventListener('click', (e) => {
    const target = e.target.closest('.quick-prompt-btn');
    if (!target) return;
    const promptText = target.getAttribute('data-prompt') || '';
    userInput.value = promptText;
    userInput.focus();
    userInput.dispatchEvent(new Event('input'));
});

// Gemini API Configuration
const GEMINI_API_KEY = "AIzaSyC26zdIv6kP1knYglgWohlVI_6gZyISF8o";
const MODEL = "gemini-2.5-flash"; // Manually set to v2.5 as requested

async function getAIResponse(userText) {
    if (!GEMINI_API_KEY) return "API Key not configured. Please add your key to script.js";

    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: userText }]
                }]
            })
        });

        const data = await response.json();

        if (data.error) {
            return `System Error: ${data.error.message}`;
        }

        if (data.candidates && data.candidates[0].content.parts[0].text) {
            return data.candidates[0].content.parts[0].text;
        }

        return "I processed your request but couldn't generate a specific response. Let's try rephrasing.";
    } catch (error) {
        console.error('Gemini API Error:', error);
        return "Connection interrupted. Please check your network and API configuration.";
    }
}

async function handleSendMessage() {
    const text = userInput.value.trim();
    if (!text) return;

    addMessage(text, 'user');
    userInput.value = '';
    userInput.style.height = 'auto';

    showTypingIndicator();

    const response = await getAIResponse(text);
    removeTypingIndicator();
    addMessage(response, 'ai');
}

function formatMarkdown(text) {
    // Basic Markdown formatting
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>') // Code blocks
        .replace(/`([^`]+)`/g, '<code>$1</code>') // Inline code
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
        .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italics
        .replace(/\n/g, '<br>'); // New lines
}

function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', `${sender}-message`);

    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const formattedText = formatMarkdown(text);

    let contentHtml = `
        <div class="message-content">
            ${sender === 'ai' ? '<div class="ai-burst"></div>' : ''}
            <div>${formattedText}</div>
            <span class="timestamp">${timeString}</span>
        </div>
    `;

    messageDiv.innerHTML = contentHtml;

    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function showTypingIndicator() {
    const indicator = document.createElement('div');
    indicator.id = 'typing-indicator';
    indicator.classList.add('typing-indicator');
    indicator.innerHTML = `
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
    `;
    messagesContainer.appendChild(indicator);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function removeTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) indicator.remove();
}

// Clear Chat Functionality
document.querySelector('.action-btn[title="Clear History"]').addEventListener('click', () => {
    messagesContainer.innerHTML = `
        <div class="message system-date">
            <span>Session Refreshed - ${new Date().toLocaleDateString()}</span>
        </div>
        <div class="message ai-message">
            <div class="message-content">
                <div class="ai-burst"></div>
                <p>History cleared. <strong>Chatbot</strong> is ready for a new conversation.</p>
                <span class="timestamp">Just now</span>
            </div>
        </div>
    `;
});

// Initialize icons for any dynamically added elements if needed
// lucide.createIcons() is handled in HTML for initial elements
