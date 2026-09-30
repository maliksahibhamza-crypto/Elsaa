/* =========================================================
   HAZEL AI — Main Brain + Chat Controller
   File: ai.js

   This file:
   - Reads user messages
   - Normalizes different typing styles
   - Detects intents from ai-data.js
   - Selects a random response
   - Uses fallback when nothing matches
   - Controls the chat interface
   - Handles Send / Enter
   - Shows typing indicator
   - Handles New Chat / Clear Chat
   - Handles Back button
   ========================================================= */


/* =========================================================
   1. NORMALIZE USER MESSAGE
   ========================================================= */

function normalizeMessage(message) {

    return message
        .toLowerCase()
        .trim()

        // Remove extra spaces
        .replace(/\s+/g, " ")

        // Normalize repeated letters:
        // "hellooo" → "helloo"
        // "kaaaise" → "kaaise"
        .replace(/(.)\1{2,}/g, "$1$1")

        // Normalize common Roman Urdu variations
        .replace(/\bhn\b/g, "haan")
        .replace(/\bhan\b/g, "haan")
        .replace(/\bnahin\b/g, "nahi")
        .replace(/\bnah\b/g, "nahi")
        .replace(/\bkesi\b/g, "kaisi")
        .replace(/\bkese\b/g, "kaise");
}


/* =========================================================
   2. CHECK WHETHER A KEYWORD MATCHES
   ========================================================= */

function keywordMatches(message, keyword) {

    const normalizedKeyword = normalizeMessage(keyword);

    if (message.includes(normalizedKeyword)) {
        return true;
    }

    return false;
}


/* =========================================================
   3. FIND USER INTENT
   ========================================================= */

function detectIntent(message) {

    const normalizedMessage = normalizeMessage(message);

    let bestIntent = null;
    let bestScore = 0;

    for (const intentName in HAZEL_AI_DATA) {

        // Never use fallback as a normal intent
        if (intentName === "fallback") {
            continue;
        }

        const intent = HAZEL_AI_DATA[intentName];

        if (!intent.keywords) {
            continue;
        }

        let score = 0;

        for (const keyword of intent.keywords) {

            if (keywordMatches(normalizedMessage, keyword)) {

                /*
                 * Longer phrases receive a higher score.
                 *
                 * Example:
                 * "hello hazel" gets more priority
                 * than just "hello".
                 */

                score += keyword.length;
            }
        }

        if (score > bestScore) {

            bestScore = score;
            bestIntent = intentName;
        }
    }

    return bestIntent;
}


/* =========================================================
   4. GET RANDOM RESPONSE
   ========================================================= */

function getRandomReply(replies) {

    if (!replies || replies.length === 0) {
        return "";
    }

    const randomIndex = Math.floor(
        Math.random() * replies.length
    );

    return replies[randomIndex];
}


/* =========================================================
   5. GENERATE HAZEL AI RESPONSE
   ========================================================= */

function getHazelResponse(userMessage) {

    if (!userMessage || !userMessage.trim()) {
        return "";
    }

    const intentName = detectIntent(userMessage);

    /*
     * If an intent was detected,
     * use its replies.
     */

    if (intentName && HAZEL_AI_DATA[intentName]) {

        return getRandomReply(
            HAZEL_AI_DATA[intentName].replies
        );
    }


    /*
     * Nothing matched.
     * Use fallback responses.
     */

    return getRandomReply(
        HAZEL_AI_DATA.fallback.replies
    );
}


/* =========================================================
   6. DOM ELEMENTS
   ========================================================= */

const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");

const messages = document.getElementById("messages");
const chatContainer = document.getElementById("chatContainer");

const welcomeSection = document.getElementById("welcomeSection");

const typingIndicator =
    document.getElementById("typingIndicator");

const aiMenuBtn =
    document.getElementById("aiMenuBtn");

const aiMenu =
    document.getElementById("aiMenu");

const newChatBtn =
    document.getElementById("newChatBtn");

const clearChatBtn =
    document.getElementById("clearChatBtn");

const backBtn =
    document.getElementById("backBtn");


/* =========================================================
   7. SHOW / HIDE WELCOME SCREEN
   ========================================================= */

function updateWelcomeScreen() {

    if (!welcomeSection) {
        return;
    }

    if (messages && messages.children.length > 0) {

        welcomeSection.style.display = "none";

    } else {

        welcomeSection.style.display = "flex";

    }
}


/* =========================================================
   8. GET CURRENT TIME
   ========================================================= */

function getCurrentTime() {

    const now = new Date();

    return now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
    });
}


/* =========================================================
   9. ADD MESSAGE TO CHAT
   ========================================================= */

function addMessage(text, sender) {

    if (!messages || !text) {
        return;
    }


    const messageWrapper =
        document.createElement("div");

    messageWrapper.className =
        `message ${sender}`;


    const bubble =
        document.createElement("div");

    bubble.className =
        "message-bubble";


    /*
     * textContent is intentionally used instead of
     * innerHTML so user input cannot inject HTML.
     */

    bubble.textContent = text;


    const time =
        document.createElement("span");

    time.className =
        "message-time";

    time.textContent =
        getCurrentTime();


    bubble.appendChild(time);

    messageWrapper.appendChild(bubble);

    messages.appendChild(messageWrapper);


    updateWelcomeScreen();

    scrollToBottom();
}


/* =========================================================
   10. SCROLL CHAT TO BOTTOM
   ========================================================= */

function scrollToBottom() {

    if (!chatContainer) {
        return;
    }

    requestAnimationFrame(() => {

        chatContainer.scrollTo({
            top: chatContainer.scrollHeight,
            behavior: "smooth"
        });

    });
}


/* =========================================================
   11. SHOW TYPING INDICATOR
   ========================================================= */

function showTypingIndicator() {

    if (!typingIndicator) {
        return;
    }

    typingIndicator.hidden = false;

    scrollToBottom();
}


/* =========================================================
   12. HIDE TYPING INDICATOR
   ========================================================= */

function hideTypingIndicator() {

    if (!typingIndicator) {
        return;
    }

    typingIndicator.hidden = true;
}


/* =========================================================
   13. SEND MESSAGE
   ========================================================= */

function sendMessage() {

    if (!messageInput) {
        return;
    }


    const userMessage =
        messageInput.value.trim();


    /*
     * Do nothing if input is empty.
     */

    if (!userMessage) {
        return;
    }


    /*
     * Add user's message.
     */

    addMessage(
        userMessage,
        "user"
    );


    /*
     * Clear input.
     */

    messageInput.value = "";

    autoResizeTextarea();


    /*
     * Temporarily disable send button.
     */

    if (sendBtn) {
        sendBtn.disabled = true;
    }


    /*
     * Show typing animation.
     */

    showTypingIndicator();


    /*
     * Small delay makes the chatbot feel
     * more natural instead of instant.
     */

    const typingDelay =
        500 + Math.floor(Math.random() * 700);


    setTimeout(() => {

        const response =
            getHazelResponse(userMessage);


        hideTypingIndicator();


        if (response) {

            addMessage(
                response,
                "ai"
            );
        }


        if (sendBtn) {
            sendBtn.disabled = false;
        }


        if (messageInput) {
            messageInput.focus();
        }

    }, typingDelay);
}


/* =========================================================
   14. TEXTAREA AUTO RESIZE
   ========================================================= */

function autoResizeTextarea() {

    if (!messageInput) {
        return;
    }

    messageInput.style.height = "auto";

    messageInput.style.height =
        Math.min(
            messageInput.scrollHeight,
            120
        ) + "px";
}


/* =========================================================
   15. SEND BUTTON EVENT
   ========================================================= */

if (sendBtn) {

    sendBtn.addEventListener(
        "click",
        sendMessage
    );

}


/* =========================================================
   16. ENTER TO SEND
   ========================================================= */

if (messageInput) {

    messageInput.addEventListener(
        "keydown",
        function (event) {

            /*
             * Enter = Send
             *
             * Shift + Enter = New line
             */

            if (
                event.key === "Enter" &&
                !event.shiftKey
            ) {

                event.preventDefault();

                sendMessage();
            }

        }
    );


    messageInput.addEventListener(
        "input",
        autoResizeTextarea
    );

}


/* =========================================================
   17. AI MENU
   ========================================================= */

if (aiMenuBtn && aiMenu) {

    aiMenuBtn.addEventListener(
        "click",
        function (event) {

            event.stopPropagation();

            aiMenu.hidden =
                !aiMenu.hidden;

        }
    );

}


/* =========================================================
   18. CLOSE MENU WHEN CLICKING OUTSIDE
   ========================================================= */

document.addEventListener(
    "click",
    function (event) {

        if (!aiMenu || aiMenu.hidden) {
            return;
        }


        if (
            !aiMenu.contains(event.target) &&
            event.target !== aiMenuBtn
        ) {

            aiMenu.hidden = true;
        }

    }
);


/* =========================================================
   19. NEW CHAT
   ========================================================= */

if (newChatBtn) {

    newChatBtn.addEventListener(
        "click",
        function () {

            if (messages) {
                messages.innerHTML = "";
            }

            hideTypingIndicator();

            updateWelcomeScreen();

            if (aiMenu) {
                aiMenu.hidden = true;
            }

            if (messageInput) {
                messageInput.value = "";

                autoResizeTextarea();

                messageInput.focus();
            }

        }
    );

}


/* =========================================================
   20. CLEAR CHAT
   ========================================================= */

if (clearChatBtn) {

    clearChatBtn.addEventListener(
        "click",
        function () {

            if (messages) {
                messages.innerHTML = "";
            }

            hideTypingIndicator();

            updateWelcomeScreen();

            if (aiMenu) {
                aiMenu.hidden = true;
            }

        }
    );

}


/* =========================================================
   21. BACK BUTTON
   ========================================================= */

if (backBtn) {

    backBtn.addEventListener(
        "click",
        function () {

            /*
             * First try browser history.
             * If there is no previous page,
             * go to accounts.html.
             */

            if (window.history.length > 1) {

                window.history.back();

            } else {

                window.location.href =
                    "accounts.html";

            }

        }
    );

}


/* =========================================================
   22. INITIAL STATE
   ========================================================= */

updateWelcomeScreen();

hideTypingIndicator();


/* =========================================================
   23. OPTIONAL DEBUG FUNCTION
   =========================================================

   Browser console mein test:

   testHazelAI("hello hazel");
   testHazelAI("kesi hooo");
   testHazelAI("good night");

   ========================================================= */

function testHazelAI(message) {

    const response =
        getHazelResponse(message);

    console.log("User:", message);
    console.log("HAZEL AI:", response);

    return response;
}

/* =========================================================
   HAZEL AI — LOAD SAVED HAZEL THEME
   ========================================================= */

(function applySavedHazelTheme() {
    const savedTheme = localStorage.getItem("hazelTheme");
    const theme = savedTheme || "black-gold";

    document.body.setAttribute("data-theme", theme);
})();
