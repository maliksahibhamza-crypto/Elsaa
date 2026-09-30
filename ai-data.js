/* =========================================================
   HAZEL AI — Intent & Response Database
   File: ai-data.js

   Yahan HAZEL AI ke:
   - Intents
   - Keywords / phrases
   - Responses

   add/edit kiye jayenge.

   NOTE:
   Is file mein AI ka main logic nahi hai.
   Main logic baad mein ai.js handle karega.
   ========================================================= */

const HAZEL_AI_DATA = {

    /* =========================
       GREETINGS
       ========================= */

    greeting: {
        keywords: [
            "hello",
            "hi",
            "hey",
            "hii",
            "hiii",
            "helo",
            "heloo",
            "salam",
            "assalamualaikum",
            "aoa",
            "aoa hazel",
            "hey hazel",
            "hi hazel",
            "hello hazel"
        ],

        replies: [
            "Hello! 👋 Welcome to HAZEL AI.",
            "Hey! HAZEL AI is here ✨",
            "Hello there 🖤 How can I help you?",
            "Heyy! What's on your mind?"
        ]
    },


    /* =========================
       HOW ARE YOU
       ========================= */

    how_are_you: {
        keywords: [
            "how are you",
            "how r you",
            "how r u",
            "hows you",
            "how you doing",
            "how are u",
            "are you okay",
            "u good",
            "you good",
            "kesi ho",
            "kaisi ho",
            "kese ho",
            "kaise ho",
            "kya haal hai",
            "kya haal",
            "haal kaisa hai",
            "sab theek hai"
        ],

        replies: [
            "I'm doing good ✨ Thanks for asking.",
            "I'm good 🖤 How about you?",
            "All systems are good 😌",
            "I'm perfectly fine. What's going on with you?"
        ]
    },


    /* =========================
       THANK YOU
       ========================= */

    thanks: {
        keywords: [
            "thanks",
            "thank you",
            "thankyou",
            "thx",
            "ty",
            "shukriya",
            "bohat shukriya",
            "thank u",
            "thanks hazel"
        ],

        replies: [
            "You're welcome 🖤",
            "Anytime!",
            "No problem ✨",
            "My pleasure."
        ]
    },


    /* =========================
       GOOD MORNING
       ========================= */

    good_morning: {
        keywords: [
            "good morning",
            "gm",
            "morning",
            "subha bakhair",
            "subah bakhair",
            "saba bakhair"
        ],

        replies: [
            "Good morning ☀️ Have a beautiful day.",
            "Good morning! ✨ Ready for a new day?",
            "Morning 🖤 Hope your day goes well."
        ]
    },


    /* =========================
       GOOD NIGHT
       ========================= */

    good_night: {
        keywords: [
            "good night",
            "goodnight",
            "gn",
            "night",
            "shab bakhair",
            "shab khair",
            "so jao",
            "main so raha",
            "i am going to sleep"
        ],

        replies: [
            "Good night 🌙 Take care.",
            "Good night! Sleep well ✨",
            "Shab khair 🖤",
            "Rest well. See you soon."
        ]
    },


    /* =========================
       HELP
       ========================= */

    help: {
        keywords: [
            "help",
            "help me",
            "can you help",
            "mujhe help chahiye",
            "madad chahiye",
            "meri help karo",
            "what can you do",
            "tum kya kar sakti ho"
        ],

        replies: [
            "Sure! Tell me what you need help with.",
            "Of course 🖤 What can I help you with?",
            "I'm here. Tell me what's going on."
        ]
    },


    /* =========================
       HAZEL AI
       ========================= */

    about_hazel_ai: {
        keywords: [
            "who are you",
            "what are you",
            "what is hazel ai",
            "who is hazel ai",
            "hazel ai kya hai",
            "tum kon ho",
            "tum kaun ho",
            "ap kon ho",
            "aap kaun ho"
        ],

        replies: [
            "I'm HAZEL AI — a private assistant built for this website. 🖤",
            "I'm HAZEL AI. Think of me as your little digital assistant inside HAZEL ✨",
            "I'm HAZEL AI — currently running on my custom response system."
        ]
    },


    /* =========================
       YES
       ========================= */

    yes: {
        keywords: [
            "yes",
            "yeah",
            "yep",
            "yup",
            "yess",
            "haan",
            "han",
            "jee",
            "ji",
            "okay",
            "ok",
            "oki",
            "okie",
            "okiee",
            "okieee"
        ],

        replies: [
            "Alright ✨",
            "Okay 🖤",
            "Got it.",
            "OkiEe 😌"
        ]
    },


    /* =========================
       NO
       ========================= */

    no: {
        keywords: [
            "no",
            "nope",
            "nah",
            "not",
            "nahi",
            "nahin",
            "jee nahi",
            "bilkul nahi"
        ],

        replies: [
            "Alright, no problem.",
            "Okay 🖤",
            "Got it.",
            "No worries."
        ]
    },


    /* =========================
       LOVE / AFFECTION
       ========================= */

    affection: {
        keywords: [
            "love you",
            "i love you",
            "love u",
            "luv u",
            "i luv you",
            "mohabbat",
            "pyar",
            "pyaar",
            "love",
            "i adore you"
        ],

        replies: [
            "That's sweet 🖤",
            "Aww, that's kind of you.",
            "Sending good vibes your way ✨"
        ]
    },


    /* =========================
       LAUGHING / FUN
       ========================= */

    laughing: {
        keywords: [
            "haha",
            "hahaha",
            "hehe",
            "hehehe",
            "lol",
            "lmao",
            "😂",
            "🤣",
            "lolll"
        ],

        replies: [
            "😂",
            "Haha 😭",
            "Okay, that was funny.",
            "😂😂 What happened?"
        ]
    },


    /* =========================
       FAREWELL
       ========================= */

    goodbye: {
        keywords: [
            "bye",
            "goodbye",
            "see you",
            "see ya",
            "allah hafiz",
            "khuda hafiz",
            "phir milte",
            "talk later",
            "see you later"
        ],

        replies: [
            "Bye! Take care 🖤",
            "See you later ✨",
            "Allah Hafiz.",
            "Take care. I'll be here whenever you return."
        ]
    },


    /* =========================
       FALLBACK RESPONSES
       ========================= */

    fallback: {
        replies: [
            "Hmm... I'm not sure I understood that. 🤔",
            "Interesting... tell me a little more.",
            "I don't have a response for that yet.",
            "I'm still learning. Try asking that in another way.",
            "Hmm, I need a little more context."
        ]
    }

};
