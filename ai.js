/* =========================================================
   HAZEL AI — Main Brain
   File: ai.js

   This file:
   - Reads user messages
   - Normalizes different typing styles
   - Detects intents from ai-data.js
   - Selects a random response
   - Uses fallback when nothing matches
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
        // "hellooo" → "hello"
        // "kaaaise" → "kaise"
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

    // Exact phrase
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
                 * Longer phrases receive a slightly
                 * higher score.
                 *
                 * Example:
                 * "hello" < "hello hazel"
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

    // Empty message
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
   6. OPTIONAL DEBUG FUNCTION
   =========================================================
   
   Browser console mein test karne ke liye:

   testHazelAI("hello hazel");
   testHazelAI("kesi hooo");
   testHazelAI("good night");
   
   ========================================================= */

function testHazelAI(message) {

    const response = getHazelResponse(message);

    console.log("User:", message);
    console.log("HAZEL AI:", response);

    return response;
      }
