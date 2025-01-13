document.addEventListener('DOMContentLoaded', () => {
    const chatMessages = document.getElementById('chat-messages');
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');

    const API_KEY = 'AIzaSyAQOTvECBX11x8JLY7nCBNXe4HZ7c4t28M'; // Placeholder API key

    let conversationHistory = [
        { role: "system", content: "You are a helpful assistant for student support services. Provide concise and accurate information about courses, financial aid, academic support, campus information, and technical support." }
    ];

    function addMessage(message, isUser = false) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message');
        messageElement.classList.add(isUser ? 'user-message' : 'bot-message');
        messageElement.textContent = message;
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function addTypingIndicator() {
        const typingIndicator = document.createElement('div');
        typingIndicator.classList.add('typing-indicator');
        typingIndicator.innerHTML = '<span></span><span></span><span></span>';
        chatMessages.appendChild(typingIndicator);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        return typingIndicator;
    }

    async function getBotResponse(message) {
        const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
        
        const requestBody = {
            contents: [
                {
                    parts: [
                        {
                            text: conversationHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n') + `\nuser: ${message}\nassistant:`
                        }
                    ]
                }
            ]
        };

        try {
            const response = await fetch(`${apiUrl}?key=${API_KEY}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data.candidates[0].content.parts[0].text;
        } catch (error) {
            console.error('Error:', error);
            return "I'm sorry, I'm having trouble connecting to my knowledge base right now. Please try again later.";
        }
    }

    async function handleUserInput() {
        const userMessage = messageInput.value.trim();
        if (userMessage) {
            addMessage(userMessage, true);
            messageInput.value = '';
            conversationHistory.push({ role: "user", content: userMessage });

            const typingIndicator = addTypingIndicator();
            
            try {
                const botResponse = await getBotResponse(userMessage);
                typingIndicator.remove();
                addMessage(botResponse);
                conversationHistory.push({ role: "assistant", content: botResponse });
            } catch (error) {
                typingIndicator.remove();
                addMessage("I'm sorry, I'm having trouble responding right now. Please try again later.");
                console.error("Error getting bot response:", error);
            }
        }
    }

    sendButton.addEventListener('click', handleUserInput);
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleUserInput();
        }
    });

    // Initial bot message
    addMessage("Hello! I'm your student support chatbot. How can I assist you today? Feel free to ask about courses, financial aid, academic support, campus information, or technical support.");
});

