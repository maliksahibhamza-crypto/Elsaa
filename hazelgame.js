/* =========================
   HAZEL GAMES
   Main JavaScript
========================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =========================
       ELEMENTS
    ========================== */

    const backButton =
        document.getElementById("backButton");

    const tradingCard =
        document.getElementById("tradingCard");

    const tradingToggle =
        document.getElementById("tradingToggle");

    const tradingDetails =
        document.getElementById("tradingDetails");

    const tradingPlay =
        document.getElementById("tradingPlay");


    /* =========================
       HAZEL TRADING
       EXPAND / COLLAPSE
    ========================== */

    tradingToggle.addEventListener("click", () => {

        const isOpen =
            tradingCard.classList.contains("open");


        if (isOpen) {

            /* Collapse only HAZEL Trading */

            tradingCard.classList.remove("open");

            tradingToggle.setAttribute(
                "aria-expanded",
                "false"
            );

            tradingDetails.setAttribute(
                "aria-hidden",
                "true"
            );

        } else {

            /* Expand HAZEL Trading */

            tradingCard.classList.add("open");

            tradingToggle.setAttribute(
                "aria-expanded",
                "true"
            );

            tradingDetails.setAttribute(
                "aria-hidden",
                "false"
            );

        }

    });


    /* =========================
       PLAY BUTTON
    ========================== */

    tradingPlay.addEventListener("click", () => {

        /*
            Actual HAZEL Trading page will be
            connected here later.

            Example later:

            window.location.href = "trading.html";
        */

        console.log(
            "HAZEL Trading will open here."
        );

    });


    /* =========================
       BACK TO HOME
    ========================== */

    backButton.addEventListener("click", () => {

        window.location.href =
            "accounts.html";

    });


    /* =========================
       KEYBOARD ACCESSIBILITY
    ========================== */

    document.addEventListener("keydown", (event) => {

        if (event.key === "Escape") {

            if (
                tradingCard.classList.contains("open")
            ) {

                tradingCard.classList.remove("open");

                tradingToggle.setAttribute(
                    "aria-expanded",
                    "false"
                );

                tradingDetails.setAttribute(
                    "aria-hidden",
                    "true"
                );

            }

        }

    });

});
