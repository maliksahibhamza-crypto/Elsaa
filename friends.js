// ===================================
// FIREBASE IMPORTS
// ===================================

import {

    auth,

    db

} from "./firebase-config.js";

import {

    onAuthStateChanged

} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

import {

    doc,

    getDoc,

    collection,

    query,

    where,

    getDocs,

    addDoc,

    setDoc,

    updateDoc,

    deleteDoc,

    onSnapshot,

    serverTimestamp

} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";


// ===================================
// DOM ELEMENTS
// ===================================

const backBtn = document.getElementById("backBtn");

const addFriendBtn = document.getElementById("addFriendBtn");

const searchBtn = document.getElementById("searchBtn");

const searchUser = document.getElementById("searchUser");

const searchResult = document.getElementById("searchResult");

const sendRequestBtn = document.getElementById("sendRequestBtn");

const pendingRequests = document.getElementById("pendingRequests");

const friendsList = document.getElementById("friendsList");

const friendsCount = document.getElementById("friendsCount");

const emptyFriends = document.getElementById("emptyFriends");

const loadingScreen = document.getElementById("loadingScreen");


// ===================================
// GLOBAL VARIABLES
// ===================================

let currentUser = null;

let currentUserData = null;

let selectedUser = null;


// ===================================
// AUTH CHECK
// ===================================

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        window.location.href = "login.html";

        return;

    }

    currentUser = user;

    const userRef = doc(db, "users", user.uid);

    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {

        currentUserData = userSnap.data();

    }

});


// ===================================
// BACK BUTTON
// ===================================

backBtn.addEventListener("click", () => {

    window.location.href = "accounts.html";

});


// ===================================
// ADD FRIEND BUTTON
// ===================================

addFriendBtn.addEventListener("click", () => {

    searchUser.focus();

});
// ===================================
// SEARCH USER
// ===================================

searchBtn.addEventListener("click", searchFriend);

searchUser.addEventListener("keydown", (e) => {

    if (e.key === "Enter") {

        searchFriend();

    }

});


async function searchFriend() {

    const username = searchUser.value.trim().toLowerCase();

    if (!username) {

        alert("Please enter a username.");

        return;

    }

    loadingScreen.classList.remove("hidden");

    searchResult.classList.add("hidden");

    selectedUser = null;

    try {

        const q = query(

            collection(db, "users"),

            where("username", "==", username)

        );

        const snapshot = await getDocs(q);

        loadingScreen.classList.add("hidden");

        if (snapshot.empty) {

            alert("User not found.");

            return;

        }

        const userDoc = snapshot.docs[0];

        const userData = userDoc.data();

        if (userDoc.id === currentUser.uid) {

            alert("You can't search yourself.");

            return;

        }

        selectedUser = {

            uid: userDoc.id,

            ...userData

        };

        document.getElementById("resultName").textContent =

            userData.displayName || "Unknown User";

        document.getElementById("resultUsername").textContent =

            "@" + userData.username;

        document.getElementById("resultProfile").src =

            userData.profilePicture || "images/default-profile.png";

        sendRequestBtn.disabled = false;

        sendRequestBtn.textContent = "Add";

        searchResult.classList.remove("hidden");

    }

    catch (error) {

        loadingScreen.classList.add("hidden");

        console.error(error);

        alert("Something went wrong.");

    }

}
// ===================================
// SEND FRIEND REQUEST
// ===================================

sendRequestBtn.addEventListener("click", sendFriendRequest);

async function sendFriendRequest() {

    if (!selectedUser) {

        alert("Please search and select a user first.");

        return;

    }

    loadingScreen.classList.remove("hidden");

    try {

        // Check if request already exists

        const existingRequest = query(

            collection(db, "friendRequests"),

            where("senderId", "==", currentUser.uid),

            where("receiverId", "==", selectedUser.uid)

        );

        const existingSnapshot = await getDocs(existingRequest);

        if (!existingSnapshot.empty) {

            loadingScreen.classList.add("hidden");

            alert("Friend request already sent.");

            return;

        }


        // Create Friend Request

        await addDoc(collection(db, "friendRequests"), {

            senderId: currentUser.uid,

            senderName: currentUserData.displayName,

            senderUsername: currentUserData.username,

            senderPhoto: currentUserData.profilePicture || "",

            receiverId: selectedUser.uid,

            receiverName: selectedUser.displayName,

            receiverUsername: selectedUser.username,

            receiverPhoto: selectedUser.profilePicture || "",

            status: "pending",

            createdAt: serverTimestamp()

        });


        loadingScreen.classList.add("hidden");

        alert("Friend request sent successfully!");

        sendRequestBtn.disabled = true;

        sendRequestBtn.textContent = "Request Sent";

    }

    catch (error) {

        loadingScreen.classList.add("hidden");

        console.error(error);

        alert("Failed to send friend request.");

    }

}
// ===================================
// LOAD PENDING FRIEND REQUESTS
// ===================================

function loadPendingRequests() {

    const requestsQuery = query(

        collection(db, "friendRequests"),

        where("receiverId", "==", currentUser.uid),

        where("status", "==", "pending")

    );

    onSnapshot(requestsQuery, (snapshot) => {

        pendingRequests.innerHTML = "";

        if (snapshot.empty) {

            pendingRequests.innerHTML = `
                <p style="text-align:center;color:gray;">
                    No pending requests
                </p>
            `;

            return;

        }

        snapshot.forEach((requestDoc) => {

            const request = requestDoc.data();

            pendingRequests.innerHTML += `

                <div class="friend-card">

                    <img
                        src="${request.senderPhoto || "images/default-profile.png"}"
                        class="friend-profile"
                    >

                    <div class="friend-info">

                        <h4>${request.senderName}</h4>

                        <p>@${request.senderUsername}</p>

                    </div>

                    <div class="friend-actions">

                        <button
                            class="accept-btn"
                            onclick="acceptRequest('${requestDoc.id}')"
                        >
                            ✓
                        </button>

                        <button
                            class="reject-btn"
                            onclick="rejectRequest('${requestDoc.id}')"
                        >
                            ✕
                        </button>

                    </div>

                </div>

            `;

        });

    });

}


// ===================================
// ACCEPT REQUEST
// ===================================

window.acceptRequest = async function(requestId) {

    try {

        const requestRef = doc(db, "friendRequests", requestId);

        const requestSnap = await getDoc(requestRef);

        if (!requestSnap.exists()) return;

        const request = requestSnap.data();

        await setDoc(

            doc(db, "friends", `${currentUser.uid}_${request.senderId}`),

            {

                user1: currentUser.uid,

                user2: request.senderId,

                createdAt: serverTimestamp()

            }

        );

        await updateDoc(requestRef, {

            status: "accepted"

        });

        alert("Friend Added!");

    }

    catch (error) {

        console.error(error);

    }

};


// ===================================
// REJECT REQUEST
// ===================================

window.rejectRequest = async function(requestId) {

    try {

        await deleteDoc(

            doc(db, "friendRequests", requestId)

        );

    }

    catch (error) {

        console.error(error);

    }

};


// ===================================
// START REQUEST LISTENER
// ===================================

onAuthStateChanged(auth, (user) => {

    if (user) {

        loadPendingRequests();

    }

});

// ===================================
// LOAD FRIENDS LIST
// ===================================

function loadFriends() {

    const friendsQuery = query(

        collection(db, "friends")

    );

    onSnapshot(friendsQuery, async (snapshot) => {

        friendsList.innerHTML = "";

        let totalFriends = 0;

        for (const friendDoc of snapshot.docs) {

            const friend = friendDoc.data();

            let friendId = null;

            if (friend.user1 === currentUser.uid) {

                friendId = friend.user2;

            }

            else if (friend.user2 === currentUser.uid) {

                friendId = friend.user1;

            }

            else {

                continue;

            }

            const userSnap = await getDoc(

                doc(db, "users", friendId)

            );

            if (!userSnap.exists()) continue;

            const user = userSnap.data();

            totalFriends++;

            friendsList.innerHTML += createFriendCard(

                user,

                friendId

            );

        }

        friendsCount.textContent = totalFriends;

        if (totalFriends === 0) {

            emptyFriends.style.display = "block";

        }

        else {

            emptyFriends.style.display = "none";

        }

    });

}


// ===================================
// CREATE FRIEND CARD
// ===================================

function createFriendCard(user, friendId) {

    return `

        <div class="friend-card">

            <img
                src="${user.profilePicture || "images/default-profile.png"}"
                class="friend-profile"
            >

            <div class="friend-info">

                <h4>${user.displayName}</h4>

                <p>@${user.username}</p>

                ${user.online
                    ? '<span class="online-status">🟢 Online</span>'
                    : '<span class="offline-status">⚪ Offline</span>'}

            </div>

            <div class="friend-actions">

                <button
                    class="chat-btn"
                    onclick="openChat('${friendId}')"
                >
                    Chat
                </button>

            </div>

        </div>

    `;

}


// ===================================
// OPEN CHAT
// ===================================

window.openChat = function(friendId) {

    window.location.href = `chat.html?uid=${friendId}`;

};


// ===================================
// START FRIENDS LIST
// ===================================

onAuthStateChanged(auth, (user) => {

    if (user) {

        loadFriends();

    }

});
// ===================================
// SEARCH FRIENDS LIST
// ===================================

const friendSearch = document.getElementById("friendSearch");

if (friendSearch) {

    friendSearch.addEventListener("input", () => {

        const keyword = friendSearch.value
            .trim()
            .toLowerCase();

        const cards = document.querySelectorAll(".friend-card");

        cards.forEach((card) => {

            const name = card.querySelector("h4")
                .textContent
                .toLowerCase();

            const username = card.querySelector("p")
                .textContent
                .toLowerCase();

            if (

                name.includes(keyword) ||

                username.includes(keyword)

            ) {

                card.style.display = "flex";

            }

            else {

                card.style.display = "none";

            }

        });

    });

}


// ===================================
// REFRESH FRIENDS
// ===================================

async function refreshFriends() {

    friendsList.innerHTML = "";

    friendsCount.textContent = "0";

    loadFriends();

}


// ===================================
// AUTO REFRESH
// ===================================

setInterval(() => {

    if (currentUser) {

        refreshFriends();

    }

}, 30000);
// ===================================
// USER ONLINE STATUS
// ===================================

async function setOnlineStatus(status) {

    if (!currentUser) return;

    try {

        await updateDoc(

            doc(db, "users", currentUser.uid),

            {

                online: status,

                lastSeen: serverTimestamp()

            }

        );

    }

    catch (error) {

        console.error(error);

    }

}


// ===================================
// USER ONLINE
// ===================================

window.addEventListener("load", () => {

    setOnlineStatus(true);

});


// ===================================
// USER OFFLINE
// ===================================

window.addEventListener("beforeunload", () => {

    setOnlineStatus(false);

});


// ===================================
// PAGE VISIBILITY
// ===================================

document.addEventListener("visibilitychange", () => {

    if (document.hidden) {

        setOnlineStatus(false);

    }

    else {

        setOnlineStatus(true);

    }

});
