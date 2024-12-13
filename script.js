
    const chatArea = document.getElementById("chatArea");
    const userInput = document.getElementById("userInput");

    // Display messages in the chat area
    function displayMessage(message, sender) {
        const messageDiv = document.createElement("div");
        messageDiv.className = `message ${sender}`;
        const avatar = document.createElement("div");
        avatar.className = `avatar ${sender}-avatar`;
        const messageSpan = document.createElement("span");
        messageSpan.textContent = message;
        
        if (sender === 'bot') {
            messageDiv.appendChild(avatar);
            messageDiv.appendChild(messageSpan);
        } else {
            messageDiv.appendChild(messageSpan);
            messageDiv.appendChild(avatar);
        }
        
        chatArea.appendChild(messageDiv);
        chatArea.scrollTop = chatArea.scrollHeight;
    }

    // Show typing indicator
    function showTypingIndicator() {
        const typingDiv = document.createElement("div");
        typingDiv.className = "typing-indicator";
        typingDiv.innerHTML = '<div class="avatar bot-avatar"></div><span></span><span></span><span></span>';
        chatArea.appendChild(typingDiv);
        chatArea.scrollTop = chatArea.scrollHeight;
    }

    // Hide typing indicator
    function hideTypingIndicator() {
        const typingIndicator = document.querySelector(".typing-indicator");
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    // Fetch data from Wikipedia
    async function fetchWikipedia(query) {
        showTypingIndicator();
        const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&list=search&srsearch=${encodeURIComponent(query)}`;

        try {
            const response = await fetch(searchUrl);
            const data = await response.json();

            if (data.query.search.length === 0) {
                hideTypingIndicator();
                displayMessage("Sorry, I couldn't find any information on that topic. Please try rephrasing your query.", "bot");
            } else {
                const pageTitle = data.query.search[0].title;
                const contentUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&prop=extracts&exintro&explaintext&titles=${encodeURIComponent(pageTitle)}`;

                const contentResponse = await fetch(contentUrl);
                const contentData = await contentResponse.json();
                const pages = contentData.query.pages;
                const pageId = Object.keys(pages)[0];
                const extract = pages[pageId].extract;

                hideTypingIndicator();
                displayMessage(
                    extract || `I found a page titled "${pageTitle}" but couldn't extract a detailed description.`,
                    "bot"
                );
            }
        } catch (error) {
            hideTypingIndicator();
            displayMessage("An error occurred while fetching data. Please try again.", "bot");
            console.error(error);
        }
    }

    // Handle sending a message
    function sendMessage() {
        const query = userInput.value.trim();
        if (!query) {
            displayMessage("Please enter a message before sending.", "bot");
            return;
        }

        displayMessage(query, "user");
        fetchWikipedia(query);
        userInput.value = ""; // Clear the input field
    }

    // Allow sending message with Enter key
    userInput.addEventListener("keypress", function(event) {
        if (event.key === "Enter") {
            event.preventDefault();
            sendMessage();
        }
    });

    // Initial greeting
    setTimeout(() => {
        displayMessage("Hello! I'm your enhanced student support chatbot with a beautiful deep wine design. How can I assist you today?", "bot");
    }, 500);
