// Flow authentication helper
// Works on login/signup pages and protected application pages.

const SUPABASE_URL = "https://ihbpddlzmyxajfbpdrpb.supabase.co";
const SUPABASE_ANON_KEY = "";

let supabaseClient = null;

if (window.supabase && SUPABASE_URL && SUPABASE_ANON_KEY) {
    supabaseClient = window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY
    );
}

const FlowAuth = {
    async getCurrentUser() {
        if (!supabaseClient) return null;

        const { data, error } = await supabaseClient.auth.getUser();
        if (error || !data || !data.user) return null;

        return data.user;
    },

    async requireAuth() {
        const user = await this.getCurrentUser();

        if (!user) {
            const loginPage = "login.html";
            if (!window.location.pathname.endsWith(loginPage)) {
                window.location.replace(loginPage);
            }
            return null;
        }

        return user;
    },

    async logout() {
        if (supabaseClient) {
            await supabaseClient.auth.signOut();
        }
        window.location.replace("login.html");
    }
};

// Protect application pages automatically.
// Login/signup pages are intentionally excluded.
document.addEventListener("DOMContentLoaded", async () => {
    const path = window.location.pathname.toLowerCase();
    const isAuthPage =
        path.endsWith("/login.html") ||
        path.endsWith("/signup.html") ||
        path.endsWith("/register.html");

    if (!isAuthPage && supabaseClient) {
        await FlowAuth.requireAuth();
    }
});

// Existing login/signup UI logic only runs when those elements exist.
document.addEventListener("DOMContentLoaded", () => {
    const loginBox = document.getElementById("loginBox");
    const signupBox = document.getElementById("signupBox");
    const showSignup = document.getElementById("showSignup");
    const showLogin = document.getElementById("showLogin");
    const loginForm = document.getElementById("loginForm");
    const signupBtn = document.getElementById("signupBtn");

    if (showSignup && loginBox && signupBox) {
        showSignup.addEventListener("click", () => {
            loginBox.style.display = "none";
            signupBox.style.display = "block";
        });
    }

    if (showLogin && loginBox && signupBox) {
        showLogin.addEventListener("click", () => {
            signupBox.style.display = "none";
            loginBox.style.display = "block";
        });
    }

    if (loginForm && supabaseClient) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const email = document.getElementById("loginEmail")?.value?.trim();
            const password = document.getElementById("loginPassword")?.value;

            if (!email || !password) return;

            const { error } = await supabaseClient.auth.signInWithPassword({
                email,
                password
            });

            if (error) {
                alert(error.message);
                return;
            }

            window.location.replace("index.html");
        });
    }

    if (signupBtn && supabaseClient) {
        signupBtn.addEventListener("click", async () => {
            const email = document.getElementById("signupEmail")?.value?.trim();
            const password = document.getElementById("signupPassword")?.value;

            if (!email || !password) return;

            const { data, error } = await supabaseClient.auth.signUp({
                email,
                password
            });

            if (error) {
                alert(error.message);
                return;
            }

            if (data?.session) {
                window.location.replace("index.html");
            } else {
                alert("Signup successful. Please verify your email, then login.");
            }
        });
    }
});
