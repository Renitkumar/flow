const SUPABASE_URL = "https://ihbpddlzmyxajfbpdrpb.supabase.co";
const SUPABASE_KEY = "sb_publishable_mAmh160qISZEml5IXDw_xw_H-kZBqoj";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
window.FlowAuth = { supabase: supabaseClient };

async function getCurrentUser() {
  const { data, error } = await supabaseClient.auth.getUser();
  return error ? null : data.user;
}

async function protectPage() {
  const user = await getCurrentUser();
  if (!user) window.location.replace('login.html');
  return user;
}

async function logout() {
  await supabaseClient.auth.signOut();
  window.location.replace('login.html');
}

window.FlowAuth.getCurrentUser = getCurrentUser;
window.FlowAuth.logout = logout;
window.FlowAuth.requireAuth = protectPage;

// Login / signup UI. Runs only when these elements exist.
document.addEventListener('DOMContentLoaded', () => {
  const loginBox = document.getElementById('loginBox');
  const signupBox = document.getElementById('signupBox');
  const showSignup = document.getElementById('showSignup');
  const showLogin = document.getElementById('showLogin');
  const loginForm = document.getElementById('loginForm');
  const signupBtn = document.getElementById('signupBtn');
  const verifyOtpBtn = document.getElementById('verifyOtpBtn');
  const loginMessage = document.getElementById('loginMessage');
  const signupMessage = document.getElementById('signupMessage');
  const otpSection = document.getElementById('otpSection');

  if (showSignup) showSignup.addEventListener('click', () => {
    if(loginBox) loginBox.style.display='none';
    if(signupBox) signupBox.style.display='block';
    if(loginMessage) loginMessage.textContent='';
  });
  if (showLogin) showLogin.addEventListener('click', () => {
    if(signupBox) signupBox.style.display='none';
    if(loginBox) loginBox.style.display='block';
    if(signupMessage) signupMessage.textContent='';
    if(otpSection) otpSection.style.display='none';
  });

  if (loginForm) loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email=document.getElementById('loginEmail')?.value.trim();
    const password=document.getElementById('loginPassword')?.value;
    if(loginMessage) loginMessage.textContent='Logging in...';
    const { error }=await supabaseClient.auth.signInWithPassword({email,password});
    if(error) { if(loginMessage) loginMessage.textContent=error.message; return; }
    if(loginMessage) loginMessage.textContent='Login successful!';
    window.location.replace('index.html');
  });

  if (signupBtn) signupBtn.addEventListener('click', async () => {
    const name=document.getElementById('signupName')?.value.trim();
    const email=document.getElementById('signupEmail')?.value.trim();
    const phone=document.getElementById('signupPhone')?.value.trim();
    const password=document.getElementById('signupPassword')?.value;
    if(!name || !email || !password) { if(signupMessage) signupMessage.textContent='Please fill name, email and password.'; return; }
    if(password.length<6) { if(signupMessage) signupMessage.textContent='Password must be at least 6 characters.'; return; }
    signupBtn.disabled=true; signupBtn.textContent='Sending OTP...';
    const { error }=await supabaseClient.auth.signInWithOtp({email,options:{shouldCreateUser:true,data:{full_name:name,phone}}});
    if(error) { if(signupMessage) signupMessage.textContent=error.message; signupBtn.disabled=false; signupBtn.textContent='Create Account 🚀'; return; }
    if(signupMessage) signupMessage.textContent='OTP sent to your email. Enter the code below.';
    if(otpSection) otpSection.style.display='block'; signupBtn.style.display='none';
  });

  if (verifyOtpBtn) verifyOtpBtn.addEventListener('click', async () => {
    const name=document.getElementById('signupName')?.value.trim();
    const email=document.getElementById('signupEmail')?.value.trim();
    const phone=document.getElementById('signupPhone')?.value.trim();
    const password=document.getElementById('signupPassword')?.value;
    const otp=document.getElementById('otp')?.value.trim();
    if(!otp) { if(signupMessage) signupMessage.textContent='Please enter the OTP.'; return; }
    verifyOtpBtn.disabled=true; verifyOtpBtn.textContent='Verifying...';
    const { data,error }=await supabaseClient.auth.verifyOtp({email,token:otp,type:'email'});
    if(error) { if(signupMessage) signupMessage.textContent=error.message; verifyOtpBtn.disabled=false; verifyOtpBtn.textContent='Verify OTP'; return; }
    const { error:passwordError }=await supabaseClient.auth.updateUser({password});
    if(passwordError) { if(signupMessage) signupMessage.textContent='Email verified, but password setup failed: '+passwordError.message; verifyOtpBtn.disabled=false; verifyOtpBtn.textContent='Verify OTP'; return; }
    if(data?.user) {
      const { error:profileError }=await supabaseClient.from('profiles').upsert({id:data.user.id,full_name:name,email,phone});
      if(profileError && signupMessage) signupMessage.textContent='Account created, but profile setup failed: '+profileError.message;
    }
    if(signupMessage) signupMessage.textContent='Account created successfully 🎉';
    setTimeout(()=>window.location.replace('index.html'),700);
  });
});

// Protect every application page when auth.js is loaded there.
document.addEventListener('DOMContentLoaded', async () => {
  const path=window.location.pathname.toLowerCase();
  const isLogin=path.endsWith('/login.html') || path.endsWith('/signup.html') || path.endsWith('/register.html');
  if(!isLogin) await protectPage();
});
