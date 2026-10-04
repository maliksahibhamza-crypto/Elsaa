"use strict";


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
    setDoc,
    updateDoc,
    collection,
    query,
    where,
    getDocs,
    onSnapshot,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";



/* =========================
   DOM
========================= */

const $ = (id) =>
    document.getElementById(id);


const backButton =
    $("backButton");

const playerName =
    $("playerName");

const hazelId =
    $("hazelId");



/* =========================
   MODE
========================= */

const soloModeButton =
    $("soloModeButton");

const multiModeButton =
    $("multiModeButton");

const soloPanel =
    $("soloPanel");

const multiPanel =
    $("multiPanel");



/* =========================
   SOLO
========================= */

const statusCard =
    $("statusCard");

const statusIcon =
    $("statusIcon");

const statusTitle =
    $("statusTitle");

const statusMessage =
    $("statusMessage");

const guessInput =
    $("guessInput");

const guessButton =
    $("guessButton");

const inputError =
    $("inputError");

const attemptCount =
    $("attemptCount");

const bestScore =
    $("bestScore");

const historyList =
    $("historyList");

const clearHistoryButton =
    $("clearHistoryButton");

const newGameButton =
    $("newGameButton");



/* =========================
   MULTIPLAYER
========================= */

const multiLobby =
    $("multiLobby");

const waitingPanel =
    $("waitingPanel");

const activeGamePanel =
    $("activeGamePanel");

const opponentIdInput =
    $("opponentIdInput");

const findOpponentButton =
    $("findOpponentButton");

const opponentResult =
    $("opponentResult");

const opponentName =
    $("opponentName");

const opponentHazelId =
    $("opponentHazelId");

const joinMatchButton =
    $("joinMatchButton");

const multiError =
    $("multiError");

const createMatchButton =
    $("createMatchButton");

const matchIdDisplay =
    $("matchIdDisplay");

const copyMatchButton =
    $("copyMatchButton");

const cancelMatchButton =
    $("cancelMatchButton");

const activeMatchId =
    $("activeMatchId");

const connectionStatus =
    $("connectionStatus");

const hostPlayerName =
    $("hostPlayerName");

const guestPlayerName =
    $("guestPlayerName");

const multiStatusCard =
    $("multiStatusCard");

const multiStatusIcon =
    $("multiStatusIcon");

const multiStatusTitle =
    $("multiStatusTitle");

const multiStatusMessage =
    $("multiStatusMessage");

const multiGuessInput =
    $("multiGuessInput");

const multiGuessButton =
    $("multiGuessButton");

const multiInputError =
    $("multiInputError");

const myAttempts =
    $("myAttempts");

const opponentAttempts =
    $("opponentAttempts");

const multiHistoryList =
    $("multiHistoryList");

const leaveMatchButton =
    $("leaveMatchButton");



/* =========================
   USER
========================= */

let currentUser = null;

let currentUserData = null;



/* =========================
   SOLO STATE
========================= */

let secretNumber = 0;

let soloAttempts = 0;

let soloHistory = [];

let bestAttempts = null;

let soloActive = true;



/* =========================
   MULTIPLAYER STATE
========================= */

let currentMatchId = null;

let currentMatch = null;

let opponentData = null;

let unsubscribeMatch = null;

let selectedOpponent = null;



/* =========================
   SETTINGS
========================= */

const MIN_NUMBER = 1;

const MAX_NUMBER = 100;



/* =========================
   THEME
========================= */

function applySavedTheme() {

    const savedTheme =
        localStorage.getItem("hazelTheme");


    const allowedThemes = [
        "black-gold",
        "pink",
        "white-grey"
    ];


    const theme =
        allowedThemes.includes(savedTheme)
            ? savedTheme
            : "black-gold";


    document.documentElement.setAttribute(
        "data-theme",
        theme
    );

}



/* =========================
   LOAD USER
========================= */

async function loadUser(user) {

    const userRef =
        doc(db, "users", user.uid);


    const snap =
        await getDoc(userRef);


    if (!snap.exists()) {

        playerName.textContent =
            user.displayName ||
            "HAZEL Player";

        hazelId.textContent =
            "HAZEL ID: Not Available";

        return;

    }


    currentUserData =
        snap.data();


    playerName.textContent =
        currentUserData.name ||
        currentUserData.username ||
        "HAZEL Player";


    hazelId.textContent =
        `HAZEL ID: ${
            currentUserData.hazelId ||
            "Not Available"
        }`;

}



/* =========================
   RANDOM NUMBER
========================= */

function generateNumber() {

    return Math.floor(
        Math.random() *
        (MAX_NUMBER - MIN_NUMBER + 1)
    ) + MIN_NUMBER;

}



/* =========================
   SOLO STATUS
========================= */

function updateSoloStatus(
    title,
    message,
    icon = "fa-bullseye"
) {

    statusTitle.textContent =
        title;

    statusMessage.textContent =
        message;

    statusIcon.className =
        `fa-solid ${icon}`;

}



/* =========================
   SOLO HISTORY
========================= */

function renderSoloHistory() {

    if (!soloHistory.length) {

        historyList.innerHTML = `

            <div class="empty-history">

                <i class="fa-solid fa-list"></i>

                <span>
                    Your guesses will appear here.
                </span>

            </div>

        `;

        return;

    }


    historyList.innerHTML = "";


    soloHistory.forEach(
        (item, index) => {

            const row =
                document.createElement("div");


            row.className =
                "history-item";


            row.innerHTML = `

                <div class="history-number">

                    <span class="history-index">
                        ${index + 1}
                    </span>

                    <strong>
                        ${item.number}
                    </strong>

                </div>

                <span
                    class="history-result ${item.type}"
                >
                    ${item.result}
                </span>

            `;


            historyList.appendChild(row);

        }
    );

}



/* =========================
   SOLO NEW GAME
========================= */

function startSoloGame() {

    secretNumber =
        generateNumber();


    soloAttempts =
        0;


    soloHistory =
        [];


    soloActive =
        true;


    guessInput.disabled =
        false;


    guessButton.disabled =
        false;


    guessInput.value =
        "";


    inputError.textContent =
        "";


    attemptCount.textContent =
        "0";


    updateSoloStatus(
        "Ready to Play",
        "Enter a number between 1 and 100."
    );


    renderSoloHistory();

}



/* =========================
   SOLO GUESS
========================= */

function handleSoloGuess() {

    if (!soloActive) {
        return;
    }


    inputError.textContent = "";


    const number =
        Number(guessInput.value);


    if (
        !Number.isInteger(number) ||
        number < MIN_NUMBER ||
        number > MAX_NUMBER
    ) {

        inputError.textContent =
            "Enter a whole number between 1 and 100.";

        return;

    }


    soloAttempts++;


    attemptCount.textContent =
        soloAttempts;


    if (number === secretNumber) {

        soloActive =
            false;


        guessInput.disabled =
            true;


        guessButton.disabled =
            true;


        soloHistory.push({
            number,
            result: "Correct ✓",
            type: "correct"
        });


        if (
            bestAttempts === null ||
            soloAttempts < bestAttempts
        ) {

            bestAttempts =
                soloAttempts;


            bestScore.textContent =
                bestAttempts;

        }


        updateSoloStatus(
            "You Found It!",
            `The hidden number was ${secretNumber}.`,
            "fa-trophy"
        );


        renderSoloHistory();

        return;

    }


    if (number < secretNumber) {

        soloHistory.push({
            number,
            result: "Higher ↑",
            type: "higher"
        });


        updateSoloStatus(
            "Go Higher",
            "The hidden number is higher.",
            "fa-arrow-up"
        );

    } else {

        soloHistory.push({
            number,
            result: "Lower ↓",
            type: "lower"
        });


        updateSoloStatus(
            "Go Lower",
            "The hidden number is lower.",
            "fa-arrow-down"
        );

    }


    guessInput.value =
        "";


    renderSoloHistory();


    guessInput.focus();

}



/* =========================
   MODE SWITCH
========================= */

function showSolo() {

    soloModeButton.classList.add("active");

    multiModeButton.classList.remove("active");

    soloPanel.classList.remove("hidden");

    multiPanel.classList.add("hidden");

}


function showMultiplayer() {

    multiModeButton.classList.add("active");

    soloModeButton.classList.remove("active");

    multiPanel.classList.remove("hidden");

    soloPanel.classList.add("hidden");

}



/* =========================
   FIND OPPONENT
========================= */

async function findOpponent() {

    multiError.textContent =
        "";


    opponentResult.classList.add(
        "hidden"
    );


    const id =
        opponentIdInput.value
            .trim()
            .toUpperCase();


    if (!id) {

        multiError.textContent =
            "Enter a HAZEL ID.";

        return;

    }


    if (
        currentUserData &&
        id ===
        String(currentUserData.hazelId)
            .toUpperCase()
    ) {

        multiError.textContent =
            "You cannot challenge yourself.";

        return;

    }


    findOpponentButton.disabled =
        true;


    try {

        const usersRef =
            collection(db, "users");


        const q =
            query(
                usersRef,
                where(
                    "hazelId",
                    "==",
                    id
                )
            );


        const snapshot =
            await getDocs(q);


        if (snapshot.empty) {

            multiError.textContent =
                "No player found with this HAZEL ID.";

            return;

        }


        const playerDoc =
            snapshot.docs[0];


        selectedOpponent = {

            uid:
                playerDoc.id,

            ...playerDoc.data()

        };


        opponentName.textContent =
            selectedOpponent.name ||
            selectedOpponent.username ||
            "HAZEL Player";


        opponentHazelId.textContent =
            selectedOpponent.hazelId ||
            id;


        opponentResult.classList.remove(
            "hidden"
        );

    } catch (error) {

        console.error(error);


        multiError.textContent =
            "Unable to find player right now.";

    } finally {

        findOpponentButton.disabled =
            false;

    }

}



/* =========================
   MATCH ID
========================= */

function generateMatchId() {

    return (
        "HZG-" +
        Math.random()
            .toString(36)
            .substring(2, 8)
            .toUpperCase()
    );

}



/* =========================
   CREATE MATCH
========================= */

async function createMatch() {

    multiError.textContent =
        "";


    if (!currentUserData) {

        multiError.textContent =
            "Your HAZEL profile could not be loaded.";

        return;

    }


    createMatchButton.disabled =
        true;


    try {

        const matchId =
            generateMatchId();


        const matchRef =
            doc(
                db,
                "guessNumberMatches",
                matchId
            );


        const secret =
            generateNumber();


        await setDoc(
            matchRef,
            {

                matchId,

                status: "waiting",

                hostUid:
                    currentUser.uid,

                hostName:
                    currentUserData.name ||
                    currentUserData.username ||
                    "Player X",

                hostHazelId:
                    currentUserData.hazelId ||
                    "",

                guestUid: "",

                guestName: "",

                guestHazelId: "",

                secretNumber:
                    secret,

                turn: "both",

                hostAttempts: 0,

                guestAttempts: 0,

                history: [],

                winnerUid: "",

                createdAt:
                    serverTimestamp(),

                updatedAt:
                    serverTimestamp()

            }
        );


        currentMatchId =
            matchId;


        showWaitingPanel();


        listenToMatch(matchId);

    } catch (error) {

        console.error(error);


        multiError.textContent =
            "Unable to create match.";

    } finally {

        createMatchButton.disabled =
            false;

    }

}



/* =========================
   JOIN MATCH
========================= */

async function joinMatch() {

    if (!selectedOpponent) {
        return;
    }


    multiError.textContent =
        "";


    const matchId =
        prompt(
            "Enter the Match ID shared by the host:"
        );


    if (!matchId) {
        return;
    }


    const cleanId =
        matchId
            .trim()
            .toUpperCase();


    try {

        const matchRef =
            doc(
                db,
                "guessNumberMatches",
                cleanId
            );


        const snap =
            await getDoc(matchRef);


        if (!snap.exists()) {

            multiError.textContent =
                "Match not found.";

            return;

        }


        const match =
            snap.data();


        if (
            match.status !== "waiting"
        ) {

            multiError.textContent =
                "This match is no longer available.";

            return;

        }


        if (
            match.hostUid ===
            currentUser.uid
        ) {

            multiError.textContent =
                "You cannot join your own match.";

            return;

        }


        if (
            match.guestUid
        ) {

            multiError.textContent =
                "This match already has an opponent.";

            return;

        }


        await updateDoc(
            matchRef,
            {

                guestUid:
                    currentUser.uid,

                guestName:
                    currentUserData.name ||
                    currentUserData.username ||
                    "Player O",

                guestHazelId:
                    currentUserData.hazelId ||
                    "",

                status: "active",

                updatedAt:
                    serverTimestamp()

            }
        );


        currentMatchId =
            cleanId;


        listenToMatch(cleanId);


        multiLobby.classList.add(
            "hidden"
        );


        activeGamePanel.classList.remove(
            "hidden"
        );

    } catch (error) {

        console.error(error);


        multiError.textContent =
            "Unable to join this match.";

    }

}



/* =========================
   WAITING UI
========================= */

function showWaitingPanel() {

    multiLobby.classList.add(
        "hidden"
    );


    waitingPanel.classList.remove(
        "hidden"
    );


    activeGamePanel.classList.add(
        "hidden"
    );


    matchIdDisplay.textContent =
        currentMatchId;

}



/* =========================
   LISTEN MATCH
========================= */

function listenToMatch(matchId) {

    if (unsubscribeMatch) {

        unsubscribeMatch();

    }


    const matchRef =
        doc(
            db,
            "guessNumberMatches",
            matchId
        );


    unsubscribeMatch =
        onSnapshot(
            matchRef,
            (snapshot) => {

                if (!snapshot.exists()) {

                    resetMultiplayerUI();

                    return;

                }


                currentMatch =
                    snapshot.data();


                renderMatch();

            },
            (error) => {

                console.error(
                    "Match listener:",
                    error
                );

            }
        );

}



/* =========================
   RENDER MATCH
========================= */

function renderMatch() {

    if (!currentMatch) {
        return;
    }


    const isHost =
        currentMatch.hostUid ===
        currentUser.uid;


    const isGuest =
        currentMatch.guestUid ===
        currentUser.uid;


    if (
        currentMatch.status ===
        "waiting"
    ) {

        showWaitingPanel();

        return;

    }


    if (
        currentMatch.status ===
        "active" ||
        currentMatch.status ===
        "finished"
    ) {

        waitingPanel.classList.add(
            "hidden"
        );

        multiLobby.classList.add(
            "hidden"
        );

        activeGamePanel.classList.remove(
            "hidden"
        );

    }


    activeMatchId.textContent =
        currentMatch.matchId;


    hostPlayerName.textContent =
        currentMatch.hostName ||
        "Player X";


    guestPlayerName.textContent =
        currentMatch.guestName ||
        "Waiting...";


    myAttempts.textContent =
        isHost
            ? currentMatch.hostAttempts || 0
            : currentMatch.guestAttempts || 0;


    opponentAttempts.textContent =
        isHost
            ? currentMatch.guestAttempts || 0
            : currentMatch.hostAttempts || 0;


    renderMultiHistory(
        currentMatch.history || []
    );


    if (
        currentMatch.status ===
        "finished"
    ) {

        multiGuessButton.disabled =
            true;

        multiGuessInput.disabled =
            true;


        if (
            currentMatch.winnerUid ===
            currentUser.uid
        ) {

            updateMultiStatus(
                "You Win!",
                "You found the hidden number first.",
                "fa-trophy"
            );

        } else if (
            currentMatch.winnerUid
        ) {

            updateMultiStatus(
                "You Lost",
                "Your opponent found the number first.",
                "fa-circle-xmark"
            );

        } else {

            updateMultiStatus(
                "Match Finished",
                "The match has ended.",
                "fa-flag-checkered"
            );

        }


        return;

    }


    multiGuessButton.disabled =
        false;

    multiGuessInput.disabled =
        false;


    updateMultiStatus(
        "Match Live",
        "Both players can submit guesses.",
        "fa-circle-play"
    );

}



/* =========================
   MULTI STATUS
========================= */

function updateMultiStatus(
    title,
    message,
    icon
) {

    multiStatusTitle.textContent =
        title;

    multiStatusMessage.textContent =
        message;

    multiStatusIcon.className =
        `fa-solid ${icon}`;

  }

/* =========================
   MULTI HISTORY
========================= */

function renderMultiHistory(history) {

    if (!history.length) {

        multiHistoryList.innerHTML = `

            <div class="empty-history">

                No guesses yet.

            </div>

        `;

        return;

    }


    multiHistoryList.innerHTML =
        "";


    history.forEach(
        (item, index) => {

            const row =
                document.createElement("div");


            row.className =
                "history-item";


            row.innerHTML = `

                <div class="history-number">

                    <span class="history-index">
                        ${index + 1}
                    </span>

                    <strong>
                        ${item.number}
                    </strong>

                </div>

                <span class="history-result">
                    ${item.playerName}
                    ·
                    ${item.result}
                </span>

            `;


            multiHistoryList.appendChild(
                row
            );

        }
    );

}



/* =========================
   MULTIPLAYER GUESS
========================= */

async function submitMultiGuess() {

    if (
        !currentMatch ||
        !currentMatchId
    ) {

        return;

    }


    if (
        currentMatch.status !==
        "active"
    ) {

        return;

    }


    multiInputError.textContent =
        "";


    const number =
        Number(
            multiGuessInput.value
        );


    if (
        !Number.isInteger(number) ||
        number < MIN_NUMBER ||
        number > MAX_NUMBER
    ) {

        multiInputError.textContent =
            "Enter a whole number between 1 and 100.";

        return;

    }


    const isHost =
        currentMatch.hostUid ===
        currentUser.uid;


    const attempts =
        isHost
            ? currentMatch.hostAttempts || 0
            : currentMatch.guestAttempts || 0;


    const newAttempts =
        attempts + 1;


    const secret =
        currentMatch.secretNumber;


    let result =
        "";


    if (number === secret) {

        result =
            "Correct ✓";

    } else if (number < secret) {

        result =
            "Higher ↑";

    } else {

        result =
            "Lower ↓";

    }


    const history =
        Array.isArray(
            currentMatch.history
        )
            ? [
                ...currentMatch.history
            ]
            : [];


    history.push({

        uid:
            currentUser.uid,

        player:
            isHost
                ? "X"
                : "O",

        playerName:
            currentUserData.name ||
            currentUserData.username ||
            "Player",

        number,

        result,

        createdAt:
            Date.now()

    });


    const matchRef =
        doc(
            db,
            "guessNumberMatches",
            currentMatchId
        );


    const updateData = {

        history,

        updatedAt:
            serverTimestamp()

    };


    if (isHost) {

        updateData.hostAttempts =
            newAttempts;

    } else {

        updateData.guestAttempts =
            newAttempts;

    }


    if (number === secret) {

        updateData.status =
            "finished";

        updateData.winnerUid =
            currentUser.uid;

    }


    try {

        multiGuessButton.disabled =
            true;


        await updateDoc(
            matchRef,
            updateData
        );


        multiGuessInput.value =
            "";


        if (
            number !== secret
        ) {

            multiInputError.textContent =
                result;

        }

    } catch (error) {

        console.error(error);


        multiInputError.textContent =
            "Your guess could not be submitted.";

    } finally {

        if (
            currentMatch?.status ===
            "active"
        ) {

            multiGuessButton.disabled =
                false;

        }

    }

}



/* =========================
   COPY MATCH ID
========================= */

async function copyMatchId() {

    if (!currentMatchId) {
        return;
    }


    try {

        await navigator.clipboard.writeText(
            currentMatchId
        );


        copyMatchButton.innerHTML =
            `
                <i class="fa-solid fa-check"></i>
                Copied
            `;


        setTimeout(
            () => {

                copyMatchButton.innerHTML =
                    `
                        <i class="fa-solid fa-copy"></i>
                        Copy Match ID
                    `;

            },
            1500
        );

    } catch (error) {

        console.error(error);

    }

}



/* =========================
   CANCEL MATCH
========================= */

async function cancelMatch() {

    if (!currentMatchId) {
        return;
    }


    try {

        const matchRef =
            doc(
                db,
                "guessNumberMatches",
                currentMatchId
            );


        await updateDoc(
            matchRef,
            {

                status: "cancelled",

                updatedAt:
                    serverTimestamp()

            }
        );


        resetMultiplayerUI();

    } catch (error) {

        console.error(error);

    }

}



/* =========================
   LEAVE MATCH
========================= */

async function leaveMatch() {

    if (!currentMatchId) {
        return;
    }


    try {

        const matchRef =
            doc(
                db,
                "guessNumberMatches",
                currentMatchId
            );


        await updateDoc(
            matchRef,
            {

                status: "cancelled",

                updatedAt:
                    serverTimestamp()

            }
        );


        resetMultiplayerUI();

    } catch (error) {

        console.error(error);

    }

}



/* =========================
   RESET MULTIPLAYER
========================= */

function resetMultiplayerUI() {

    if (unsubscribeMatch) {

        unsubscribeMatch();

        unsubscribeMatch =
            null;

    }


    currentMatchId =
        null;

    currentMatch =
        null;

    selectedOpponent =
        null;


    multiLobby.classList.remove(
        "hidden"
    );


    waitingPanel.classList.add(
        "hidden"
    );


    activeGamePanel.classList.add(
        "hidden"
    );


    opponentResult.classList.add(
        "hidden"
    );


    opponentIdInput.value =
        "";


    multiError.textContent =
        "";


    multiInputError.textContent =
        "";

}



/* =========================
   NAVIGATION
========================= */

backButton.addEventListener(
    "click",
    () => {

        if (unsubscribeMatch) {

            unsubscribeMatch();

        }


        window.location.href =
            "hazelgame.html";

    }
);



/* =========================
   EVENTS
========================= */

soloModeButton.addEventListener(
    "click",
    showSolo
);


multiModeButton.addEventListener(
    "click",
    showMultiplayer
);


guessButton.addEventListener(
    "click",
    handleSoloGuess
);


newGameButton.addEventListener(
    "click",
    startSoloGame
);


clearHistoryButton.addEventListener(
    "click",
    () => {

        soloHistory = [];

        renderSoloHistory();

    }
);


guessInput.addEventListener(
    "keydown",
    (event) => {

        if (event.key === "Enter") {

            handleSoloGuess();

        }

    }
);


createMatchButton.addEventListener(
    "click",
    createMatch
);


findOpponentButton.addEventListener(
    "click",
    findOpponent
);


joinMatchButton.addEventListener(
    "click",
    joinMatch
);


copyMatchButton.addEventListener(
    "click",
    copyMatchId
);


cancelMatchButton.addEventListener(
    "click",
    cancelMatch
);


leaveMatchButton.addEventListener(
    "click",
    leaveMatch
);


multiGuessButton.addEventListener(
    "click",
    submitMultiGuess
);


multiGuessInput.addEventListener(
    "keydown",
    (event) => {

        if (event.key === "Enter") {

            submitMultiGuess();

        }

    }
);



/* =========================
   ESCAPE
========================= */

document.addEventListener(
    "keydown",
    (event) => {

        if (
            event.key === "Escape"
        ) {

            window.location.href =
                "hazelgame.html";

        }

    }
);



/* =========================
   AUTH
========================= */

onAuthStateChanged(
    auth,
    async (user) => {

        if (!user) {

            window.location.replace(
                "login.html"
            );

            return;

        }


        currentUser =
            user;


        try {

            await loadUser(user);

        } catch (error) {

            console.error(
                "User loading failed:",
                error
            );

        }


        applySavedTheme();


        startSoloGame();


        document.body.style.visibility =
            "visible";

    }
);
