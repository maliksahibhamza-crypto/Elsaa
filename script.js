/* =========================
   LIVE COUNTER
   Start: 18 June 2025, 13:35
   Pakistan Standard Time
========================= */

const startDate = new Date("2025-06-18T13:35:00+05:00");

const counterElements = {
    years: document.getElementById("years"),
    months: document.getElementById("months"),
    days: document.getElementById("days"),
    hours: document.getElementById("hours"),
    minutes: document.getElementById("minutes"),
    seconds: document.getElementById("seconds")
};


/* Get current time in Pakistan Standard Time */
function getPakistanTime() {
    const parts = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Karachi",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hourCycle: "h23"
    }).formatToParts(new Date());

    const values = {};

    parts.forEach(part => {
        if (part.type !== "literal") {
            values[part.type] = Number(part.value);
        }
    });

    return new Date(Date.UTC(
        values.year,
        values.month - 1,
        values.day,
        values.hour,
        values.minute,
        values.second
    ));
}


/* Add months while keeping the date valid */
function addMonths(date, amount) {
    const result = new Date(date);
    const originalDay = result.getUTCDate();

    result.setUTCDate(1);
    result.setUTCMonth(result.getUTCMonth() + amount);

    const lastDay = new Date(Date.UTC(
        result.getUTCFullYear(),
        result.getUTCMonth() + 1,
        0
    )).getUTCDate();

    result.setUTCDate(Math.min(originalDay, lastDay));

    return result;
}


/* Add years while keeping the date valid */
function addYears(date, amount) {
    const result = new Date(date);
    const originalMonth = result.getUTCMonth();
    const originalDay = result.getUTCDate();

    result.setUTCDate(1);
    result.setUTCFullYear(result.getUTCFullYear() + amount);
    result.setUTCMonth(originalMonth);

    const lastDay = new Date(Date.UTC(
        result.getUTCFullYear(),
        result.getUTCMonth() + 1,
        0
    )).getUTCDate();

    result.setUTCDate(Math.min(originalDay, lastDay));

    return result;
}


function updateCounter() {
    const now = getPakistanTime();

    if (now < startDate) {
        Object.values(counterElements).forEach(element => {
            element.textContent = "0";
        });
        return;
    }

    let years = now.getUTCFullYear() - startDate.getUTCFullYear();
    let anchor = addYears(startDate, years);

    if (anchor > now) {
        years--;
        anchor = addYears(startDate, years);
    }

    let months =
        (now.getUTCFullYear() - anchor.getUTCFullYear()) * 12 +
        (now.getUTCMonth() - anchor.getUTCMonth());

    let monthAnchor = addMonths(anchor, months);

    if (monthAnchor > now) {
        months--;
        monthAnchor = addMonths(anchor, months);
    }

    let remainingMilliseconds = now.getTime() - monthAnchor.getTime();

    const dayMilliseconds = 24 * 60 * 60 * 1000;
    const hourMilliseconds = 60 * 60 * 1000;
    const minuteMilliseconds = 60 * 1000;

    const days = Math.floor(remainingMilliseconds / dayMilliseconds);
    remainingMilliseconds -= days * dayMilliseconds;

    const hours = Math.floor(remainingMilliseconds / hourMilliseconds);
    remainingMilliseconds -= hours * hourMilliseconds;

    const minutes = Math.floor(remainingMilliseconds / minuteMilliseconds);
    remainingMilliseconds -= minutes * minuteMilliseconds;

    const seconds = Math.floor(remainingMilliseconds / 1000);

    counterElements.years.textContent = years;
    counterElements.months.textContent = months;
    counterElements.days.textContent = days;
    counterElements.hours.textContent = hours;
    counterElements.minutes.textContent = minutes;
    counterElements.seconds.textContent = seconds;
}

updateCounter();
setInterval(updateCounter, 1000);


/* =========================
   MENU OPEN / CLOSE
========================= */

const menuButton = document.getElementById("menuButton");
const dropdownMenu = document.getElementById("dropdownMenu");
const menuOverlay = document.getElementById("menuOverlay");

function openMenu() {
    dropdownMenu.classList.add("active");
    menuOverlay.classList.add("active");
    menuButton.setAttribute("aria-expanded", "true");
}

function closeMenu() {
    dropdownMenu.classList.remove("active");
    menuOverlay.classList.remove("active");
    menuButton.setAttribute("aria-expanded", "false");
}

menuButton.addEventListener("click", () => {
    const isOpen = dropdownMenu.classList.contains("active");

    if (isOpen) {
        closeMenu();
    } else {
        openMenu();
    }
});

menuOverlay.addEventListener("click", closeMenu);


/* =========================
   MENU LINKS
========================= */

document.querySelectorAll(".menu-option").forEach(option => {
    option.addEventListener("click", () => {
        const link = option.dataset.link;

        if (link) {
            window.location.href = link;
        }
    });
});


/* =========================
   MENU SEARCH
========================= */

const searchInput = document.getElementById("searchInput");
const menuOptions = document.querySelectorAll(".menu-option");
const noResult = document.getElementById("noResult");

searchInput.addEventListener("input", () => {
    const searchValue = searchInput.value.toLowerCase().trim();
    let visibleOptions = 0;

    menuOptions.forEach(option => {
        const searchableText =
            (option.dataset.search || option.textContent).toLowerCase();

        const matches = searchableText.includes(searchValue);

        option.style.display = matches ? "flex" : "none";

        if (matches) {
            visibleOptions++;
        }
    });

    noResult.style.display = visibleOptions === 0 ? "block" : "none";
});
