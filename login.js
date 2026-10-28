/* ===================== SETTINGS ===================== */
const USERS_KEY   = "fixnearUsers";          // list of all accounts
const SESSION_KEY = "fixnearCurrentUser";    // the person who is logged in now

/* Where to go after login: back to the booking form, or the home page */
const params = new URLSearchParams(window.location.search);
const goTo = params.get("next") === "book" ? "index.html#book" : "index.html";

/* If already logged in, skip this page */
if (localStorage.getItem(SESSION_KEY)) {
  window.location.href = goTo;
}

/* ===================== HELPERS ===================== */
function getUsers() {
  return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function showMessage(box, text, isGood) {
  box.textContent = text;
  box.className = "auth-msg " + (isGood ? "ok" : "bad");
}

function startSession(user) {
  localStorage.setItem(SESSION_KEY, JSON.stringify({
    name: user.name,
    phone: user.phone,
    email: user.email
  }));
}

/* ===================== ELEMENTS ===================== */
const tabLogin   = document.getElementById("tabLogin");
const tabSignup  = document.getElementById("tabSignup");
const loginForm  = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");
const loginMsg   = document.getElementById("loginMsg");
const signupMsg  = document.getElementById("signupMsg");

/* ===================== TABS ===================== */
function showTab(which) {
  const isLogin = which === "login";
  loginForm.hidden  = !isLogin;
  signupForm.hidden = isLogin;
  tabLogin.classList.toggle("active", isLogin);
  tabSignup.classList.toggle("active", !isLogin);
  loginMsg.textContent = "";
  signupMsg.textContent = "";
}

tabLogin.addEventListener("click",  () => showTab("login"));
tabSignup.addEventListener("click", () => showTab("signup"));

document.getElementById("goSignup").addEventListener("click", e => { e.preventDefault(); showTab("signup"); });
document.getElementById("goLogin").addEventListener("click",  e => { e.preventDefault(); showTab("login"); });

/* ===================== SHOW / HIDE PASSWORD ===================== */
document.getElementById("showLoginPass").addEventListener("change", e => {
  document.getElementById("loginPass").type = e.target.checked ? "text" : "password";
});

document.getElementById("showSignupPass").addEventListener("change", e => {
  const type = e.target.checked ? "text" : "password";
  document.getElementById("suPass").type  = type;
  document.getElementById("suPass2").type = type;
});

/* ===================== SIGN UP ===================== */
signupForm.addEventListener("submit", e => {
  e.preventDefault();

  const name  = document.getElementById("suName").value.trim();
  const phone = document.getElementById("suPhone").value.trim();
  const email = document.getElementById("suEmail").value.trim().toLowerCase();
  const pass  = document.getElementById("suPass").value;
  const pass2 = document.getElementById("suPass2").value;

  if (name.length < 3) {
    showMessage(signupMsg, "Enter your full name.", false);
    return;
  }
  if (!/^[6-9]\d{9}$/.test(phone)) {
    showMessage(signupMsg, "Enter a valid 10-digit mobile number.", false);
    return;
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    showMessage(signupMsg, "Enter a valid email address.", false);
    return;
  }
  if (pass.length < 6) {
    showMessage(signupMsg, "Password must be at least 6 characters.", false);
    return;
  }
  if (pass !== pass2) {
    showMessage(signupMsg, "Passwords do not match.", false);
    return;
  }

  const users = getUsers();
  const exists = users.some(u => u.email === email || u.phone === phone);
  if (exists) {
    showMessage(signupMsg, "An account with this email or mobile already exists. Please login.", false);
    return;
  }

  const newUser = { name: name, phone: phone, email: email, password: pass };
  users.push(newUser);
  saveUsers(users);

  startSession(newUser);
  showMessage(signupMsg, "Account created! Redirecting...", true);
  setTimeout(() => { window.location.href = goTo; }, 800);
});

/* ===================== LOGIN ===================== */
loginForm.addEventListener("submit", e => {
  e.preventDefault();

  const id   = document.getElementById("loginId").value.trim().toLowerCase();
  const pass = document.getElementById("loginPass").value;

  if (id === "" || pass === "") {
    showMessage(loginMsg, "Enter your email or mobile and password.", false);
    return;
  }

  const user = getUsers().find(u =>
    (u.email === id || u.phone === id) && u.password === pass
  );

  if (!user) {
    showMessage(loginMsg, "Wrong email/mobile or password.", false);
    return;
  }

  startSession(user);
  showMessage(loginMsg, "Login successful! Redirecting...", true);
  setTimeout(() => { window.location.href = goTo; }, 800);
});