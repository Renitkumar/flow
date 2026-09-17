const SUPABASE_URL = "https://ihbpddlzmyxajfbpdrpb.supabase.co";
const SUPABASE_KEY = "sb_publishable_mAmh160qISZEml5IXDw_xw_H-kZBqoj";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


// ===============================
// ELEMENTS
// ===============================

const loginBox = document.getElementById("loginBox");
const signupBox = document.getElementById("signupBox");

const showSignup = document.getElementById("showSignup");
const showLogin = document.getElementById("showLogin");

const loginForm = document.getElementById("loginForm");
const signupBtn = document.getElementById("signupBtn");
const verifyOtpBtn = document.getElementById("verifyOtpBtn");

const loginMessage = document.getElementById("loginMessage");
const signupMessage = document.getElementById("signupMessage");

const otpSection = document.getElementById("otpSection");


// ===============================
// SWITCH LOGIN / SIGNUP
// ===============================

showSignup.addEventListener("click", () => {

    loginBox.style.display = "none";
    signupBox.style.display = "block";

    loginMessage.textContent = "";
});


showLogin.addEventListener("click", () => {

    signupBox.style.display = "none";
    loginBox.style.display = "block";

    signupMessage.textContent = "";
    otpSection.style.display = "none";
});


// ===============================
// LOGIN WITH PASSWORD
// ===============================

loginForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    const email = document
        .getElementById("loginEmail")
        .value
        .trim();

    const password = document
        .getElementById("loginPassword")
        .value;

    loginMessage.textContent = "Logging in...";

    const { data, error } =
        await supabaseClient.auth.signInWithPassword({
            email,
            password
        });

    if (error) {

        loginMessage.textContent = error.message;
        return;
    }

    loginMessage.textContent = "Login successful!";

    window.location.href = "index.html";
});


// ===============================
// SEND EMAIL OTP
// ===============================

signupBtn.addEventListener("click", async () => {

    const name = document
        .getElementById("signupName")
        .value
        .trim();

    const email = document
        .getElementById("signupEmail")
        .value
        .trim();

    const phone = document
        .getElementById("signupPhone")
        .value
        .trim();

    const password = document
        .getElementById("signupPassword")
        .value;


    if (!name || !email || !password) {

        signupMessage.textContent =
            "Please fill name, email and password.";

        return;
    }


    if (password.length < 6) {

        signupMessage.textContent =
            "Password must be at least 6 characters.";

        return;
    }


    signupBtn.disabled = true;
    signupBtn.textContent = "Sending OTP...";


    // Send OTP
    const { error } =
        await supabaseClient.auth.signInWithOtp({

            email: email,

            options: {

                shouldCreateUser: true,

                data: {
                    full_name: name,
                    phone: phone
                }
            }
        });


    if (error) {

        signupMessage.textContent =
            error.message;

        signupBtn.disabled = false;
        signupBtn.textContent =
            "Create Account 🚀";

        return;
    }


    signupMessage.textContent =
        "OTP sent to your Gmail. Enter the 6-digit OTP below.";

    otpSection.style.display = "block";

    signupBtn.style.display = "none";
});


// ===============================
// VERIFY OTP
// ===============================

verifyOtpBtn.addEventListener("click", async () => {

    const name = document
        .getElementById("signupName")
        .value
        .trim();

    const email = document
        .getElementById("signupEmail")
        .value
        .trim();

    const phone = document
        .getElementById("signupPhone")
        .value
        .trim();

    const password = document
        .getElementById("signupPassword")
        .value;

    const otp = document
        .getElementById("otp")
        .value
        .trim();

if (!otp || otp.length !== 8) {
    signupMessage.textContent =
        "Please enter the 8-digit OTP.";
    return;
}


    verifyOtpBtn.disabled = true;
    verifyOtpBtn.textContent = "Verifying...";


    // Verify OTP
    const { data, error } =
        await supabaseClient.auth.verifyOtp({

            email: email,

            token: otp,

            type: "email"
        });


    if (error) {

        signupMessage.textContent =
            error.message;

        verifyOtpBtn.disabled = false;
        verifyOtpBtn.textContent =
            "Verify OTP";

        return;
    }


    // OTP verified → user is logged in
    const user = data.user;


    // Set password so future login works
    const { error: passwordError } =
        await supabaseClient.auth.updateUser({

            password: password

        });


    if (passwordError) {

        signupMessage.textContent =
            "Email verified, but password setup failed: " +
            passwordError.message;

        verifyOtpBtn.disabled = false;
        verifyOtpBtn.textContent =
            "Verify OTP";

        return;
    }


    // ===============================
    // CREATE PROFILE
    // ===============================

    const { error: profileError } =
        await supabaseClient
            .from("profiles")
            .upsert({

                id: user.id,

                full_name: name,

                email: email,

                phone: phone

            });


    if (profileError) {

        signupMessage.textContent =
            "Account created, but profile setup failed: " +
            profileError.message;

        return;
    }


    signupMessage.textContent =
        "Account created successfully 🎉";


    setTimeout(() => {

        window.location.href = "index.html";

    }, 1000);
});


// ===============================
// CURRENT USER
// ===============================

async function getCurrentUser() {

    const {
        data: { user }
    } = await supabaseClient.auth.getUser();

    return user;
}


// ===============================
// LOGOUT
// ===============================

async function logout() {

    await supabaseClient.auth.signOut();

    window.location.href = "login.html";
}


// ===============================
// GLOBAL FLOW AUTH
// ===============================

window.FlowAuth = {

    supabase: supabaseClient,

    getCurrentUser,

    logout

};