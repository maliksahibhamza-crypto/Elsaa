/* =========================================================
   HAZEL AI — Main Brain + Chat Controller
   File: ai.js

   This file:
   - Reads user messages
   - Normalizes different typing styles
   - Detects intents from ai-data.js
   - Uses custom responses first
   - Sends unmatched messages to Gemini through Cloudflare Worker
   - Uses fallback if Gemini/Worker fails
   - Controls the chat interface
   - Handles Send / Enter
   - Shows typing indicator
   - Handles New Chat / Clear Chat
   - Handles Back button
   - Loads saved HAZEL theme
   ========================================================= */


/* =========================================================
   1. GEMINI / CLOUDFLARE WORKER SETTINGS
   ========================================================= */

/*
 * IMPORTANT:
 * Gemini API key is NOT stored here.
 *
 * The API key stays safely inside your Cloudflare Worker
 * as the GEMINI_API_KEY secret.
 */

const HAZEL_AI_WORKER_URL =
    "https://hazel-ai.maliksahibhamza.workers.dev/";


/* =========================================================
   2. NORMALIZE USER MESSAGE
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
   3. CHECK WHETHER A KEYWORD MATCHES
   ========================================================= */

function keywordMatches(message, keyword) {

    const normalizedKeyword =
        normalizeMessage(keyword);

    if (message.includes(normalizedKeyword)) {
        return true;
    }

    return false;
}


/* =========================================================
   4. FIND USER INTENT
   ========================================================= */

function detectIntent(message) {

    const normalizedMessage =
        normalizeMessage(message);

    let bestIntent = null;
    let bestScore = 0;

    for (const intentName in HAZEL_AI_DATA) {

        // Never use fallback as a normal intent
        if (intentName === "fallback") {
            continue;
        }

        const intent =
            HAZEL_AI_DATA[intentName];

        if (!intent.keywords) {
            continue;
        }

        let score = 0;

        for (const keyword of intent.keywords) {

            if (
                keywordMatches(
                    normalizedMessage,
                    keyword
                )
            ) {

                /*
                 * Longer phrases receive
                 * a higher score.
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
   5. GET RANDOM RESPONSE
   ========================================================= */

function getRandomReply(replies) {

    if (!replies || replies.length === 0) {
        return "";
    }

    const randomIndex =
        Math.floor(
            Math.random() * replies.length
        );

    return replies[randomIndex];
}


/* =========================================================
   6. GENERATE CUSTOM HAZEL RESPONSE
   ========================================================= */

function getHazelResponse(userMessage) {

    if (
        !userMessage ||
        !userMessage.trim()
    ) {
        return "";
    }

    const intentName =
        detectIntent(userMessage);


    /*
     * If an intent was detected,
     * use its custom replies.
     */

    if (
        intentName &&
        HAZEL_AI_DATA[intentName]
    ) {

        return getRandomReply(
            HAZEL_AI_DATA[intentName].replies
        );
    }


    /*
     * Nothing matched.
     * Use fallback.
     */

    return getRandomReply(
        HAZEL_AI_DATA.fallback.replies
    );
}


/* =========================================================
   7. CHECK IF CUSTOM INTENT EXISTS
   ========================================================= */

function hasCustomIntent(userMessage) {

    return Boolean(
        detectIntent(userMessage)
    );
}


/* =========================================================
   8. GET GEMINI RESPONSE THROUGH CLOUDFLARE
   ========================================================= */

async function getGeminiResponse(userMessage) {

    if (
        !userMessage ||
        !userMessage.trim()
    ) {
        return "";
    }


    /*
     * Abort request if it takes too long.
     * This prevents the typing indicator from
     * staying forever if the Worker is unavailable.
     */

    const controller =
        new AbortController();

    const timeoutId =
        setTimeout(() => {
            controller.abort();
        }, 30000);


    try {

        const response =
            await fetch(
                HAZEL_AI_WORKER_URL,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        message:
                            userMessage
                    }),

                    signal:
                        controller.signal
                }
            );


        /*
         * Worker returned an error.
         */

        if (!response.ok) {

            console.error(
                "HAZEL AI Worker error:",
                response.status
            );

            return "";
        }


        /*
         * Read JSON response.
         */

        let data;

        try {

            data =
                await response.json();

        } catch (error) {

            console.error(
                "Invalid Worker response:",
                error
            );

            return "";
        }


        /*
         * Expected Worker response:
         *
         * {
         *   "reply": "..."
         * }
         */

        if (
            !data ||
            typeof data.reply !== "string"
        ) {

            console.error(
                "Worker returned no valid reply."
            );

            return "";
        }


        const reply =
            data.reply.trim();


        if (!reply) {
            return "";
        }


        return reply;

    } catch (error) {

        /*
         * Network error / timeout / CORS error
         */

        console.error(
            "Gemini connection error:",
            error
        );

        return "";

    } finally {

        clearTimeout(timeoutId);
    }
}


/* =========================================================
   9. DOM ELEMENTS
   ========================================================= */

const messageInput =
    document.getElementById(
        "messageInput"
    );

const sendBtn =
    document.getElementById(
        "sendBtn"
    );

const messages =
    document.getElementById(
        "messages"
    );

const chatContainer =
    document.getElementById(
        "chatContainer"
    );

const welcomeSection =
    document.getElementById(
        "welcomeSection"
    );

const typingIndicator =
    document.getElementById(
        "typingIndicator"
    );

const aiMenuBtn =
    document.getElementById(
        "aiMenuBtn"
    );

const aiMenu =
    document.getElementById(
        "aiMenu"
    );

const newChatBtn =
    document.getElementById(
        "newChatBtn"
    );

const clearChatBtn =
    document.getElementById(
        "clearChatBtn"
    );

const backBtn =
    document.getElementById(
        "backBtn"
    );


/* =========================================================
   10. SHOW / HIDE WELCOME SCREEN
   ========================================================= */

function updateWelcomeScreen() {

    if (!welcomeSection) {
        return;
    }

    if (
        messages &&
        messages.children.length > 0
    ) {

        welcomeSection.style.display =
            "none";

    } else {

        welcomeSection.style.display =
            "flex";
    }
}


/* =========================================================
   11. GET CURRENT TIME
   ========================================================= */

function getCurrentTime() {

    const now =
        new Date();

    return now.toLocaleTimeString(
        [],
        {
            hour: "2-digit",
            minute: "2-digit"
        }
    );
}


/* =========================================================
   12. ADD MESSAGE TO CHAT
   ========================================================= */

function addMessage(
    text,
    sender
) {

    if (
        !messages ||
        !text
    ) {
        return;
    }


    const messageWrapper =
        document.createElement(
            "div"
        );

    messageWrapper.className =
        `message ${sender}`;


    const bubble =
        document.createElement(
            "div"
        );

    bubble.className =
        "message-bubble";


    /*
     * textContent is intentionally used
     * instead of innerHTML so user input
     * cannot inject HTML.
     */

    bubble.textContent =
        text;


    const time =
        document.createElement(
            "span"
        );

    time.className =
        "message-time";

    time.textContent =
        getCurrentTime();


    bubble.appendChild(
        time
    );

    messageWrapper.appendChild(
        bubble
    );

    messages.appendChild(
        messageWrapper
    );


    updateWelcomeScreen();

    scrollToBottom();
}


/* =========================================================
   13. SCROLL CHAT TO BOTTOM
   ========================================================= */

function scrollToBottom() {

    if (!chatContainer) {
        return;
    }

    requestAnimationFrame(
        () => {

            chatContainer.scrollTo({

                top:
                    chatContainer.scrollHeight,

                behavior:
                    "smooth"
            });

        }
    );
}


/* =========================================================
   14. SHOW TYPING INDICATOR
   ========================================================= */

function showTypingIndicator() {

    if (!typingIndicator) {
        return;
    }

    typingIndicator.hidden =
        false;

    scrollToBottom();
}


/* =========================================================
   15. HIDE TYPING INDICATOR
   ========================================================= */

function hideTypingIndicator() {

    if (!typingIndicator) {
        return;
    }

    typingIndicator.hidden =
        true;
}


/* =========================================================
   16. SEND MESSAGE
   ========================================================= */

async function sendMessage() {

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


    try {

        /*
         * =================================================
         * STEP 1
         * Check custom ai-data.js intents first.
         * =================================================
         */

        const customIntent =
            hasCustomIntent(
                userMessage
            );


        if (customIntent) {

            /*
             * Keep a small natural delay
             * for custom responses.
             */

            const typingDelay =
                500 +
                Math.floor(
                    Math.random() * 700
                );


            await new Promise(
                resolve =>
                    setTimeout(
                        resolve,
                        typingDelay
                    )
            );


            const response =
                getHazelResponse(
                    userMessage
                );


            hideTypingIndicator();


            if (response) {

                addMessage(
                    response,
                    "ai"
                );
            }

            return;
        }


        /*
         * =================================================
         * STEP 2
         * No custom intent found.
         * Send message to Gemini.
         * =================================================
         */

        const geminiReply =
            await getGeminiResponse(
                userMessage
            );


        hideTypingIndicator();


        /*
         * =================================================
         * STEP 3
         * Gemini replied successfully.
         * =================================================
         */

        if (geminiReply) {

            addMessage(
                geminiReply,
                "ai"
            );

        } else {

            /*
             * =================================================
             * STEP 4
             * Gemini / Worker failed.
             * Use existing fallback system.
             * =================================================
             */

            const fallback =
                getRandomReply(
                    HAZEL_AI_DATA.fallback.replies
                );


            if (fallback) {

                addMessage(
                    fallback,
                    "ai"
                );
            }
        }

    } catch (error) {

        console.error(
            "HAZEL AI error:",
            error
        );


        /*
         * Always hide typing indicator
         * if something unexpected happens.
         */

        hideTypingIndicator();


        /*
         * Final fallback.
         */

        const fallback =
            getRandomReply(
                HAZEL_AI_DATA.fallback.replies
            );


        if (fallback) {

            addMessage(
                fallback,
                "ai"
            );
        }

    } finally {

        /*
         * Always restore the input state.
         */

        hideTypingIndicator();


        if (sendBtn) {
            sendBtn.disabled = false;
        }


        if (messageInput) {
            messageInput.focus();
        }
    }
}


/* =========================================================
   17. TEXTAREA AUTO RESIZE
   ========================================================= */

function autoResizeTextarea() {

    if (!messageInput) {
        return;
    }

    messageInput.style.height =
        "auto";

    messageInput.style.height =
        Math.min(
            messageInput.scrollHeight,
            120
        ) + "px";
}


/* =========================================================
   18. SEND BUTTON EVENT
   ========================================================= */

if (sendBtn) {

    sendBtn.addEventListener(
        "click",
        sendMessage
    );

}


/* =========================================================
   19. ENTER TO SEND
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
   20. AI MENU
   ========================================================= */

if (
    aiMenuBtn &&
    aiMenu
) {

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
   21. CLOSE MENU WHEN CLICKING OUTSIDE
   ========================================================= */

document.addEventListener(
    "click",
    function (event) {

        if (
            !aiMenu ||
            aiMenu.hidden
        ) {
            return;
        }


        if (
            !aiMenu.contains(
                event.target
            ) &&
            event.target !== aiMenuBtn
        ) {

            aiMenu.hidden =
                true;
        }

    }
);


/* =========================================================
   22. NEW CHAT
   ========================================================= */

if (newChatBtn) {

    newChatBtn.addEventListener(
        "click",
        function () {

            if (messages) {
                messages.innerHTML =
                    "";
            }

            hideTypingIndicator();

            updateWelcomeScreen();


            if (aiMenu) {
                aiMenu.hidden =
                    true;
            }


            if (messageInput) {

                messageInput.value =
                    "";

                autoResizeTextarea();

                messageInput.focus();
            }

        }
    );

}


/* =========================================================
   23. CLEAR CHAT
   ========================================================= */

if (clearChatBtn) {

    clearChatBtn.addEventListener(
        "click",
        function () {

            if (messages) {

                messages.innerHTML =
                    "";
            }


            hideTypingIndicator();

            updateWelcomeScreen();


            if (aiMenu) {

                aiMenu.hidden =
                    true;
            }

        }
    );

}


/* =========================================================
   24. BACK BUTTON
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

            if (
                window.history.length > 1
            ) {

                window.history.back();

            } else {

                window.location.href =
                    "accounts.html";
            }

        }
    );

}


/* =========================================================
   25. INITIAL STATE
   ========================================================= */

updateWelcomeScreen();

hideTypingIndicator();


/* =========================================================
   26. OPTIONAL DEBUG FUNCTION
   =========================================================

   Browser console:

   testHazelAI("hello hazel");
   testHazelAI("kesi hooo");
   testHazelAI("good night");

   ========================================================= */

function testHazelAI(message) {

    const response =
        getHazelResponse(
            message
        );

    console.log(
       "User:",
        message
    );

    console.log(
        "HAZEL AI:",
        response
    );

    return response;
}


/* =========================================================
   27. LOAD SAVED HAZEL THEME
   ========================================================= */

(function applySavedHazelTheme() {

    const savedTheme =
        localStorage.getItem(
            "hazelTheme"
        );

    const theme =
        savedTheme ||
        "black-gold";

    document.body.setAttribute(
        "data-theme",
        theme
    );

})();
       
