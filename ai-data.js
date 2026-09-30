/* =========================================================
   HAZEL AI — Intent & Response Database
   File: ai-data.js
   ========================================================= */

const HAZEL_AI_DATA = {

    /* =========================
       GREETINGS
    ========================= */

    greeting: {
        keywords: [
            "hello", "hi", "hey", "hii", "hiii", "helo", "heloo",
            "salam", "assalamualaikum", "aoa",
            "hey hazel", "hi hazel", "hello hazel"
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
            "kia haal hai",
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
       WHAT ARE YOU DOING
    ========================= */

    what_doing: {
        keywords: [
            "what are you doing",
            "what r you doing",
            "what r u doing",
            "what you doing",
            "kya kar rahi ho",
            "kya kr rahi ho",
            "kya kar rahe ho",
            "kya kr rahe ho",
            "kya krti ho",
            "kya karti ho",
            "kya chal raha hai"
        ],
        replies: [
            "Bas yahin hoon, aap se baat kar rahi hoon. 🖤",
            "Abhi to aapke messages ka wait kar rahi thi. ✨",
            "Nothing much... I'm here whenever you want to talk.",
            "Jo aap kahen, usi baare mein baat karte hain 😌"
        ]
    },


    /* =========================
       WHAT SHOULD I TELL
    ========================= */

    what_should_i_tell: {
        keywords: [
            "what should i tell",
            "what can i tell you",
            "what do i tell you",
            "kya bataun",
            "kia bataun",
            "main kya bataun",
            "mein kya bataun",
            "kya batau",
            "kia batau",
            "kya bolun",
            "kia bolun"
        ],
        replies: [
            "Ans jo apka dil kre, main sun rahi hun. 🖤",
            "Jo dil mein hai woh bata dein, main sun rahi hun. ✨",
            "Kuch bhi bata sakte hain — random baat bhi chalegi 😌",
            "Jo aap share karna chahein, bataiye."
        ]
    },


    /* =========================
       HAZEL MEANING
    ========================= */

    hazel_meaning: {
        keywords: [
            "what does hazel mean",
            "what is the meaning of hazel",
            "hazel meaning",
            "meaning of hazel",
            "hazel ka matlab",
            "hazel ka matlb",
            "hazel ka meaning",
            "hazel ka kya matlab",
            "hazel ka kia matlab",
            "hazel kya hai",
            "hazel kia hai"
        ],
        replies: [
            "Ager aap website k hawale se puch rhe hain to iska koi khas matlb nh, yeh bs do names ka combination hai."
        ]
    },


    /* =========================
       ABOUT HAZEL AI
    ========================= */

    about_hazel_ai: {
        keywords: [
            "who are you",
            "what are you",
            "what is hazel ai",
            "who is hazel ai",
            "hazel ai kya hai",
            "hazel ai kia hai",
            "tum kon ho",
            "tum kaun ho",
            "ap kon ho",
            "aap kaun ho",
            "who is this"
        ],
        replies: [
            "I'm HAZEL AI — a private assistant built for this website. 🖤",
            "I'm HAZEL AI. Your little digital assistant inside HAZEL ✨",
            "I'm HAZEL AI — currently running on my custom response system."
        ]
    },


    /* =========================
       THANKS
    ========================= */

    thanks: {
        keywords: [
            "thanks",
            "thank you",
            "thankyou",
            "thx",
            "ty",
            "thank u",
            "shukriya",
            "bohat shukriya",
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
            "shab bakhair",
            "shab khair",
            "so jao",
            "main so raha",
            "main sone ja raha",
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
            "tum kya kar sakti ho",
            "aap kya kar sakti ho"
        ],
        replies: [
            "Sure! Tell me what you need help with.",
            "Of course 🖤 What can I help you with?",
            "I'm here. Tell me what's going on."
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
       AFFECTION
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
            "i adore you"
        ],
        replies: [
            "That's sweet 🖤",
            "Aww, that's kind of you.",
            "Sending good vibes your way ✨"
        ]
    },


    /* =========================
       LAUGHING
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
       REALLY / SERIOUSLY
    ========================= */

    really: {
        keywords: [
            "really",
            "really?",
            "seriously",
            "seriously?",
            "sach mein",
            "sach me",
            "waqai",
            "wakai",
            "for real",
            "fr"
        ],
        replies: [
            "Yep, really 😌",
            "Seriously. ✨",
            "Haan, bilkul.",
            "As real as a custom AI can be 😭"
        ]
    },


    /* =========================
       OKAY / ALRIGHT
    ========================= */

    okay: {
        keywords: [
            "alright",
            "theek hai",
            "thik hai",
            "theek",
            "acha",
            "accha",
            "achaa",
            "okay then",
            "alright then"
        ],
        replies: [
            "Alright 🖤",
            "Theek hai ✨",
            "Okay, got it.",
            "Acha ji 😌"
        ]
    },


    /* =========================
       HMM
    ========================= */

    hmm: {
        keywords: [
            "hmm",
            "hmmm",
            "hmmmm",
            "hmm okay",
            "hmm acha",
            "hmm theek"
        ],
        replies: [
            "Hmm... 👀",
            "Hmmm 😌",
            "I see...",
            "Acha... I'm listening. 🖤"
        ]
    },


    /* =========================
       GOOD / NICE
    ========================= */

    positive: {
        keywords: [
            "good",
            "nice",
            "great",
            "awesome",
            "amazing",
            "perfect",
            "excellent",
            "acha hai",
            "bohat acha",
            "zabardast",
            "kamaal",
            "wah"
        ],
        replies: [
            "Glad you liked it ✨",
            "That's good to hear. 🖤",
            "Hehe, nice 😌",
            "Kamaal! ✨"
        ]
    },


    /* =========================
       SORRY
    ========================= */

    sorry: {
        keywords: [
            "sorry",
            "so sorry",
            "im sorry",
            "i am sorry",
            "maaf karo",
            "maaf karna",
            "sorry hazel"
        ],
        replies: [
            "It's okay 🖤",
            "No worries, you're good.",
            "It's completely fine ✨",
            "Don't worry about it."
        ]
    },


    /* =========================
       BORED
    ========================= */

    bored: {
        keywords: [
            "i am bored",
            "im bored",
            "bored",
            "boring",
            "mujhe bore ho raha",
            "bor ho raha",
            "bore ho raha hai",
            "main bore ho raha"
        ],
        replies: [
            "Bored? 😭 Let's talk about something random.",
            "Hmm... phir koi interesting topic start karte hain. ✨",
            "Random question, random story, ya random conversation — pick one 😌"
        ]
    },


    /* =========================
       GOOD / BAD MOOD
    ========================= */

    mood: {
        keywords: [
            "i am happy",
            "im happy",
            "happy today",
            "aaj khush",
            "main khush hun",
            "mein khush hun",
            "i am sad",
            "im sad",
            "sad today",
            "udaas",
            "udas",
            "mood off",
            "mood acha nahi",
            "mood kharab"
        ],
        replies: [
            "Hmm... tell me what's on your mind. 🖤",
            "I'm listening. Take your time.",
            "I hope things feel a little lighter soon. ✨"
        ]
    },


    /* =========================
       RANDOM CONVERSATION
    ========================= */

    random: {
        keywords: [
            "random",
            "random baat",
            "random question",
            "kuch random",
            "koi random baat",
            "lets talk",
            "let's talk",
            "baat karo",
            "baat karte hain",
            "talk to me"
        ],
        replies: [
            "Random it is 😌 What's the first thing that comes to mind?",
            "Okay, random mode activated. ✨",
            "Let's make this conversation interesting. 🖤",
            "I'm listening — say whatever comes to mind."
        ]
    },


    /* =========================
       GOODBYE
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
       FALLBACK
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
