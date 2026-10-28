/* Runs on index.html: shows login status and protects the booking button */

const currentUser = JSON.parse(localStorage.getItem("fixnearCurrentUser") || "null");

const loginLink  = document.getElementById("loginLink");
const logoutLink = document.getElementById("logoutLink");
const welcome    = document.getElementById("welcomeUser");

if (currentUser) {
  // Logged in: hide Login, show "Hi, Name" and Logout
  loginLink.hidden  = true;
  logoutLink.hidden = false;
  welcome.hidden    = false;
  welcome.textContent = "Hi, " + currentUser.name.split(" ")[0];

  // Fill the booking form automatically
  document.getElementById("name").value  = currentUser.name;
  document.getElementById("phone").value = currentUser.phone;
}

// Logout
logoutLink.addEventListener("click", e => {
  e.preventDefault();
  localStorage.removeItem("fixnearCurrentUser");
  window.location.reload();
});

// If not logged in, stop the booking and go to the login page.
// This file loads BEFORE script.js, so this click handler runs first
// and stopImmediatePropagation() stops the booking code from running.
document.getElementById("bookBtn").addEventListener("click", e => {
  if (!currentUser) {
    e.stopImmediatePropagation();
    alert("Please login first to book a service.");
    window.location.href = "login.html?next=book";
  }
});