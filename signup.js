// ===============================
// Firebase Imports
// ===============================

import { auth } from "./firebase-config.js";

import {
    createUserWithEmailAndPassword
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
// Password Toggle
// ===============================

const password = document.getElementById("password");
const confirmPassword = document.getElementById("confirmPassword");

const togglePassword = document.getElementById("togglePassword");
const toggleConfirmPassword = document.getElementById("toggleConfirmPassword");

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

toggleConfirmPassword.addEventListener("click", () => {

    if (confirmPassword.type === "password") {

        confirmPassword.type = "text";

        toggleConfirmPassword.innerHTML =
            '<i class="fa-solid fa-eye-slash"></i>';

    } else {

        confirmPassword.type = "password";

        toggleConfirmPassword.innerHTML =
            '<i class="fa-solid fa-eye"></i>';

    }

});

// ===============================
// Form
// ===============================

const form = document.getElementById("signupForm");
const button = document.getElementById("signupBtn");
// ===============================
// Signup
// ===============================

form.addEventListener("submit", async (e) => {

    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const pass = password.value.trim();
    const confirm = confirmPassword.value.trim();

    if (username === "" || email === "" || pass === "" || confirm === "") {

        alert("Please fill all fields.");
        return;

    }

    if (pass !== confirm) {

        alert("Passwords do not match.");
        return;

    }

    if (pass.length < 8) {

        alert("Password must contain at least 8 characters.");
        return;

    }

    button.disabled = true;
    button.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Creating Account...';

    try {

        await createUserWithEmailAndPassword(auth, email, pass);

        alert("Account created successfully!");

        window.location.href = "account.html";

    } catch (error) {

        switch (error.code) {

            case "auth/email-already-in-use":
                alert("This email is already registered.");
                break;

            case "auth/invalid-email":
                alert("Please enter a valid email.");
                break;

            case "auth/weak-password":
                alert("Password should be at least 6 characters.");
                break;

            default:
                alert(error.message);

        }

        button.disabled = false;
        button.innerHTML = "CREATE ACCOUNT";

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
