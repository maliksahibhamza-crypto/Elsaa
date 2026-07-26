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

const searchUser = document.getElementById("searchUser");

const searchBtn = document.getElementById("searchBtn");

const searchResult = document.getElementById("searchResult");

const resultProfile = document.getElementById("resultProfile");

const resultName = document.getElementById("resultName");

const resultUsername = document.getElementById("resultUsername");

const sendRequestBtn = document.getElementById("sendRequestBtn");

const pendingRequests = document.getElementById("pendingRequests");

const friendsList = document.getElementById("friendsList");

const friendsCount = document.getElementById("friendsCount");

const emptyFriends = document.getElementById("emptyFriends");

const loadingScreen = document.getElementById("loadingScreen");

const homeBtn = document.getElementById("homeBtn");

const chatBtn = document.getElementById("chatBtn");

const settingsBtn = document.getElementById("settingsBtn");


// ===================================
// GLOBAL VARIABLES
// ===================================

let currentUser = null;

let currentUserData = null;

let selectedUser = null;


// ===================================
// LOADING FUNCTIONS
// ===================================

function showLoading() {

    loadingScreen.classList.remove("hidden");

}

function hideLoading() {

    loadingScreen.classList.add("hidden");

}


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

    if (!userSnap.exists()) {

        alert("User profile not found.");

        return;

    }

    currentUserData = userSnap.data();

    loadPendingRequests();

    loadFriends();

    setOnlineStatus(true);

});


// ===================================
// HEADER BUTTONS
// ===================================

backBtn.addEventListener("click", () => {

    window.location.href = "accounts.html";

});

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

    showLoading();

    searchResult.classList.add("hidden");

    selectedUser = null;

    try {

        const searchQuery = query(

            collection(db, "users"),

            where("username", "==", username)

        );

        const snapshot = await getDocs(searchQuery);

        hideLoading();

        if (snapshot.empty) {

            alert("User not found.");

            return;

        }

        const userDoc = snapshot.docs[0];

        const userData = userDoc.data();

        if (userDoc.id === currentUser.uid) {

            alert("You can't add yourself.");

            return;

        }

        selectedUser = {

            uid: userDoc.id,

            ...userData

        };

        resultProfile.src =

            userData.profilePicture || "images/default-profile.png";

        resultName.textContent =

            userData.displayName || "Unknown User";

        resultUsername.textContent =

            "@" + userData.username;

        sendRequestBtn.disabled = false;

        sendRequestBtn.innerHTML = `

            <i class="fa-solid fa-user-plus"></i>

            Add

        `;

        searchResult.classList.remove("hidden");

    }

    catch (error) {

        hideLoading();

        console.error(error);

        alert(error.message);

    }

}
// ===================================
// SEND FRIEND REQUEST
// ===================================

sendRequestBtn.addEventListener("click", sendFriendRequest);

async function sendFriendRequest() {

    if (!selectedUser) {

        alert("Please search a user first.");

        return;

    }

    showLoading();

    try {

        // ===========================
        // Already Sent Request?
        // ===========================

        const requestQuery = query(

            collection(db, "friendRequests"),

            where("senderId", "==", currentUser.uid),

            where("receiverId", "==", selectedUser.uid)

        );

        const requestSnapshot = await getDocs(requestQuery);

        if (!requestSnapshot.empty) {

            hideLoading();

            alert("Friend request already sent.");

            return;

        }


        // ===========================
        // Already Friends?
        // ===========================

        const friendDoc1 = await getDoc(

            doc(db, "friends", `${currentUser.uid}_${selectedUser.uid}`)

        );

        const friendDoc2 = await getDoc(

            doc(db, "friends", `${selectedUser.uid}_${currentUser.uid}`)

        );

        if (friendDoc1.exists() || friendDoc2.exists()) {

            hideLoading();

            alert("You are already friends.");

            return;

        }


        // ===========================
        // Create Friend Request
        // ===========================

        await addDoc(

            collection(db, "friendRequests"),

            {

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

            }

        );

        hideLoading();

        alert("Friend request sent successfully!");

        sendRequestBtn.disabled = true;

        sendRequestBtn.innerHTML = `

            <i class="fa-solid fa-check"></i>

            Request Sent

        `;

    }

    catch (error) {

        hideLoading();

        console.error(error);

        alert(error.message);

    }

}
// ===================================
// LOAD PENDING REQUESTS
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

                <p class="no-request">

                    No Pending Requests

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

    showLoading();

    try {

        const requestRef = doc(db, "friendRequests", requestId);

        const requestSnap = await getDoc(requestRef);

        if (!requestSnap.exists()) {

            hideLoading();

            return;

        }

        const request = requestSnap.data();

        await setDoc(

            doc(

                db,

                "friends",

                `${request.senderId}_${request.receiverId}`

            ),

            {

                user1: request.senderId,

                user2: request.receiverId,

                createdAt: serverTimestamp()

            }

        );

        await updateDoc(

            requestRef,

            {

                status: "accepted"

            }

        );

        hideLoading();

        alert("Friend Added Successfully!");

    }

    catch (error) {

        hideLoading();

        console.error(error);

        alert(error.message);

    }

};


// ===================================
// REJECT REQUEST
// ===================================

window.rejectRequest = async function(requestId) {

    showLoading();

    try {

        await deleteDoc(

            doc(

                db,

                "friendRequests",

                requestId

            )

        );

        hideLoading();

        alert("Request Rejected.");

    }

    catch (error) {

        hideLoading();

        console.error(error);

        alert(error.message);

    }

};
// ===================================
// LOAD FRIENDS LIST
// ===================================

function loadFriends() {

    const friendsQuery = collection(db, "friends");

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

            if (!userSnap.exists()) {

                continue;

            }

            const user = userSnap.data();

            totalFriends++;

            friendsList.innerHTML += createFriendCard(

                user,

                friendId

            );

        }

        friendsCount.textContent = `${totalFriends} Friends`;

        emptyFriends.style.display =

            totalFriends === 0 ? "block" : "none";

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

                alt="Profile"

            >

            <div class="friend-info">

                <h4>${user.displayName}</h4>

                <p>@${user.username}</p>

                <span class="${user.online ? "online-status" : "offline-status"}">

                    ${user.online ? "🟢 Online" : "⚪ Offline"}

                </span>

            </div>

            <div class="friend-actions">

                <button

                    class="chat-btn"

                    onclick="openChat('${friendId}')"

                >

                    <i class="fa-solid fa-comments"></i>

                </button>

            </div>

        </div>

    `;

}


// ===================================
// OPEN CHAT
// ===================================

window.openChat = function(friendId) {

    window.location.href =

        `chat.html?uid=${friendId}`;

};
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
// PAGE EVENTS
// ===================================

window.addEventListener("load", () => {

    setOnlineStatus(true);

});

window.addEventListener("beforeunload", () => {

    setOnlineStatus(false);

});

document.addEventListener("visibilitychange", () => {

    if (document.hidden) {

        setOnlineStatus(false);

    }

    else {

        setOnlineStatus(true);

    }

});


// ===================================
// BOTTOM NAVIGATION
// ===================================

homeBtn?.addEventListener("click", () => {

    window.location.href = "accounts.html";

});

chatBtn?.addEventListener("click", () => {

    window.location.href = "chat.html";

});

settingsBtn?.addEventListener("click", () => {

    window.location.href = "settings.html";

});


// ===================================
// SEARCH INPUT AUTO TRIM
// ===================================

searchUser?.addEventListener("input", () => {

    searchUser.value = searchUser.value.replace(/\s+/g, " ");

});


// ===================================
// GLOBAL ERROR HANDLER
// ===================================

window.addEventListener("error", (event) => {

    console.error("Friends.js Error:", event.error);

});


// ===================================
// FINISHED
// ===================================

console.log("Friends.js Loaded Successfully ✅");
