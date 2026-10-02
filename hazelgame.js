
"use strict";

document.addEventListener("DOMContentLoaded", () => {

/* =========================  
   ELEMENTS  
========================= */  

const backButton = document.getElementById("backButton");  

const games = [  
    {  
        card: document.getElementById("tradingCard"),  
        toggle: document.getElementById("tradingToggle"),  
        details: document.getElementById("tradingDetails"),  
        play: document.getElementById("tradingPlay")  
    },  

    {  
        card: document.getElementById("ticTacToeCard"),  
        toggle: document.getElementById("ticTacToeToggle"),  
        details: document.getElementById("ticTacToeDetails"),  
        play: document.getElementById("ticTacToePlay")  
    },  

    {  
        card: document.getElementById("guessNumberCard"),  
        toggle: document.getElementById("guessNumberToggle"),  
        details: document.getElementById("guessNumberDetails"),  
        play: document.getElementById("guessNumberPlay")  
    }  
];  


/* =========================  
   THEME  
========================= */  

function applySavedTheme() {  

    const savedTheme = localStorage.getItem("hazelTheme");  

    const allowedThemes = [  
        "black-gold",  
        "pink",  
        "white-grey"  
    ];  

    const theme = allowedThemes.includes(savedTheme)  
        ? savedTheme  
        : "black-gold";  

    document.documentElement.setAttribute(  
        "data-theme",  
        theme  
    );  
}  


/* =========================  
   GAME CONTROLS  
========================= */  

function openGame(game) {  

    if (!game.card) return;  

    game.card.classList.add("open");  

    if (game.toggle) {  
        game.toggle.setAttribute(  
            "aria-expanded",  
            "true"  
        );  
    }  

    if (game.details) {  
        game.details.setAttribute(  
            "aria-hidden",  
            "false"  
        );  
    }  
}  


function closeGame(game) {  

    if (!game.card) return;  

    game.card.classList.remove("open");  

    if (game.toggle) {  
        game.toggle.setAttribute(  
            "aria-expanded",  
            "false"  
        );  
    }  

    if (game.details) {  
        game.details.setAttribute(  
            "aria-hidden",  
            "true"  
        );  
    }  
}  


function toggleGame(game) {  

    if (!game.card) return;  

    const isOpen =  
        game.card.classList.contains("open");  

    if (isOpen) {  
        closeGame(game);  
    } else {  
        openGame(game);  
    }  
}  


/* =========================  
   INITIALIZE GAMES  
========================= */  

function initializeGames() {  

    games.forEach((game) => {  

        if (!game.card || !game.toggle) {  
            return;  
        }  

        game.toggle.addEventListener(  
            "click",  
            () => toggleGame(game)  
        );  

        if (game.play) {  

            game.play.addEventListener(  
                "click",  
                () => {  

                    console.log(  
                        "Game is ready to be connected."  
                    );  

                }  
            );  

        }  

        closeGame(game);  
    });  
}  


/* =========================  
   BACK BUTTON  
========================= */  

function initializeNavigation() {  

    if (!backButton) return;  

    backButton.addEventListener(  
        "click",  
        () => {  
            window.location.href = "accounts.html";  
        }  
    );  
}  


/* =========================  
   KEYBOARD SUPPORT  
========================= */  

function initializeKeyboardSupport() {  

    document.addEventListener(  
        "keydown",  
        (event) => {  

            if (event.key !== "Escape") {  
                return;  
            }  

            games.forEach((game) => {  

                if (  
                    game.card &&  
                    game.card.classList.contains("open")  
                ) {  
                    closeGame(game);  
                }  

            });  

        }  
    );  
}  


/* =========================  
   INITIALIZATION  
========================= */  

applySavedTheme();  
initializeGames();  
initializeNavigation();  
initializeKeyboardSupport();

});
