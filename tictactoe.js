"use strict";


/* =========================
   HAZEL TIC-TAC-TOE
========================= */


import {
    auth,
    db
} from "./firebase-config.js";


import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";


import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";



/* =========================
   DOM
========================= */

const backButton =
    document.getElementById("backButton");


const playerName =
    document.getElementById("playerName");


const hazelId =
    document.getElementById("hazelId");


const turnSymbol =
    document.getElementById("turnSymbol");


const turnText =
    document.getElementById("turnText");


const scoreX =
    document.getElementById("scoreX");


const scoreO =
    document.getElementById("scoreO");


const resultBox =
    document.getElementById("resultBox");


const resultIcon =
    document.getElementById("resultIcon");


const resultTitle =
    document.getElementById("resultTitle");


const resultMessage =
    document.getElementById("resultMessage");


const newGameButton =
    document.getElementById("newGameButton");


const resetScoreButton =
    document.getElementById("resetScoreButton");


const cells =
    [...document.querySelectorAll(".cell")];



/* =========================
   GAME STATE
========================= */

let board = [
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    ""
];


let currentPlayer = "X";


let gameActive = true;


let scores = {
    X: 0,
    O: 0
};



/* =========================
   WINNING COMBINATIONS
========================= */

const winningCombinations = [

    [0, 1, 2],

    [3, 4, 5],

    [6, 7, 8],

    [0, 3, 6],

    [1, 4, 7],

    [2, 5, 8],

    [0, 4, 8],

    [2, 4, 6]

];



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

    try {

        const userRef =
            doc(db, "users", user.uid);


        const userSnap =
            await getDoc(userRef);


        if (userSnap.exists()) {

            const data =
                userSnap.data();


            playerName.textContent =
                data.name ||
                data.username ||
                "HAZEL Player";


            hazelId.textContent =
                `HAZEL ID: ${
                    data.hazelId ||
                    "Not Available"
                }`;

        } else {

            playerName.textContent =
                user.displayName ||
                "HAZEL Player";


            hazelId.textContent =
                "HAZEL ID: Not Available";

        }

    } catch (error) {

        console.error(
            "Failed to load player:",
            error
        );


        playerName.textContent =
            user.displayName ||
            "HAZEL Player";


        hazelId.textContent =
            "HAZEL ID: Not Available";

    }

}



/* =========================
   UPDATE TURN
========================= */

function updateTurnDisplay() {

    turnSymbol.textContent =
        currentPlayer;


    turnText.textContent =
        `Player ${currentPlayer}'s Turn`;

}



/* =========================
   UPDATE SCORE
========================= */

function updateScoreboard() {

    scoreX.textContent =
        scores.X;


    scoreO.textContent =
        scores.O;

}



/* =========================
   UPDATE RESULT
========================= */

function updateResult(
    title,
    message,
    icon = "fa-gamepad"
) {

    resultTitle.textContent =
        title;


    resultMessage.textContent =
        message;


    resultIcon.className =
        `fa-solid ${icon}`;

}



/* =========================
   HANDLE CELL CLICK
========================= */

function handleCellClick(event) {

    const cell =
        event.currentTarget;


    const index =
        Number(cell.dataset.index);


    if (!gameActive) {
        return;
    }


    if (board[index] !== "") {
        return;
    }


    board[index] =
        currentPlayer;


    cell.textContent =
        currentPlayer;


    cell.disabled = true;


    cell.classList.add(
        currentPlayer === "X"
            ? "x-mark"
            : "o-mark"
    );


    const result =
        checkGameResult();


    if (result) {

        finishGame(result);

        return;

    }


    currentPlayer =
        currentPlayer === "X"
            ? "O"
            : "X";


    updateTurnDisplay();

}



/* =========================
   CHECK RESULT
========================= */

function checkGameResult() {

    for (
        const combination
        of winningCombinations
    ) {

        const [a, b, c] =
            combination;


        if (
            board[a] !== "" &&
            board[a] === board[b] &&
            board[a] === board[c]
        ) {

            return {
                type: "win",
                player: board[a],
                combination
            };

        }

    }


    if (
        board.every(
            (cell) => cell !== ""
        )
    ) {

        return {
            type: "draw"
        };

    }


    return null;

}



/* =========================
   FINISH GAME
========================= */

function finishGame(result) {

    gameActive = false;


    cells.forEach(
        (cell) => {
            cell.disabled = true;
        }
    );


    if (result.type === "win") {

        scores[result.player]++;


        updateScoreboard();


        result.combination.forEach(
            (index) => {

                cells[index]
                    .classList.add("winner");

            }
        );


        updateResult(
            `Player ${result.player} Wins!`,
            `Player ${result.player} completed three in a row.`,
            "fa-trophy"
        );


        turnSymbol.textContent =
            result.player;


        turnText.textContent =
            "Winner";

        return;

    }


    updateResult(
        "It's a Draw!",
        "The board is full. Start a new game to play again.",
        "fa-handshake"
    );


    turnSymbol.textContent =
        "—";


    turnText.textContent =
        "Draw";

}



/* =========================
   NEW GAME
========================= */

function startNewGame() {

    board = [
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        ""
    ];


    currentPlayer = "X";


    gameActive = true;


    cells.forEach(
        (cell) => {

            cell.textContent =
                "";

            cell.disabled =
                false;

            cell.classList.remove(
                "x-mark",
                "o-mark",
                "winner"
            );

        }
    );


    updateTurnDisplay();


    updateResult(
        "Game in Progress",
        "Player X starts the game.",
        "fa-gamepad"
    );

}



/* =========================
   RESET SCORE
========================= */

function resetScores() {

    scores = {
        X: 0,
        O: 0
    };


    updateScoreboard();


    startNewGame();


    updateResult(
        "Score Reset",
        "Both player scores have been reset.",
        "fa-arrow-rotate-left"
    );

}



/* =========================
   NAVIGATION
========================= */

function initializeNavigation() {

    if (!backButton) {
        return;
    }


    backButton.addEventListener(
        "click",
        () => {

            window.location.href =
                "hazelgame.html";

        }
    );

}



/* =========================
   KEYBOARD SUPPORT
========================= */

function initializeKeyboard() {

    document.addEventListener(
        "keydown",
        (event) => {

            if (event.key === "Escape") {

                window.location.href =
                    "hazelgame.html";

            }

        }
    );

}



/* =========================
   INITIALIZE GAME
========================= */

function initializeGame() {

    cells.forEach(
        (cell) => {

            cell.addEventListener(
                "click",
                handleCellClick
            );

        }
    );


    newGameButton.addEventListener(
        "click",
        startNewGame
    );


    resetScoreButton.addEventListener(
        "click",
        resetScores
    );


    updateScoreboard();


    startNewGame();

}



/* =========================
   AUTH GUARD
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


        await loadUser(user);


        applySavedTheme();


        initializeNavigation();


        initializeKeyboard();


        initializeGame();


        document.body.style.visibility =
            "visible";

    }
);
