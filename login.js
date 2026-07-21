// ===============================
// Loading Screen
// ===============================

window.addEventListener("load", () => {

    setTimeout(() => {

        document.getElementById("loading-screen").style.opacity = "0";

        setTimeout(() => {
            document.getElementById("loading-screen").style.display = "none";
        }, 800);

    }, 1500);

});

// ===============================
// Password Show / Hide
// ===============================

const password = document.getElementById("password");
const toggle = document.getElementById("togglePassword");

toggle.addEventListener("click", () => {

    if (password.type === "password") {

        password.type = "text";

        toggle.innerHTML = '<i class="fa-solid fa-eye-slash"></i>';

    } else {

        password.type = "password";

        toggle.innerHTML = '<i class="fa-solid fa-eye"></i>';

    }

});

// ===============================
// Login
// ===============================

const form = document.getElementById("loginForm");
const button = document.getElementById("loginBtn");

form.addEventListener("submit", function(e){

    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const pass = password.value.trim();

    if(username === "" || pass === ""){

        alert("Please fill all fields.");

        return;

    }

    button.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Logging In...';

    button.disabled = true;

    setTimeout(()=>{

        button.innerHTML = "Redirecting...";

    },1000);

    setTimeout(()=>{

        // Future:
        // Replace account.html with Firebase Login

        window.location.href = "account.html";

    },2000);

});

// ===============================
// Enter Key Support
// ===============================

document.addEventListener("keydown",(e)=>{

    if(e.key==="Enter"){

        form.requestSubmit();

    }

});

// ===============================
// Background Particles
// ===============================

particlesJS("particles-js",{

    particles:{

        number:{
            value:45
        },

        color:{
            value:"#d4af37"
        },

        shape:{
            type:"circle"
        },

        opacity:{
            value:0.35
        },

        size:{
            value:4
        },

        move:{
            enable:true,
            speed:1
        }

    }

});
