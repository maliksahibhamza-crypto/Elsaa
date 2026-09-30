/* =========================================================
   HAZEL AI — Main Brain + Chat Controller
   File: ai.js

   This file:
   - Reads user messages
   - Sends messages directly to Gemini
   - Uses Cloudflare Worker for Gemini
   - Uses fallback if Gemini/Worker fails
   - Controls the chat interface
   - Handles Send / Enter
   - Shows typing indicator
   - Handles New Chat / Clear Chat
   - Handles Back button
   - Loads saved HAZEL theme

   NOTE:
   - ai-data.js is NOT required
   - No keyword/custom-intent system
   - No conversation memory
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

/*
 * Kept as a utility function from the original file.
 *
 * Gemini does NOT depend on this function.
 */

function normalizeMessage(message) {

    return message
        .toLowerCase()
        .trim()

        // Remove extra spaces
        .replace(/\s+/g, " ")

        // Normalize repeated letters
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
   3. GET GEMINI RESPONSE THROUGH CLOUDFLARE
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
     *
     * This prevents the typing indicator from
     * staying forever if the Worker is unavailable.
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

                    /*
                     * Send ONLY the user's message.
                     *
                     * No custom intent.
                     * No keyword matching.
                     * No conversation memory.
                     */

                    body:
                        JSON.stringify({
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
                response.status,
                response.statusText
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
                "Worker returned no valid reply.",
                data
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
   4. DOM ELEMENTS
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
   5. SHOW / HIDE WELCOME SCREEN
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
   6. GET CURRENT TIME
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
   7. ADD MESSAGE TO CHAT
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
   8. SCROLL CHAT TO BOTTOM
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
   9. SHOW TYPING INDICATOR
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
   10. HIDE TYPING INDICATOR
   ========================================================= */

function hideTypingIndicator() {

    if (!typingIndicator) {
        return;
    }


    typingIndicator.hidden =
        true;
}


/* =========================================================
   11. SEND MESSAGE
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

        sendBtn.disabled =
            true;
    }


    /*
     * Show typing animation.
     */

    showTypingIndicator();


    try {

        /*
         * =================================================
         * SEND EVERY MESSAGE DIRECTLY TO GEMINI
         * =================================================
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

        } else {

            /*
             * Gemini / Worker failed.
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


        /*
         * Final fallback.
         */

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

            sendBtn.disabled =
                false;
        }


        if (messageInput) {

            messageInput.focus();
        }

    }
}


/* =========================================================
   12. TEXTAREA AUTO RESIZE
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
   13. SEND BUTTON EVENT
   ========================================================= */

if (sendBtn) {

    sendBtn.addEventListener(
        "click",
        sendMessage
    );

}


/* =========================================================
   14. ENTER TO SEND
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
   15. AI MENU
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
   16. CLOSE MENU WHEN CLICKING OUTSIDE
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
   17. NEW CHAT
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
   18. CLEAR CHAT
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
   19. BACK BUTTON
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
   20. INITIAL STATE
   ========================================================= */

updateWelcomeScreen();

hideTypingIndicator();


/* =========================================================
   21. OPTIONAL DEBUG FUNCTION
   =========================================================

   Browser console:

   testHazelAI("hello hazel");
   testHazelAI("Newton ka pehla law kya hai?");
   testHazelAI("Photosynthesis kya hoti hai?");

   This sends the message directly to Gemini.
   ========================================================= */

async function testHazelAI(message) {

    const response =
        await getGeminiResponse(
            message
        );


    console.log(
        "HAZEL AI:",
        response
    );


    return response;
}


/* =========================================================
   22. LOAD SAVED HAZEL THEME
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
