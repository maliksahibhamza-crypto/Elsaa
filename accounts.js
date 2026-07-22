// ===============================
// Firebase Imports
// ===============================

import { auth } from "./firebase-config.js";

import {
    signOut
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

// ===============================
// Elements
// ===============================

const sidebar = document.getElementById("sidebar");
const menuBtn = document.getElementById("menuBtn");
const searchBtn = document.querySelector(".search-btn");

const relationshipCounter =
    document.getElementById("relationshipCounter");

const specialCountdown =
    document.getElementById("specialCountdown");

const status =
    document.querySelector(".status");

// ===============================
// Sidebar
// ===============================

menuBtn.addEventListener("click", () => {

    sidebar.classList.toggle("active");

});

// Close Sidebar

document.addEventListener("click", (e) => {

    if (
        !sidebar.contains(e.target) &&
        !menuBtn.contains(e.target)
    ) {

        sidebar.classList.remove("active");

    }

});

// ===============================
// Search
// ===============================

searchBtn.addEventListener("click", () => {

    alert("Search feature coming soon...");

});

// ===============================
// Online Status
// ===============================

status.innerHTML = "🟢 Online";

// ===============================
// Relationship Counter
// ===============================

function updateRelationshipCounter() {

    const relationshipDate =
        new Date("2025-06-18");

    const today = new Date();

    const diff =
        today - relationshipDate;

    const days =
        Math.floor(diff / (1000 * 60 * 60 * 24));

    relationshipCounter.innerHTML =
        days + " Days";

}

updateRelationshipCounter();

// ===============================
// Countdown
// ===============================

function updateCountdown() {

    // Change this date anytime

    const targetDate =
        new Date("2026-11-14");

    const today =
        new Date();

    const diff =
        targetDate - today;

    const days =
        Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (days > 0) {

        specialCountdown.innerHTML =
            days + " Days Left";

    } else {

        specialCountdown.innerHTML =
            "Today 🎉";

    }

}

updateCountdown();

// ===============================
// Welcome
// ===============================

console.log("❤️ Welcome to Private Vault");
// ===============================
// Feature Cards
// ===============================

document.getElementById("loveLetters").addEventListener("click", () => {

    alert("❤️ Love Letters - Coming Soon");

});

document.getElementById("diary").addEventListener("click", () => {

    alert("📖 Diary - Coming Soon");

});

document.getElementById("secretNotes").addEventListener("click", () => {

    alert("🔒 Secret Notes - Coming Soon");

});

document.getElementById("gallery").addEventListener("click", () => {

    alert("🖼️ Gallery - Coming Soon");

});

document.getElementById("relationship").addEventListener("click", () => {

    alert("❤️ Relationship Counter - Coming Soon");

});

document.getElementById("chat").addEventListener("click", () => {

    alert("💬 Private Chat - Coming Soon");

});

// ===============================
// Games
// ===============================

const gameCards = document.querySelectorAll(".game-card");

gameCards.forEach((card, index) => {

    card.addEventListener("click", () => {

        if (index === 0) {

            alert("🧩 Game 1 - Coming Soon");

        } else {

            alert("🎲 Game 2 - Coming Soon");

        }

    });

});

// ===============================
// Logout
// ===============================

const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {

    logoutBtn.addEventListener("click", async () => {

        const confirmLogout = confirm("Are you sure you want to logout?");

        if (!confirmLogout) return;

        try {

            await signOut(auth);

            alert("Logged Out Successfully!");

            window.location.href = "login.html";

        } catch (error) {

            alert(error.message);

        }

    });

}

// ===============================
// Future Functions
// ===============================

// TODO:
// Load Profile Picture
// Load Username
// Load Bio
// Load Last Seen
// Load Friends
// Load Chat
// Load Notifications

console.log("✅ Accounts Dashboard Loaded Successfully");
