/* =========================================================
   HAZEL — SECTIONS THEME SYNC
   Uses the existing HAZEL global theme system.
   ========================================================= */

(function () {

    "use strict";


    /* -------------------------
       Existing HAZEL themes
       ------------------------- */

    const DEFAULT_THEME = "black-gold";

    const allowedThemes = [
        "black-gold",
        "pink",
        "white-grey"
    ];


    /* -------------------------
       Apply saved theme
       ------------------------- */

    function applySavedTheme() {

        const savedTheme = localStorage.getItem("hazelTheme");

        const theme = allowedThemes.includes(savedTheme)
            ? savedTheme
            : DEFAULT_THEME;

        document.body.setAttribute("data-theme", theme);
    }


    /* Initial theme */

    applySavedTheme();


    /* -------------------------
       Sync if theme changes
       in another tab/window
       ------------------------- */

    window.addEventListener("storage", function (event) {

        if (event.key === "hazelTheme") {
            applySavedTheme();
        }

    });


    /* -------------------------
       Re-check when page
       becomes visible again
       ------------------------- */

    document.addEventListener("visibilitychange", function () {

        if (!document.hidden) {
            applySavedTheme();
        }

    });


    /* -------------------------
       Re-check when returning
       through browser history
       ------------------------- */

    window.addEventListener("pageshow", function () {

        applySavedTheme();

    });


    /* -------------------------
       Back button
       ------------------------- */

    const backButton = document.getElementById("backButton");

    if (backButton) {

        backButton.addEventListener("click", function () {

            if (window.history.length > 1) {

                window.history.back();

            } else {

                window.location.href = "accounts.html";

            }

        });

    }

})();
