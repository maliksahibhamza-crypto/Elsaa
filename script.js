document.addEventListener("DOMContentLoaded", function () {

    /* =========================
       LIVE TIMELINE
       Start:
       18 June 2025 — 13:35
       Pakistan Standard Time
    ========================= */

    const yearsElement = document.getElementById("years");
    const monthsElement = document.getElementById("months");
    const daysElement = document.getElementById("days");
    const hoursElement = document.getElementById("hours");
    const minutesElement = document.getElementById("minutes");
    const secondsElement = document.getElementById("seconds");


    /* Start date */
    const startDate = new Date("2025-06-18T13:35:00+05:00");


    /* =========================
       ADD YEARS
    ========================= */

    function addYears(date, amount) {

        const result = new Date(date);

        const originalMonth = result.getMonth();
        const originalDay = result.getDate();

        result.setDate(1);
        result.setFullYear(
            result.getFullYear() + amount
        );
        result.setMonth(originalMonth);

        const lastDay = new Date(
            result.getFullYear(),
            result.getMonth() + 1,
            0
        ).getDate();

        result.setDate(
            Math.min(originalDay, lastDay)
        );

        return result;
    }


    /* =========================
       ADD MONTHS
    ========================= */

    function addMonths(date, amount) {

        const result = new Date(date);

        const originalDay = result.getDate();

        result.setDate(1);

        result.setMonth(
            result.getMonth() + amount
        );

        const lastDay = new Date(
            result.getFullYear(),
            result.getMonth() + 1,
            0
        ).getDate();

        result.setDate(
            Math.min(originalDay, lastDay)
        );

        return result;
    }


    /* =========================
       UPDATE TIMELINE
    ========================= */

    function updateTimeline() {

        const now = new Date();


        /* If date hasn't arrived */
        if (now < startDate) {

            yearsElement.textContent = "0";
            monthsElement.textContent = "0";
            daysElement.textContent = "0";
            hoursElement.textContent = "0";
            minutesElement.textContent = "0";
            secondsElement.textContent = "0";

            return;
        }


        /* YEARS */

        let years =
            now.getFullYear() -
            startDate.getFullYear();

        let yearAnchor =
            addYears(startDate, years);


        if (yearAnchor > now) {

            years--;

            yearAnchor =
                addYears(startDate, years);
        }


        /* MONTHS */

        let months =
            (now.getFullYear() -
                yearAnchor.getFullYear()) * 12
            +
            (now.getMonth() -
                yearAnchor.getMonth());


        let monthAnchor =
            addMonths(yearAnchor, months);


        if (monthAnchor > now) {

            months--;

            monthAnchor =
                addMonths(yearAnchor, months);
        }


        /* REMAINING TIME */

        let remaining =
            now.getTime() -
            monthAnchor.getTime();


        const dayMS =
            24 * 60 * 60 * 1000;

        const hourMS =
            60 * 60 * 1000;

        const minuteMS =
            60 * 1000;

        const secondMS =
            1000;


        const days =
            Math.floor(remaining / dayMS);

        remaining -=
            days * dayMS;


        const hours =
            Math.floor(remaining / hourMS);

        remaining -=
            hours * hourMS;


        const minutes =
            Math.floor(remaining / minuteMS);

        remaining -=
            minutes * minuteMS;


        const seconds =
            Math.floor(remaining / secondMS);


        /* DISPLAY */

        yearsElement.textContent = years;
        monthsElement.textContent = months;
        daysElement.textContent = days;
        hoursElement.textContent = hours;
        minutesElement.textContent = minutes;
        secondsElement.textContent = seconds;
    }


    /* Start timeline immediately */
    updateTimeline();


    /* Update every second */
    setInterval(updateTimeline, 1000);



    /* =========================
       BOTTOM NAVIGATION
    ========================= */

    const navigation =
        document.getElementById("mainNavigation");


    if (navigation) {

        const navItems =
            navigation.querySelectorAll(".nav-item");

        let selectedItem = null;
        let navigationTimer = null;


        navItems.forEach(function (item) {

            item.addEventListener("click", function (event) {

                /*
                   First click:
                   Expand item
                */

                if (selectedItem !== item) {

                    event.preventDefault();


                    navItems.forEach(function (navItem) {

                        navItem.classList.remove(
                            "selected"
                        );

                    });


                    selectedItem = item;

                    item.classList.add("selected");


                    clearTimeout(
                        navigationTimer
                    );


                    /*
                       Open after 3 seconds
                    */

                    navigationTimer =
                        setTimeout(function () {

                            window.location.href =
                                item.href;

                        }, 3000);


                    return;
                }


                /*
                   Second click:
                   Open immediately
                */

                clearTimeout(
                    navigationTimer
                );


                window.location.href =
                    item.href;

            });

        });

    }

});

/* =========================
   COPY DEVELOPER ID
========================= */

const copyDeveloper =
    document.getElementById("copyDeveloper");

const developerCode =
    document.getElementById("developerCode");


if (copyDeveloper && developerCode) {

    copyDeveloper.addEventListener("click", async function () {

        try {

            await navigator.clipboard.writeText(
                developerCode.textContent.trim()
            );

            copyDeveloper.innerHTML =
                '<i class="fa-solid fa-check"></i>';

            setTimeout(function () {

                copyDeveloper.innerHTML =
                    '<i class="fa-regular fa-copy"></i>';

            }, 1500);

        } catch (error) {

            console.error(
                "Failed to copy developer ID:",
                error
            );

        }

    });

}
