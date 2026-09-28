/* =========================================
   HAZEL SETTINGS JS
========================================= */


/* =========================================
   ELEMENTS
========================================= */

const themeButton = document.getElementById("themeButton");
const themeOptions = document.getElementById("themeOptions");

const aboutButton = document.getElementById("aboutButton");
const aboutContent = document.getElementById("aboutContent");

const homeScreenButton = document.getElementById("homeScreenButton");
const resetButton = document.getElementById("resetButton");

const backButton = document.getElementById("backButton");

const currentThemeText = document.getElementById("currentTheme");

const themeOptionButtons = document.querySelectorAll(".theme-option");

const toast = document.getElementById("toast");


/* =========================================
   THEME NAMES
========================================= */

const themeNames = {
    "black-gold": "Black & Gold",
    "pink": "Pink",
    "white-grey": "White / Grey"
};


/* =========================================
   DEFAULT THEME
========================================= */

const DEFAULT_THEME = "black-gold";


/* =========================================
   TOAST
========================================= */

let toastTimer;

function showToast(message) {

    clearTimeout(toastTimer);

    toast.textContent = message;

    toast.classList.add("show");

    toastTimer = setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);
}


/* =========================================
   THEME
========================================= */

function applyTheme(theme) {

    if (!themeNames[theme]) {
        theme = DEFAULT_THEME;
    }

    document.body.setAttribute("data-theme", theme);

    localStorage.setItem("hazelTheme", theme);

    currentThemeText.textContent = themeNames[theme];

    themeOptionButtons.forEach(option => {

        const optionTheme = option.dataset.theme;

        option.classList.toggle(
            "active",
            optionTheme === theme
        );

    });
}


/* =========================================
   LOAD SAVED THEME
========================================= */

const savedTheme = localStorage.getItem("hazelTheme");

applyTheme(savedTheme || DEFAULT_THEME);


/* =========================================
   THEME EXPAND / COLLAPSE
========================================= */

themeButton.addEventListener("click", () => {

    const isOpen = themeOptions.classList.contains("open");

    themeOptions.classList.toggle("open", !isOpen);

    themeButton.classList.toggle("active", !isOpen);

});


/* =========================================
   SELECT THEME
========================================= */

themeOptionButtons.forEach(option => {

    option.addEventListener("click", (event) => {

        event.stopPropagation();

        const selectedTheme = option.dataset.theme;

        applyTheme(selectedTheme);

        showToast(
            `${themeNames[selectedTheme]} theme applied`
        );

    });

});


/* =========================================
   ABOUT EXPAND / COLLAPSE
========================================= */

aboutButton.addEventListener("click", () => {

    const isOpen = aboutContent.classList.contains("open");

    aboutContent.classList.toggle("open", !isOpen);

    aboutButton.classList.toggle("active", !isOpen);

});


/* =========================================
   ADD TO HOME SCREEN
========================================= */

let deferredInstallPrompt = null;


/*
   Browser install event
*/

window.addEventListener("beforeinstallprompt", (event) => {

    event.preventDefault();

    deferredInstallPrompt = event;

});


/*
   Add to Home Screen button
*/

homeScreenButton.addEventListener("click", async () => {

    if (deferredInstallPrompt) {

        deferredInstallPrompt.prompt();

        const result = await deferredInstallPrompt.userChoice;

        if (result.outcome === "accepted") {
            showToast("HAZEL added to your Home Screen");
        } else {
            showToast("Add to Home Screen cancelled");
        }

        deferredInstallPrompt = null;

        return;
    }


    /*
       Fallback for browsers where native
       install prompt is unavailable.
    */

    showToast(
        "Open your browser menu and choose 'Add to Home Screen'"
    );

});


/* =========================================
   RESET SETTINGS
========================================= */

resetButton.addEventListener("click", () => {

    const confirmed = confirm(
        "Reset all HAZEL settings to default?"
    );

    if (!confirmed) {
        return;
    }


    /*
       Remove HAZEL settings only.
       Firebase/auth data is NOT touched.
    */

    localStorage.removeItem("hazelTheme");


    /*
       Restore default theme.
    */

    applyTheme(DEFAULT_THEME);


    /*
       Close expanded sections.
    */

    themeOptions.classList.remove("open");
    themeButton.classList.remove("active");

    aboutContent.classList.remove("open");
    aboutButton.classList.remove("active");


    showToast("Settings restored to default");

});


/* =========================================
   BACK BUTTON
========================================= */

backButton.addEventListener("click", () => {

    /*
       Go back to the previous page.
       If there is no usable history,
       return to accounts.html.
    */

    if (document.referrer) {
        history.back();
    } else {
        window.location.href = "accounts.html";
    }

});


/* =========================================
   PAGE LOAD
========================================= */

document.addEventListener("DOMContentLoaded", () => {

    /*
       Make sure the saved theme is applied
       when the settings page loads.
    */

    const theme = localStorage.getItem("hazelTheme");

    applyTheme(theme || DEFAULT_THEME);

});
