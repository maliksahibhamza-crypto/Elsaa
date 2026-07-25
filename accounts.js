// ===================================
// FIREBASE IMPORTS
// ===================================

import { auth, db } from "./firebase-config.js";

import {

    onAuthStateChanged,
    signOut

} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

import {

    doc,
    getDoc,
    updateDoc

} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";


// ===================================
// DOM ELEMENTS
// ===================================

const openSidebar = document.getElementById("openSidebar");

const closeSidebar = document.getElementById("closeSidebar");

const sidebar = document.getElementById("sidebar");

const sidebarOverlay = document.getElementById("sidebarOverlay");

const searchBtn = document.getElementById("searchBtn");

const closeSearch = document.getElementById("closeSearch");

const searchPanel = document.getElementById("searchPanel");

const notificationBtn = document.getElementById("notificationBtn");

const closeNotification = document.getElementById("closeNotification");

const notificationPanel = document.getElementById("notificationPanel");


// ===================================
// SIDEBAR
// ===================================

function openMenu() {

    sidebar.classList.add("active");

    sidebarOverlay.classList.add("active");

}

function closeMenu() {

    sidebar.classList.remove("active");

    sidebarOverlay.classList.remove("active");

}

openSidebar.addEventListener("click", openMenu);

closeSidebar.addEventListener("click", closeMenu);

sidebarOverlay.addEventListener("click", closeMenu);


// ===================================
// SEARCH PANEL
// ===================================

searchBtn.addEventListener("click", () => {

    searchPanel.classList.add("active");

    notificationPanel.classList.remove("active");

});

closeSearch.addEventListener("click", () => {

    searchPanel.classList.remove("active");

});


// ===================================
// NOTIFICATION PANEL
// ===================================

notificationBtn.addEventListener("click", () => {

    notificationPanel.classList.add("active");

    searchPanel.classList.remove("active");

});

closeNotification.addEventListener("click", () => {

    notificationPanel.classList.remove("active");

});


// ===================================
// ESC KEY SUPPORT
// ===================================

document.addEventListener("keydown", (event) => {

    if (event.key === "Escape") {

        closeMenu();

        searchPanel.classList.remove("active");

        notificationPanel.classList.remove("active");

    }

});
// ===================================
// PROFILE ELEMENTS
// ===================================

const headerUsername = document.getElementById("headerUsername");

const displayName = document.getElementById("displayName");

const profileUsername = document.getElementById("profileUsername");

const profileBio = document.getElementById("profileBio");

const profilePicture = document.getElementById("profilePicture");

const profilePictureInput = document.getElementById("profilePictureInput");

const editProfilePicture = document.getElementById("editProfilePicture");


// ===================================
// CURRENT USER
// ===================================

let currentUser = null;

let currentUserData = null;


// ===================================
// AUTH STATE
// ===================================

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        window.location.href = "login.html";

        return;

    }

    currentUser = user;

    await loadUserProfile();

});


// ===================================
// LOAD USER PROFILE
// ===================================

async function loadUserProfile() {

    try {

        const userRef = doc(db, "users", currentUser.uid);

        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {

            console.log("User profile not found.");

            return;

        }

        currentUserData = userSnap.data();

        displayProfile(currentUserData);

    }

    catch (error) {

        console.error(error);

    }

}


// ===================================
// DISPLAY PROFILE
// ===================================

function displayProfile(data) {

    headerUsername.textContent =

        data.username || "Username";

    displayName.textContent =

        data.name || "No Name";

    profileUsername.textContent =

        "@" + (data.username || "username");

    profileBio.textContent =

        data.bio || "No bio yet.";

    if (data.photoURL) {

        profilePicture.src = data.photoURL;

    }

}


// ===================================
// PROFILE PICTURE PICKER
// ===================================

editProfilePicture.addEventListener("click", () => {

    profilePictureInput.click();

});


profilePictureInput.addEventListener("change", () => {

    const file = profilePictureInput.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {

        profilePicture.src = reader.result;

    };

    reader.readAsDataURL(file);

});
// ===================================
// ONLINE STATUS
// ===================================

const onlineIndicator = document.getElementById("onlineIndicator");

const lastSeen = document.getElementById("lastSeen");


// ===================================
// SET USER ONLINE
// ===================================

async function setUserOnline() {

    if (!currentUser) return;

    try {

        await updateDoc(

            doc(db, "users", currentUser.uid),

            {

                online: true,

                lastSeen: new Date()

            }

        );

        onlineIndicator.innerHTML =

            '<i class="fa-solid fa-circle"></i> Online';

    }

    catch (error) {

        console.error(error);

    }

}


// ===================================
// SET USER OFFLINE
// ===================================

async function setUserOffline() {

    if (!currentUser) return;

    try {

        await updateDoc(

            doc(db, "users", currentUser.uid),

            {

                online: false,

                lastSeen: new Date()

            }

        );

    }

    catch (error) {

        console.error(error);

    }

}


// ===================================
// SHOW LAST SEEN
// ===================================

function updateLastSeen(data) {

    if (data.online) {

        onlineIndicator.innerHTML =

            '<i class="fa-solid fa-circle"></i> Online';

        lastSeen.textContent =

            "Last Seen: Online";

        return;

    }

    onlineIndicator.innerHTML =

        '<i class="fa-solid fa-circle"></i> Offline';

    if (data.lastSeen) {

        const date = data.lastSeen.toDate();

        lastSeen.textContent =

            "Last Seen: " +

            date.toLocaleString();

    }

    else {

        lastSeen.textContent =

            "Last Seen: Unknown";

    }

}


// ===================================
// WINDOW EVENTS
// ===================================

window.addEventListener("load", () => {

    setUserOnline();

});

window.addEventListener("beforeunload", () => {

    setUserOffline();

});

document.addEventListener("visibilitychange", () => {

    if (document.hidden) {

        setUserOffline();

    }

    else {

        setUserOnline();

    }

});
// ===================================
// COUNTDOWN ELEMENTS
// ===================================

const relationshipTime = document.getElementById("relationshipTime");

const specialTime = document.getElementById("specialTime");


// ===================================
// RELATIONSHIP COUNTDOWN
// ===================================

function updateRelationshipCountdown(date) {

    if (!date) {

        relationshipTime.textContent = "Not Set";

        return;

    }

    const now = new Date();

    const target = new Date(date);

    const diff = now - target;

    const totalDays = Math.floor(

        diff / (1000 * 60 * 60 * 24)

    );

    const years = Math.floor(totalDays / 365);

    const months = Math.floor(

        (totalDays % 365) / 30

    );

    const days = (totalDays % 365) % 30;

    relationshipTime.textContent =

        `${years} Years • ${months} Months • ${days} Days`;

}


// ===================================
// SPECIAL COUNTDOWN
// ===================================

function updateSpecialCountdown(date) {

    if (!date) {

        specialTime.textContent = "Not Set";

        return;

    }

    const now = new Date();

    const target = new Date(date);

    const diff = target - now;

    if (diff <= 0) {

        specialTime.textContent = "Today 🎉";

        return;

    }

    const days = Math.ceil(

        diff / (1000 * 60 * 60 * 24)

    );

    specialTime.textContent =

        `${days} Days Remaining`;

}


// ===================================
// LOAD BOTH COUNTDOWNS
// ===================================

function loadCountdowns(userData) {

    if (!userData) return;

    updateRelationshipCountdown(

        userData.relationshipDate

    );

    updateSpecialCountdown(

        userData.specialDate

    );

}


// ===================================
// AUTO REFRESH
// ===================================

setInterval(() => {

    if (currentUserData) {

        loadCountdowns(currentUserData);

    }

}, 60000);
// ===================================
// THEME SYSTEM
// ===================================

const savedTheme = localStorage.getItem("theme") || "pink";

document.body.setAttribute("data-theme", savedTheme);


// ===================================
// CHANGE THEME
// ===================================

function changeTheme(theme) {

    document.body.setAttribute("data-theme", theme);

    localStorage.setItem("theme", theme);

}


// ===================================
// LOGOUT
// ===================================

logoutBtn.addEventListener("click", async () => {

    try {

        await setUserOffline();

        await signOut(auth);

        window.location.href = "login.html";

    }

    catch (error) {

        console.error(error);

    }

});


// ===================================
// NAVIGATION
// ===================================

friendsBtn.addEventListener("click", () => {

    window.location.href = "friends.html";

});

profileBtn.addEventListener("click", () => {

    window.location.href = "home.html";

});

taskTrackerBtn.addEventListener("click", () => {

    window.location.href = "tasks.html";

});

settingsBtn.addEventListener("click", () => {

    window.location.href = "settings.html";

});

changePasswordBtn.addEventListener("click", () => {

    window.location.href = "change-password.html";

});

loveLettersBtn.addEventListener("click", () => {

    window.location.href = "loveletters.html";

});

diaryBtn.addEventListener("click", () => {

    window.location.href = "diary.html";

});

secretNotesBtn.addEventListener("click", () => {

    window.location.href = "secret-notes.html";

});

galleryBtn.addEventListener("click", () => {

    window.location.href = "gallery.html";

});

chatBtn.addEventListener("click", () => {

    window.location.href = "chat.html";

});

taskTrackerHomeBtn.addEventListener("click", () => {

    window.location.href = "tasks.html";

});

relationshipBtn.addEventListener("click", () => {

    window.location.href = "relationship.html";

});

gamesBtn.addEventListener("click", () => {

    window.location.href = "games.html";

});


// ===================================
// PROFILE PICTURE PLACEHOLDER
// ===================================

profilePictureInput.addEventListener("change", () => {

    const file = profilePictureInput.files[0];

    if (!file) return;

    console.log("Selected:", file.name);

    // Firebase Storage upload
    // will be added later.

});


// ===================================
// INITIALIZE APP
// ===================================

function initializeHome() {

    if (currentUserData) {

        loadCountdowns(currentUserData);

        updateLastSeen(currentUserData);

    }

}

window.addEventListener("load", initializeHome);
