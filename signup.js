// ===============================
// Firebase Imports
// ===============================

import { auth, db } from "./firebase-config.js";

import {
    createUserWithEmailAndPassword,
    updateProfile,
    deleteUser
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

import {
    collection,
    query,
    where,
    getDocs,
    doc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";


// ===============================
// Theme
// ===============================

const savedTheme = localStorage.getItem("hazelTheme") || "black-gold";

document.body.setAttribute("data-theme", savedTheme);


// ===============================
// Elements
// ===============================

const form = document.getElementById("signupForm");

const nameInput = document.getElementById("name");
const usernameInput = document.getElementById("username");
const emailInput = document.getElementById("email");

const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirmPassword");

const togglePassword = document.getElementById("togglePassword");
const toggleConfirmPassword = document.getElementById("toggleConfirmPassword");

const signupBtn = document.getElementById("signupBtn");

const messageBox = document.getElementById("message");


// ===============================
// Message Function
// ===============================

function showMessage(message, type = "error") {

    messageBox.textContent = message;

    messageBox.className = `message show ${type}`;
}


// ===============================
// Clear Message
// ===============================

function clearMessage() {

    messageBox.textContent = "";

    messageBox.className = "message";
}


// ===============================
// Password Toggle
// ===============================

togglePassword.addEventListener("click", () => {

    if (passwordInput.type === "password") {

        passwordInput.type = "text";

        togglePassword.innerHTML =
            '<i class="fa-solid fa-eye-slash"></i>';

    } else {

        passwordInput.type = "password";

        togglePassword.innerHTML =
            '<i class="fa-solid fa-eye"></i>';
    }
});


// ===============================
// Confirm Password Toggle
// ===============================

toggleConfirmPassword.addEventListener("click", () => {

    if (confirmPasswordInput.type === "password") {

        confirmPasswordInput.type = "text";

        toggleConfirmPassword.innerHTML =
            '<i class="fa-solid fa-eye-slash"></i>';

    } else {

        confirmPasswordInput.type = "password";

        toggleConfirmPassword.innerHTML =
            '<i class="fa-solid fa-eye"></i>';
    }
});


// ===============================
// Generate HAZEL ID
// ===============================

async function generateUniqueHazelId() {

    for (let attempt = 0; attempt < 10; attempt++) {

        let randomPart;

        if (window.crypto && crypto.randomUUID) {

            randomPart = crypto
                .randomUUID()
                .replace(/-/g, "")
                .substring(0, 6)
                .toUpperCase();

        } else {

            randomPart = Math.random()
                .toString(36)
                .substring(2, 8)
                .toUpperCase();
        }

        const hazelId = `HZL-${randomPart}`;


        // Check whether this ID already exists

        const usersRef = collection(db, "users");

        const idQuery = query(
            usersRef,
            where("hazelId", "==", hazelId)
        );

        const snapshot = await getDocs(idQuery);


        // ID available

        if (snapshot.empty) {

            return hazelId;
        }
    }

    throw new Error(
        "Could not generate a unique HAZEL ID. Please try again."
    );
}


// ===============================
// Signup
// ===============================

form.addEventListener("submit", async (event) => {

    event.preventDefault();

    clearMessage();


    // Get values

    const name = nameInput.value.trim();

    const username = usernameInput.value.trim();

    const email = emailInput.value.trim();

    const password = passwordInput.value;

    const confirmPassword = confirmPasswordInput.value;


    // ===============================
    // Basic Validation
    // ===============================

    if (!name || !username || !email || !password || !confirmPassword) {

        showMessage("Please fill all fields.");

        return;
    }


    // Name validation

    if (name.length < 2) {

        showMessage("Please enter a valid name.");

        return;
    }


    // Username validation

    const usernamePattern = /^[A-Za-z0-9_]{3,20}$/;

    if (!usernamePattern.test(username)) {

        showMessage(
            "Username must be 3–20 characters and can only contain letters, numbers and _."
        );

        return;
    }


    // Password validation

    if (password.length < 6) {

        showMessage(
            "Password must be at least 6 characters long."
        );

        return;
    }


    // Confirm password

    if (password !== confirmPassword) {

        showMessage("Passwords do not match.");

        return;
    }


    // ===============================
    // Disable Button
    // ===============================

    signupBtn.disabled = true;

    signupBtn.innerHTML =
        '<i class="fa-solid fa-spinner fa-spin"></i> Creating Account...';


    let createdUser = null;


    try {

        // ===============================
        // Create Firebase Auth Account
        // ===============================

        const userCredential =
            await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );

        createdUser = userCredential.user;


        // ===============================
        // Generate HAZEL ID
        // ===============================

        const hazelId =
            await generateUniqueHazelId();


        // ===============================
        // Save Name in Firebase Auth
        // ===============================

        await updateProfile(createdUser, {

            displayName: name

        });


        // ===============================
        // Create Firestore User Profile
        // ===============================

        await setDoc(
            doc(db, "users", createdUser.uid),
            {

                uid: createdUser.uid,

                name: name,

                username: username,

                usernameLower: username.toLowerCase(),

                hazelId: hazelId,

                createdAt: serverTimestamp()

            }
        );


        // ===============================
        // Success
        // ===============================

        showMessage(
            `Account created successfully! Your HAZEL ID is ${hazelId}`,
            "success"
        );


        signupBtn.innerHTML =
            '<i class="fa-solid fa-check"></i> Account Created';


        // ===============================
        // Go to Accounts
        // ===============================

        setTimeout(() => {

            window.location.href = "accounts.html";

        }, 1800);


    } catch (error) {

        console.error(error);


        // ===============================
        // If Firestore fails after Auth
        // ===============================

        if (createdUser) {

            try {

                await deleteUser(createdUser);

            } catch (deleteError) {

                console.error(
                    "Could not rollback account:",
                    deleteError
                );
            }
        }


        // ===============================
        // Firebase Errors
        // ===============================

        switch (error.code) {

            case "auth/email-already-in-use":

                showMessage(
                    "This email is already registered."
                );

                break;


            case "auth/invalid-email":

                showMessage(
                    "Please enter a valid email address."
                );

                break;


            case "auth/weak-password":

                showMessage(
                    "Password is too weak. Use at least 6 characters."
                );

                break;


            case "auth/password-does-not-meet-requirements":

                showMessage(
                    "Password does not meet Firebase requirements."
                );

                break;


            case "auth/operation-not-allowed":

                showMessage(
                    "Email/password signup is not enabled in Firebase."
                );

                break;


            case "auth/network-request-failed":

                showMessage(
                    "Network error. Please check your internet connection."
                );

                break;


            default:

                showMessage(
                    error.message || "Something went wrong."
                );
        }


        // Reset button

        signupBtn.disabled = false;

        signupBtn.innerHTML =
            '<i class="fa-solid fa-user-plus"></i> Create Account';
    }

});
