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
// Password Toggle
// ===============================

const password = document.getElementById("password");
const confirmPassword = document.getElementById("confirmPassword");

const togglePassword = document.getElementById("togglePassword");
const toggleConfirmPassword = document.getElementById("toggleConfirmPassword");

togglePassword.addEventListener("click", () => {

    if(password.type === "password"){

        password.type = "text";
        togglePassword.innerHTML = '<i class="fa-solid fa-eye-slash"></i>';

    }else{

        password.type = "password";
        togglePassword.innerHTML = '<i class="fa-solid fa-eye"></i>';

    }

});

toggleConfirmPassword.addEventListener("click", () => {

    if(confirmPassword.type === "password"){

        confirmPassword.type = "text";
        toggleConfirmPassword.innerHTML = '<i class="fa-solid fa-eye-slash"></i>';

    }else{

        confirmPassword.type = "password";
        toggleConfirmPassword.innerHTML = '<i class="fa-solid fa-eye"></i>';

    }

});

// ===============================
// Signup Form
// ===============================

const form = document.getElementById("signupForm");
const button = document.getElementById("signupBtn");

form.addEventListener("submit",(e)=>{

    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const pass = password.value.trim();
    const confirm = confirmPassword.value.trim();

    if(username==="" || email==="" || pass==="" || confirm===""){

        alert("Please fill all fields.");
        return;

    }

    if(pass !== confirm){

        alert("Passwords do not match.");
        return;

    }

    if(pass.length < 8){

        alert("Password must contain at least 8 characters.");
        return;

    }

    button.innerHTML='<i class="fa-solid fa-spinner fa-spin"></i> Creating Account...';
    button.disabled=true;

    setTimeout(()=>{

        button.innerHTML="Redirecting...";

    },1000);

    setTimeout(()=>{

        // Future Firebase Signup

        window.location.href="account.html";

    },2200);

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
