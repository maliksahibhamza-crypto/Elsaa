// ===============================
// Firebase Imports
// ===============================

import { auth } from "./firebase-config.js";

import {
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

// ===============================
// Loading Screen
// ===============================

window.addEventListener("load", () => {

    setTimeout(() => {

        document.getElementById("loading-screen").style.opacity = "0";

        setTimeout(() => {

            document.getElementById("loading-screen").style.display = "none";

        }, 800);

    }, 1500);

});

// ===============================
// Auto Login Check
// ===============================


onAuthStateChanged(auth, (user) => {

    console.log(user);

    if (user) {
        window.location.href = "accounts.html";
    }

});
// ===============================
// Password Toggle
// ===============================

const password = document.getElementById("password");

const togglePassword = document.getElementById("togglePassword");

togglePassword.addEventListener("click", () => {

    if (password.type === "password") {

        password.type = "text";

        togglePassword.innerHTML =
            '<i class="fa-solid fa-eye-slash"></i>';

    } else {

        password.type = "password";

        togglePassword.innerHTML =
            '<i class="fa-solid fa-eye"></i>';

    }

});

// ===============================
// Form
// ===============================

const form = document.getElementById("loginForm");
const button = document.getElementById("loginBtn");
// ===============================
// Login
// ===============================

form.addEventListener("submit", async (e) => {

    e.preventDefault();

    const username = document.getElementById("username").value.trim();
const email = document.getElementById("email").value.trim();
const pass = password.value.trim();
    if (username === "" || email === "" || pass === "") {

        alert("Please fill all fields.");
        return;

    }

    button.disabled = true;
    button.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Logging in...';

    try {

        await signInWithEmailAndPassword(auth, email, pass);

        alert("Login Successful!");

        window.location.href = "accounts.html";

    } catch (error) {

        switch (error.code) {

            case "auth/user-not-found":
                alert("Account not found.");
                break;

            case "auth/invalid-credential":
                alert("Incorrect email or password.");
                break;

            case "auth/wrong-password":
                alert("Incorrect password.");
                break;

            case "auth/invalid-email":
                alert("Invalid email address.");
                break;

            default:
                alert(error.message);

        }

        button.disabled = false;
        button.innerHTML = "Login";

    }

});

// ===============================
// Forgot Password
// ===============================

document.getElementById("forgotPassword").addEventListener("click", async (e) => {

    e.preventDefault();

    const email = document.getElementById("username").value.trim();

    if (email === "") {

        alert("Please enter your email first.");
        return;

    }

    try {

        await sendPasswordResetEmail(auth, email);

        alert("Password reset email has been sent.");

    } catch (error) {

        alert(error.message);

    }

});

// ===============================
// Enter Key Support
// ===============================

document.addEventListener("keydown", (e) => {

    if (e.key === "Enter") {

        form.requestSubmit();

    }

});

// ===============================
// Background Particles
// ===============================

particlesJS("particles-js", {

    particles: {

        number: {
            value: 45
        },

        color: {
            value: "#d4af37"
        },

        shape: {
            type: "circle"
        },

        opacity: {
            value: 0.35
        },

        size: {
            value: 4
        },

        move: {
            enable: true,
            speed: 1
        }

    }

});
