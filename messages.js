// =========================================
// HAZEL MESSAGES JS
// =========================================


// =========================================
// Firebase
// =========================================

import { auth, db } from "./firebase-config.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

import {
    collection,
    query,
    where,
    getDocs,
    doc,
    getDoc,
    setDoc,
    addDoc,
    orderBy,
    onSnapshot,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";


// =========================================
// Theme
// =========================================

const savedTheme =
    localStorage.getItem("hazelTheme") || "black-gold";

document.body.setAttribute(
    "data-theme",
    savedTheme
);


// =========================================
// Elements
// =========================================

const backButton =
    document.getElementById("backButton");

const newMessageButton =
    document.getElementById("newMessageButton");

const emptyNewMessage =
    document.getElementById("emptyNewMessage");

const newMessagePanel =
    document.getElementById("newMessagePanel");

const closeSearchButton =
    document.getElementById("closeSearchButton");

const hazelIdSearch =
    document.getElementById("hazelIdSearch");

const searchUserButton =
    document.getElementById("searchUserButton");

const searchResult =
    document.getElementById("searchResult");

const myHazelId =
    document.getElementById("myHazelId");

const copyIdButton =
    document.getElementById("copyIdButton");

const chatList =
    document.getElementById("chatList");

const emptyState =
    document.getElementById("emptyState");

const chatOverlay =
    document.getElementById("chatOverlay");

const closeChatButton =
    document.getElementById("closeChatButton");

const chatUserName =
    document.getElementById("chatUserName");

const chatUserHazelId =
    document.getElementById("chatUserHazelId");

const messagesContainer =
    document.getElementById("messagesContainer");

const messageForm =
    document.getElementById("messageForm");

const messageInput =
    document.getElementById("messageInput");

const toast =
    document.getElementById("toast");


// =========================================
// State
// =========================================

let currentUser = null;

let currentUserProfile = null;

let currentChatId = null;

let unsubscribeMessages = null;


// =========================================
// Toast
// =========================================

let toastTimer;

function showToast(message) {

    clearTimeout(toastTimer);

    toast.textContent = message;

    toast.classList.add("show");

    toastTimer = setTimeout(() => {

        toast.classList.remove("show");

    }, 2200);
}


// =========================================
// Open Search
// =========================================

function openSearch() {

    newMessagePanel.classList.add("show");

    setTimeout(() => {

        hazelIdSearch.focus();

    }, 100);

}


// =========================================
// Close Search
// =========================================

function closeSearch() {

    newMessagePanel.classList.remove("show");

    hazelIdSearch.value = "";

    searchResult.innerHTML = "";

}


// =========================================
// Navigation
// =========================================

backButton.addEventListener("click", () => {

    if (document.referrer) {

        history.back();

    } else {

        window.location.href = "accounts.html";

    }

});


// =========================================
// New Message Buttons
// =========================================

newMessageButton.addEventListener(
    "click",
    openSearch
);

emptyNewMessage.addEventListener(
    "click",
    openSearch
);

closeSearchButton.addEventListener(
    "click",
    closeSearch
);


// =========================================
// Load Current User
// =========================================

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        window.location.href = "login.html";

        return;
    }

    currentUser = user;

    try {

        await loadCurrentUser();

        await loadChats();

    } catch (error) {

        console.error(error);

        showToast(
            "Could not load your HAZEL profile."
        );
    }

});


// =========================================
// Current User Profile
// =========================================

async function loadCurrentUser() {

    const userRef =
        doc(db, "users", currentUser.uid);

    const snapshot =
        await getDoc(userRef);


    if (!snapshot.exists()) {

        /*
           This can happen if an old account
           was created before the signup system.
        */

        const hazelId =
            await generateUniqueHazelId();

        const name =
            currentUser.displayName ||
            "HAZEL User";

        const username =
            currentUser.email
                ? currentUser.email
                    .split("@")[0]
                : `user${Date.now()}`;


        await setDoc(
            userRef,
            {

                uid: currentUser.uid,

                name: name,

                username: username,

                usernameLower:
                    username.toLowerCase(),

                hazelId: hazelId,

                createdAt:
                    serverTimestamp()

            }
        );


        currentUserProfile = {

            uid: currentUser.uid,

            name: name,

            username: username,

            hazelId: hazelId

        };

    } else {

        currentUserProfile =
            snapshot.data();
    }


    myHazelId.textContent =
        currentUserProfile.hazelId;
}


// =========================================
// Generate Unique HAZEL ID
// =========================================

async function generateUniqueHazelId() {

    for (let attempt = 0; attempt < 15; attempt++) {

        let randomPart;

        if (
            window.crypto &&
            crypto.randomUUID
        ) {

            randomPart =
                crypto.randomUUID()
                    .replace(/-/g, "")
                    .substring(0, 6)
                    .toUpperCase();

        } else {

            randomPart =
                Math.random()
                    .toString(36)
                    .substring(2, 8)
                    .toUpperCase();
        }


        const hazelId =
            `HZL-${randomPart}`;


        const usersRef =
            collection(db, "users");

        const idQuery =
            query(
                usersRef,
                where(
                    "hazelId",
                    "==",
                    hazelId
                )
            );

        const snapshot =
            await getDocs(idQuery);


        if (snapshot.empty) {

            return hazelId;
        }
    }

    throw new Error(
        "Unable to generate a unique HAZEL ID."
    );
}


// =========================================
// Copy HAZEL ID
// =========================================

copyIdButton.addEventListener(
    "click",
    async () => {

        if (!currentUserProfile) {
            return;
        }

        const id =
            currentUserProfile.hazelId;

        try {

            await navigator.clipboard.writeText(id);

            showToast("HAZEL ID copied");

        } catch {

            showToast(
                `Your HAZEL ID is ${id}`
            );
        }
    }
);


// =========================================
// Search User
// =========================================

searchUserButton.addEventListener(
    "click",
    searchUser
);


hazelIdSearch.addEventListener(
    "keydown",
    (event) => {

        if (event.key === "Enter") {

            event.preventDefault();

            searchUser();
        }
    }
);


async function searchUser() {

    const enteredId =
        hazelIdSearch.value
            .trim()
            .toUpperCase();


    if (!enteredId) {

        searchResult.innerHTML =
            `<div class="not-found">
                Enter a HAZEL ID first.
             </div>`;

        return;
    }


    if (!enteredId.startsWith("HZL-")) {

        searchResult.innerHTML =
            `<div class="not-found">
                HAZEL ID should start with HZL-
             </div>`;

        return;
    }


    searchUserButton.disabled = true;

    searchUserButton.textContent =
        "Searching";


    try {

        const usersRef =
            collection(db, "users");

        const userQuery =
            query(
                usersRef,
                where(
                    "hazelId",
                    "==",
                    enteredId
                )
            );

        const snapshot =
            await getDocs(userQuery);


        if (snapshot.empty) {

            searchResult.innerHTML =
                `<div class="not-found">
                    No user found with this HAZEL ID.
                 </div>`;

            return;
        }


        const userDoc =
            snapshot.docs[0];

        const userData =
            userDoc.data();


        // Don't allow chatting with yourself

        if (
            userDoc.id === currentUser.uid
        ) {

            searchResult.innerHTML =
                `<div class="not-found">
                    That's your own HAZEL ID.
                 </div>`;

            return;
        }


        searchResult.innerHTML = `

            <div class="user-result">

                <div class="user-result-avatar">
                    <i class="fa-solid fa-user"></i>
                </div>

                <div class="user-result-info">

                    <strong>
                        ${escapeHTML(
                            userData.name || "HAZEL User"
                        )}
                    </strong>

                    <span>
                        ${escapeHTML(
                            userData.hazelId
                        )}
                    </span>

                </div>

                <button
                    class="start-chat-button"
                    id="startChatButton"
                >
                    Start Chat
                </button>

            </div>
        `;


        document
            .getElementById("startChatButton")
            .addEventListener(
                "click",
                () => {

                    startChat(
                        userDoc.id,
                        userData
                    );

                }
            );


    } catch (error) {

        console.error(error);

        searchResult.innerHTML =
            `<div class="not-found">
                Something went wrong. Please try again.
             </div>`;

    } finally {

        searchUserButton.disabled = false;

        searchUserButton.textContent =
            "Search";
    }
}


// =========================================
// Create Chat ID
// =========================================

function createChatId(uid1, uid2) {

    return [uid1, uid2]
        .sort()
        .join("_");
}


// =========================================
// Start Chat
// =========================================

async function startChat(
    otherUid,
    otherUser
) {

    const chatId =
        createChatId(
            currentUser.uid,
            otherUid
        );


    const chatRef =
        doc(db, "chats", chatId);


    const chatSnapshot =
        await getDoc(chatRef);


    if (!chatSnapshot.exists()) {

        await setDoc(
            chatRef,
            {

                participants: [
                    currentUser.uid,
                    otherUid
                ],

                participantProfiles: {

                    [currentUser.uid]: {

                        name:
                            currentUserProfile.name,

                        hazelId:
                            currentUserProfile.hazelId

                    },

                    [otherUid]: {

                        name:
                            otherUser.name ||
                            "HAZEL User",

                        hazelId:
                            otherUser.hazelId

                    }

                },

                lastMessage: "",

                updatedAt:
                    serverTimestamp()

            }
        );
    }


    closeSearch();

    openChat(
        chatId,
        otherUid,
        otherUser
    );

    await loadChats();
}


// =========================================
// Load Chats
// =========================================

async function loadChats() {

    /*
       Simple participant lookup.

       This is suitable for a small private
       HAZEL user base.
    */

    const chatsRef =
        collection(db, "chats");

    const chatsQuery =
        query(
            chatsRef,
            where(
                "participants",
                "array-contains",
                currentUser.uid
            )
        );


    onSnapshot(
        chatsQuery,
        (snapshot) => {

            renderChats(snapshot);

        },
        (error) => {

            console.error(
                "Chat listener error:",
                error
            );

        }
    );
}


// =========================================
// Render Chats
// =========================================

function renderChats(snapshot) {

    chatList.innerHTML = "";


    if (snapshot.empty) {

        chatList.appendChild(
            emptyState
        );

        return;
    }


    const chats = [...snapshot.docs];


    chats.sort((a, b) => {

        const aTime =
            a.data().updatedAt?.seconds || 0;

        const bTime =
            b.data().updatedAt?.seconds || 0;

        return bTime - aTime;
    });


    chats.forEach(chatDoc => {

        const chat =
            chatDoc.data();


        const otherUid =
            chat.participants.find(
                uid =>
                    uid !== currentUser.uid
            );


        if (!otherUid) {
            return;
        }


        const otherProfile =
            chat.participantProfiles?.[otherUid];


        if (!otherProfile) {
            return;
        }


        const item =
            document.createElement("div");

        item.className =
            "chat-item";


        item.innerHTML = `

            <div class="chat-avatar">
                <i class="fa-solid fa-user"></i>
            </div>

            <div class="chat-item-info">

                <strong>
                    ${escapeHTML(
                        otherProfile.name ||
                        "HAZEL User"
                    )}
                </strong>

                <span>
                    ${
                        chat.lastMessage
                            ? escapeHTML(
                                chat.lastMessage
                            )
                            : otherProfile.hazelId
                    }
                </span>

            </div>

            <span class="chat-time">
                ${formatTime(
                    chat.updatedAt
                )}
            </span>
        `;


        item.addEventListener(
            "click",
            async () => {

                const userRef =
                    doc(
                        db,
                        "users",
                        otherUid
                    );

                const userSnapshot =
                    await getDoc(userRef);


                const userData =
                    userSnapshot.exists()
                        ? userSnapshot.data()
                        : otherProfile;


                openChat(
                    chatDoc.id,
                    otherUid,
                    userData
                );

            }
        );


        chatList.appendChild(item);

    });
}


// =========================================
// Open Chat
// =========================================

function openChat(
    chatId,
    otherUid,
    otherUser
) {

    currentChatId = chatId;


    chatUserName.textContent =
        otherUser.name ||
        "HAZEL User";


    chatUserHazelId.textContent =
        otherUser.hazelId ||
        "";


    chatOverlay.classList.add("show");


    messageInput.focus();


    listenToMessages(chatId);
}


// =========================================
// Listen To Messages
// =========================================

function listenToMessages(chatId) {

    if (unsubscribeMessages) {

        unsubscribeMessages();

        unsubscribeMessages = null;
    }


    messagesContainer.innerHTML = "";


    const messagesRef =
        collection(
            db,
            "chats",
            chatId,
            "messages"
        );


    const messagesQuery =
        query(
            messagesRef,
            orderBy(
                "createdAt",
                "asc"
            )
        );


    unsubscribeMessages =
        onSnapshot(
            messagesQuery,
            (snapshot) => {

                messagesContainer.innerHTML =
                    "";


                snapshot.forEach(
                    messageDoc => {

                        renderMessage(
                            messageDoc.data()
                        );

                    }
                );


                messagesContainer.scrollTop =
                    messagesContainer.scrollHeight;

            },
            (error) => {

                console.error(
                    "Message listener error:",
                    error
                );

            }
        );
}


// =========================================
// Render Message
// =========================================

function renderMessage(message) {

    const mine =
        message.senderId === currentUser.uid;


    const row =
        document.createElement("div");

    row.className =
        `message-row ${
            mine ? "mine" : "theirs"
        }`;


    const bubble =
        document.createElement("div");

    bubble.className =
        "message-bubble";


    const text =
        document.createElement("div");

    text.textContent =
        message.text || "";


    const time =
        document.createElement("span");

    time.className =
        "message-time";

    time.textContent =
        formatTime(message.createdAt);


    bubble.appendChild(text);

    bubble.appendChild(time);

    row.appendChild(bubble);

    messagesContainer.appendChild(row);
}


// =========================================
// Send Message
// =========================================

messageForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        if (
            !currentChatId ||
            !currentUser
        ) {

            return;
        }


        const text =
            messageInput.value.trim();


        if (!text) {

            return;
        }


        messageInput.disabled = true;


        try {

            const messagesRef =
                collection(
                    db,
                    "chats",
                    currentChatId,
                    "messages"
                );


            await addDoc(
                messagesRef,
                {

                    senderId:
                        currentUser.uid,

                    text: text,

                    createdAt:
                        serverTimestamp()

                }
            );


            await setDoc(
                doc(
                    db,
                    "chats",
                    currentChatId
                ),
                {

                    lastMessage:
                        text,

                    updatedAt:
          
