/* =========================
   LIVE RELATIONSHIP TIMER
   18 June 2025 - 13:35
   Pakistan Time (UTC+05:00)
========================= */

const startDate =
    new Date("2025-06-18T13:35:00+05:00");


function updateCounter() {

    const now = new Date();


    if (now < startDate) {

        document.getElementById("years").textContent = "0";
        document.getElementById("months").textContent = "0";
        document.getElementById("days").textContent = "0";
        document.getElementById("hours").textContent = "0";
        document.getElementById("minutes").textContent = "0";
        document.getElementById("seconds").textContent = "0";

        return;
    }


    let years =
        now.getFullYear() -
        startDate.getUTCFullYear();


    let months =
        (now.getMonth() + 1) -
        (startDate.getUTCMonth() + 1);


    let days =
        now.getDate() -
        startDate.getUTCDate();


    let hours =
        now.getHours() -
        13;


    let minutes =
        now.getMinutes() -
        35;


    let seconds =
        now.getSeconds();


    /*
       Adjust negative seconds
    */

    if (seconds < 0) {

        seconds += 60;

        minutes--;
    }


    /*
       Adjust negative minutes
    */

    if (minutes < 0) {

        minutes += 60;

        hours--;
    }


    /*
       Adjust negative hours
    */

    if (hours < 0) {

        hours += 24;

        days--;
    }


    /*
       Adjust negative days
    */

    if (days < 0) {

        const previousMonth =
            new Date(
                now.getFullYear(),
                now.getMonth(),
                0
            );

        days +=
            previousMonth.getDate();

        months--;
    }


    /*
       Adjust negative months
    */

    if (months < 0) {

        months += 12;

        years--;
    }


    /*
       Safety
    */

    if (years < 0) {

        years = 0;
        months = 0;
        days = 0;
        hours = 0;
        minutes = 0;
        seconds = 0;
    }


    document.getElementById("years").textContent =
        years;

    document.getElementById("months").textContent =
        months;

    document.getElementById("days").textContent =
        days;

    document.getElementById("hours").textContent =
        String(hours).padStart(2, "0");

    document.getElementById("minutes").textContent =
        String(minutes).padStart(2, "0");

    document.getElementById("seconds").textContent =
        String(seconds).padStart(2, "0");
}


updateCounter();


setInterval(
    updateCounter,
    1000
);


/* =========================
   MENU
========================= */

const menuButton =
    document.getElementById("menuButton");

const menu =
    document.getElementById("menu");


menuButton.addEventListener(
    "click",
    function (event) {

        event.stopPropagation();

        menu.classList.toggle("active");

    }
);


/* =========================
   CLOSE MENU
========================= */

document.addEventListener(
    "click",
    function (event) {

        if (
            !menu.contains(event.target) &&
            !menuButton.contains(event.target)
        ) {

            menu.classList.remove("active");

        }

    }
);


/* =========================
   MENU OPTIONS
========================= */

const options =
    document.querySelectorAll(
        ".menu-option"
    );


options.forEach(
    function (option) {

        option.addEventListener(
            "click",
            function () {

                const link =
                    option.dataset.link;

                window.location.href =
                    link;

            }
        );

    }
);


/* =========================
   SEARCH
========================= */

const searchInput =
    document.getElementById(
        "searchInput"
    );

const noResult =
    document.getElementById(
        "noResult"
    );


searchInput.addEventListener(
    "input",
    function () {

        const query =
            searchInput.value
                .toLowerCase()
                .trim();


        let visibleCount = 0;


        options.forEach(
            function (option) {

                const searchableText =
                    option.dataset.search
                        .toLowerCase();


                if (
                    searchableText
                        .includes(query)
                ) {

                    option.style.display =
                        "flex";

                    visibleCount++;

                } else {

                    option.style.display =
                        "none";

                }

            }
        );


        if (
            query !== "" &&
            visibleCount === 0
        ) {

            noResult.style.display =
                "block";

        } else {

            noResult.style.display =
                "none";

        }

    }
);
