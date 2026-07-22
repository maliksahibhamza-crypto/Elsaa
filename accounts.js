// ==========================================
// Firebase Imports
// ==========================================

import { auth } from "./firebase-config.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

// ==========================================
// Check Login
// ==========================================

onAuthStateChanged(auth, (user) => {

    if (!user) {

        window.location.href = "login.html";
        return;

    }

    console.log("Logged In:", user.email);

});

// ==========================================
// Elements
// ==========================================

const sidebar =
    document.getElementById("sidebar");

const overlay =
    document.getElementById("overlay");

const menuBtn =
    document.getElementById("menuBtn");

const searchBtn =
    document.getElementById("searchBtn");

const searchPopup =
    document.getElementById("searchPopup");

const closeSearch =
    document.getElementById("closeSearch");

const searchInput =
    document.getElementById("searchInput");

// ==========================================
// Sidebar
// ==========================================

menuBtn.addEventListener("click", () => {

    sidebar.classList.add("active");

    overlay.classList.add("active");

});

overlay.addEventListener("click", () => {

    sidebar.classList.remove("active");

    overlay.classList.remove("active");

});

// ==========================================
// Search Popup
// ==========================================

searchBtn.addEventListener("click", () => {

    searchPopup.classList.add("active");

    searchInput.focus();

});

closeSearch.addEventListener("click", () => {

    searchPopup.classList.remove("active");

    searchInput.value = "";

});

// ==========================================
// Search (Placeholder)
// ==========================================

searchInput.addEventListener("keyup", (e) => {

    if (e.key === "Enter") {

        const username =
            searchInput.value.trim();

        if (username === "") {

            alert("Enter a username.");

            return;

        }

        alert(
            "Searching for @" + username
        );

    }

});

// ==========================================
// ESC Key Support
// ==========================================

document.addEventListener("keydown", (e) => {

    if (e.key === "Escape") {

        sidebar.classList.remove("active");

        overlay.classList.remove("active");

        searchPopup.classList.remove("active");

    }

});
// ==========================================
// Profile Elements
// ==========================================

const profilePic =
    document.getElementById("profilePic");

const profileName =
    document.getElementById("profileName");

const profileUsername =
    document.getElementById("profileUsername");

const profileBio =
    document.getElementById("profileBio");

const onlineStatus =
    document.getElementById("onlineStatus");

const lastSeen =
    document.getElementById("lastSeen");

const editProfileBtn =
    document.getElementById("editProfileBtn");

const profileUpload =
    document.getElementById("profileUpload");

// ==========================================
// Default Profile
// ==========================================

function loadProfile(user) {

    profileName.textContent =
        user.displayName || "No Name";

    profileUsername.textContent =
        "@" +
        (user.email ?
        user.email.split("@")[0] :
        "username");

    profileBio.textContent =
        "No bio added yet.";

    onlineStatus.textContent =
        "🟢 Online";

    lastSeen.textContent =
        "Last Seen : Online";

}

onAuthStateChanged(auth, (user) => {

    if (user) {

        loadProfile(user);

    }

});

// ==========================================
// Edit Profile
// ==========================================

editProfileBtn.addEventListener("click", () => {

    const newName =
        prompt(
            "Enter your name:",
            profileName.textContent
        );

    if (newName &&
        newName.trim() !== "") {

        profileName.textContent =
            newName.trim();

    }

    const newBio =
        prompt(
            "Enter your bio:",
            profileBio.textContent
        );

    if (newBio &&
        newBio.trim() !== "") {

        profileBio.textContent =
            newBio.trim();

    }

});

// ==========================================
// Profile Picture Preview
// ==========================================

profileUpload.addEventListener("change", (e) => {

    const file =
        e.target.files[0];

    if (!file) return;

    const reader =
        new FileReader();

    reader.onload = function(event) {

        profilePic.src =
            event.target.result;

    };

    reader.readAsDataURL(file);

});
// ==========================================
// Countdown Elements
// ==========================================

const relationshipDays =
    document.getElementById("relationshipDays");

const relationshipDate =
    document.getElementById("relationshipDate");

const specialDays =
    document.getElementById("specialDays");

const specialDate =
    document.getElementById("specialDate");

const editRelationshipCountdown =
    document.getElementById("editRelationshipCountdown");

const editSpecialCountdown =
    document.getElementById("editSpecialCountdown");

// ==========================================
// Countdown Function
// ==========================================

function updateCountdown(date, dayElement, dateElement) {

    if (!date) {

        dayElement.textContent = "0 Days";

        dateElement.textContent = "No Date Selected";

        return;

    }

    const today = new Date();

    const selected = new Date(date);

    const diff =
        Math.floor(
            (today - selected) /
            (1000 * 60 * 60 * 24)
        );

    dayElement.textContent =
        diff + " Days";

    dateElement.textContent =
        selected.toDateString();

}

// ==========================================
// Load Saved Dates
// ==========================================

let relationDate =
    localStorage.getItem("relationshipDate");

let specialEventDate =
    localStorage.getItem("specialDate");

updateCountdown(
    relationDate,
    relationshipDays,
    relationshipDate
);

updateCountdown(
    specialEventDate,
    specialDays,
    specialDate
);

// ==========================================
// Edit Relationship Countdown
// ==========================================

editRelationshipCountdown.addEventListener("click", () => {

    const newDate =
        prompt(
            "Enter Relationship Date\n(YYYY-MM-DD)"
        );

    if (!newDate) return;

    localStorage.setItem(
        "relationshipDate",
        newDate
    );

    updateCountdown(
        newDate,
        relationshipDays,
        relationshipDate
    );

});

// ==========================================
// Edit Special Countdown
// ==========================================

editSpecialCountdown.addEventListener("click", () => {

    const newDate =
        prompt(
            "Enter Special Date\n(YYYY-MM-DD)"
        );

    if (!newDate) return;

    localStorage.setItem(
        "specialDate",
        newDate
    );

    updateCountdown(
        newDate,
        specialDays,
        specialDate
    );

});
// ==========================================
// Online / Last Seen
// ==========================================

const statusElement =
    document.getElementById("onlineStatus");

const lastSeenElement =
    document.getElementById("lastSeen");

// ==========================================
// Set Online
// ==========================================

function setOnline() {

    statusElement.textContent =
        "🟢 Online";

    statusElement.style.color =
        "#28a745";

}

// ==========================================
// Save Last Seen
// ==========================================

function saveLastSeen() {

    const now =
        new Date();

    localStorage.setItem(
        "lastSeen",
        now.toISOString()
    );

}

// ==========================================
// Show Last Seen
// ==========================================

function showLastSeen() {

    const last =
        localStorage.getItem("lastSeen");

    if (!last) {

        lastSeenElement.textContent =
            "Last Seen : Never";

        return;

    }

    const date =
        new Date(last);

    lastSeenElement.textContent =
        "Last Seen : " +
        date.toLocaleString();

}

// ==========================================
// Page Loaded
// ==========================================

window.addEventListener("load", () => {

    setOnline();

    showLastSeen();

});

// ==========================================
// Before Leaving Website
// ==========================================

window.addEventListener("beforeunload", () => {

    saveLastSeen();

});

// ==========================================
// Logout Status
// ==========================================

const logoutBtn =
    document.getElementById("logoutBtn");

logoutBtn.addEventListener("click", () => {

    saveLastSeen();

});
// ==========================================
// Navigation
// ==========================================

const friendsBtn =
    document.getElementById("friendsBtn");

const profileBtn =
    document.getElementById("profileBtn");

const settingsBtn =
    document.getElementById("settingsBtn");

const changePasswordBtn =
    document.getElementById("changePasswordBtn");

// ==========================================
// Friends
// ==========================================

friendsBtn.addEventListener("click", () => {

    alert("Friends Page - Coming Soon");

});

// ==========================================
// My Profile
// ==========================================

profileBtn.addEventListener("click", () => {

    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

});

// ==========================================
// Settings
// ==========================================

settingsBtn.addEventListener("click", () => {

    alert("Settings - Coming Soon");

});

// ==========================================
// Change Password
// ==========================================

changePasswordBtn.addEventListener("click", () => {

    alert("Change Password - Coming Soon");

});

// ==========================================
// Logout
// ==========================================

logoutBtn.addEventListener("click", async () => {

    const confirmLogout = confirm(
        "Are you sure you want to logout?"
    );

    if (!confirmLogout) return;

    try {

        await signOut(auth);

        alert("Logged Out Successfully!");

        window.location.href = "login.html";

    }

    catch (error) {

        alert(error.message);

    }

});

// ==========================================
// Feature Cards
// ==========================================

document.getElementById("loveLetters")
.addEventListener("click", () => {

    alert("Love Letters - Coming Soon ❤️");

});

document.getElementById("diary")
.addEventListener("click", () => {

    alert("Diary - Coming Soon 📖");

});

document.getElementById("secretNotes")
.addEventListener("click", () => {

    alert("Secret Notes - Coming Soon 🔒");

});

document.getElementById("gallery")
.addEventListener("click", () => {

    alert("Gallery - Coming Soon 🖼️");

});

document.getElementById("relationshipCounter")
.addEventListener("click", () => {

    alert("Relationship Counter - Coming Soon ❤️");

});

document.getElementById("chat")
.addEventListener("click", () => {

    alert("Private Chat - Coming Soon 💬");

});

document.getElementById("game1")
.addEventListener("click", () => {

    alert("Game 1 - Coming Soon 🎮");

});

document.getElementById("game2")
.addEventListener("click", () => {

    alert("Game 2 - Coming Soon 🎲");

});

// ==========================================
// Dashboard Loaded
// ==========================================

console.log("✅ Private Vault Loaded Successfully");
