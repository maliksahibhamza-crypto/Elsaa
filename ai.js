/* =========================================================
   HAZEL AI — Main Brain + Chat Controller
   File: ai.js

   This file:
   - Reads user messages
   - Sends all messages directly to Gemini
   - Keeps recent conversation context in memory
   - Uses Cloudflare Worker for Gemini
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
   2. CONVERSATION MEMORY SETTINGS
   ========================================================= */

/*
 * HAZEL keeps recent conversation context in browser memory.
 *
 * This is NOT the Gemini API key.
 *
 * We keep a limited number of messages so very long
 * conversations do not create huge API requests.
 */

const HAZEL_MEMORY_KEY =
    "hazelAIConversationMemory";

const MAX_MEMORY_MESSAGES =
    30;


/* =========================================================
   3. CONVERSATION MEMORY
   ========================================================= */

let conversationMemory = [];


/*
 * Load previous conversation memory.
 */

function loadConversationMemory() {

    try {

        const savedMemory =
            localStorage.getItem(
                HAZEL_MEMORY_KEY
            );


        if (!savedMemory) {
            conversationMemory = [];
            return;
        }


        const parsedMemory =
            JSON.parse(
                savedMemory
            );


        if (
            Array.isArray(parsedMemory)
        ) {

            conversationMemory =
                parsedMemory
                    .filter(
                        message =>
                            message &&
                            (
                                message.role === "user" ||
                                message.role === "assistant"
                            ) &&
                            typeof message.content === "string"
                    )
                    .slice(
                        -MAX_MEMORY_MESSAGES
                    );

        } else {

            conversationMemory = [];
        }

    } catch (error) {

        console.error(
            "Could not load HAZEL AI memory:",
            error
        );

        conversationMemory = [];
    }
}


/*
 * Save conversation memory.
 */

function saveConversationMemory() {

    try {

        conversationMemory =
            conversationMemory.slice(
                -MAX_MEMORY_MESSAGES
            );


        localStorage.setItem(
            HAZEL_MEMORY_KEY,
            JSON.stringify(
                conversationMemory
            )
        );

    } catch (error) {

        console.error(
            "Could not save HAZEL AI memory:",
            error
        );
    }
}


/*
 * Add a message to memory.
 */

function addToConversationMemory(
    role,
    content
) {

    if (
        !content ||
        !content.trim()
    ) {
        return;
    }


    conversationMemory.push({

        role:
            role,

        content:
            content.trim()

    });


    /*
     * Keep only the most recent messages.
     */

    conversationMemory =
        conversationMemory.slice(
            -MAX_MEMORY_MESSAGES
        );


    saveConversationMemory();
}


/*
 * Clear conversation memory.
 */

function clearConversationMemory() {

    conversationMemory = [];


    try {

        localStorage.removeItem(
            HAZEL_MEMORY_KEY
        );

    } catch (error) {

        console.error(
            "Could not clear HAZEL AI memory:",
            error
        );
    }
}


/*
 * Build the conversation context that will
 * be sent to the Cloudflare Worker.
 */

function buildConversationContext(
    currentMessage
) {

    const history =
        conversationMemory
            .slice(
                -MAX_MEMORY_MESSAGES
            )
            .map(
                message =>
                    `${message.role}: ${message.content}`
            )
            .join("\n");


    if (!history) {

        return currentMessage;
    }


    return `
Previous conversation:
${history}

Current user message:
${currentMessage}
`.trim();
}


/* =========================================================
   4. NORMALIZE USER MESSAGE
   ========================================================= */

/*
 * Kept from the original file so existing
 * functionality is not unnecessarily removed.
 */

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
   5. GET GEMINI RESPONSE THROUGH CLOUDFLARE
   ========================================================= */

async function getGeminiResponse(
    userMessage
) {

    if (
        !userMessage ||
        !userMessage.trim()
    ) {
        return "";
    }


    /*
     * Send current message + recent conversation
     * to the Worker.
     */

    const conversationContext =
        buildConversationContext(
            userMessage
        );


    /*
     * Abort request if it takes too long.
     */

    const controller =
        new AbortController();


    const timeoutId =
        setTimeout(
            () => {
                controller.abort();
            },
            30000
        );


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

                    body:
                        JSON.stringify({
                            message:
                                conversationContext
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

        clearTimeout(
            timeoutId
        );
    }
}


/* =========================================================
   6. DOM ELEMENTS
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
   7. SHOW / HIDE WELCOME SCREEN
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
   8. GET CURRENT TIME
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
   9. ADD MESSAGE TO CHAT
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
   10. SCROLL CHAT TO BOTTOM
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
   11. SHOW TYPING INDICATOR
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
   12. HIDE TYPING INDICATOR
   ========================================================= */

function hideTypingIndicator() {

    if (!typingIndicator) {
        return;
    }


    typingIndicator.hidden =
        true;
}


/* =========================================================
   13. SEND MESSAGE
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
     * Add user's message to visible chat.
     */

    addMessage(
        userMessage,
        "user"
    );


    /*
     * Add user's message to conversation memory.
     */

    addToConversationMemory(
        "user",
        userMessage
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
         * ALL MESSAGES GO DIRECTLY TO GEMINI.
         * =================================================
         *
         * No keyword system.
         * No custom intent system.
         * No ai-data.js response selection.
         */

        const geminiReply =
            await getGeminiResponse(
                userMessage
            );


        hideTypingIndicator();


        /*
         * Gemini replied successfully.
         */

        if (geminiReply) {

            addMessage(
                geminiReply,
                "ai"
            );


            /*
             * Save Gemini's reply so future
             * messages can understand context.
             */

            addToConversationMemory(
                "assistant",
                geminiReply
            );

        } else {

            /*
             * Gemini / Worker failed.
             *
             * We intentionally use a simple local
             * fallback because ai-data.js is no longer
             * part of the response system.
             */

            const fallback =
                "Sorry, I couldn't connect to Gemini right now. Please try again in a moment.";


            addMessage(
                fallback,
                "ai"
            );

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


        const fallback =
            "Sorry, something went wrong while connecting to HAZEL AI. Please try again.";


        addMessage(
            fallback,
            "ai"
        );

    } finally {

        /*
         * Always restore input state.
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
   14. TEXTAREA AUTO RESIZE
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
   18. CLOSE MENU WHEN CLICKING OUTSIDE
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
   19. NEW CHAT
   ========================================================= */

if (newChatBtn) {

    newChatBtn.addEventListener(
        "click",
        function () {

            if (messages) {

                messages.innerHTML =
                    "";

            }


            /*
             * New Chat also starts
             * a completely fresh memory.
             */

            clearConversationMemory();


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
   20. CLEAR CHAT
   ========================================================= */

if (clearChatBtn) {

    clearChatBtn.addEventListener(
        "click",
        function () {

            if (messages) {

                messages.innerHTML =
                    "";

            }


            /*
             * Clear visible chat AND
             * stored conversation memory.
             */

            clearConversationMemory();


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
   22. INITIAL STATE
   ========================================================= */

loadConversationMemory();

updateWelcomeScreen();

hideTypingIndicator();
       
