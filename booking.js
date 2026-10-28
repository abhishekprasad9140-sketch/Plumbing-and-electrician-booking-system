/* ===================== ELEMENTS ===================== */
const serviceSel   = document.getElementById("service");
const jobSel       = document.getElementById("job");
const searchBox    = document.getElementById("searchBox");
const noResult     = document.getElementById("noResult");
const dateInput    = document.getElementById("date");
const serviceCards = document.querySelectorAll(".card.service");
const reviewList   = document.getElementById("reviewList");

/* ===================== STORAGE ===================== */
let bookings    = JSON.parse(localStorage.getItem("fixnearBookings") || "[]");
let userReviews = JSON.parse(localStorage.getItem("fixnearUserReviews") || "[]");

function saveBookings(){ localStorage.setItem("fixnearBookings", JSON.stringify(bookings)); }
function saveReviews(){ localStorage.setItem("fixnearUserReviews", JSON.stringify(userReviews)); }

/* ===================== SERVICE CARDS ===================== */
// Highlight the card that matches the selected service
function highlightCard(){
  serviceCards.forEach(card => {
    card.classList.toggle("selected", card.dataset.service === serviceSel.value);
  });
}

// Click a card -> select that service in the booking form
function selectService(id){
  serviceSel.value = id;
  highlightCard();
  updateEstimate();
  document.getElementById("book").scrollIntoView({ behavior: "smooth" });
}

serviceCards.forEach(card => {
  card.addEventListener("click", () => selectService(card.dataset.service));
  card.addEventListener("keydown", e => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      selectService(card.dataset.service);
    }
  });
});

// Search box: hide cards that do not match
searchBox.addEventListener("input", () => {
  const q = searchBox.value.trim().toLowerCase();
  let visible = 0;
  serviceCards.forEach(card => {
    const match = card.textContent.toLowerCase().includes(q);
    card.style.display = match ? "" : "none";
    if (match) visible++;
  });
  noResult.hidden = visible > 0;
});

/* ===================== PRICE ESTIMATE ===================== */
function updateEstimate(){
  const opt        = serviceSel.options[serviceSel.selectedIndex];
  const inspection = Number(opt.dataset.inspection);
  const repair     = Number(opt.dataset[jobSel.value]);   // dataset.min or dataset.max

  document.getElementById("estimate").innerHTML =
    `Inspection charge: <b>₹${inspection}</b> &nbsp;|&nbsp; Estimated repair fee: <b>₹${repair}</b><br>
     Estimated total: <strong>₹${inspection + repair}</strong>
     <div class="note">Inspection charge is adjusted if you approve the repair. Final price depends on parts used.</div>`;
}

serviceSel.addEventListener("change", () => { highlightCard(); updateEstimate(); });
jobSel.addEventListener("change", updateEstimate);

/* ===================== BOOKING FORM ===================== */
dateInput.min = new Date().toISOString().split("T")[0];   // blocks past dates

function validate(){
  let ok = true;
  const name  = document.getElementById("name").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const addr  = document.getElementById("address").value.trim();

  function setError(id, message){
    document.getElementById(id).textContent = message;
    if (message) ok = false;
  }

  setError("eName",    name.length < 3 ? "Enter your full name." : "");
  setError("ePhone",   /^[6-9]\d{9}$/.test(phone) ? "" : "Enter a valid 10-digit mobile number.");
  setError("eDate",    dateInput.value ? "" : "Choose a date.");
  setError("eAddress", addr.length < 8 ? "Enter your full address." : "");
  return ok;
}

document.getElementById("bookBtn").addEventListener("click", () => {
  if (!validate()) return;

  const opt        = serviceSel.options[serviceSel.selectedIndex];
  const inspection = Number(opt.dataset.inspection);
  const repair     = Number(opt.dataset[jobSel.value]);

  const booking = {
    id: "FN" + Date.now().toString().slice(-6),
    name: document.getElementById("name").value.trim(),
    phone: document.getElementById("phone").value.trim(),
    service: opt.textContent,
    date: dateInput.value,
    slot: document.getElementById("slot").value,
    address: document.getElementById("address").value.trim(),
    total: inspection + repair
  };

  bookings.push(booking);
  saveBookings();

  const msg = document.getElementById("msg");
  msg.style.display = "block";
  msg.textContent = `Booking confirmed! Your ID is ${booking.id}. A technician will call you on ${booking.phone}.`;

  document.getElementById("name").value = "";
  document.getElementById("phone").value = "";
  document.getElementById("address").value = "";
  dateInput.value = "";

  renderBookings();
});

/* ===================== MY BOOKINGS ===================== */
function renderBookings(){
  const list = document.getElementById("bookingList");

  if (bookings.length === 0) {
    list.innerHTML = '<p class="empty">No bookings yet. Book a service above.</p>';
    return;
  }

  list.innerHTML = bookings.map(b => `
    <div class="booking">
      <div>
        <b>${b.service}</b> – ${b.id}<br>
        <small>${b.date}, ${b.slot} | ${b.name} (${b.phone})<br>${b.address} | Est. ₹${b.total}</small>
      </div>
      <button class="cancel" data-id="${b.id}">Cancel</button>
    </div>`).join("");

  list.querySelectorAll(".cancel").forEach(btn => {
    btn.addEventListener("click", () => {
      bookings = bookings.filter(b => b.id !== btn.dataset.id);
      saveBookings();
      renderBookings();
    });
  });
}

/* ===================== REVIEWS ===================== */
function starText(n){ return "★".repeat(n) + "☆".repeat(5 - n); }

function escapeHTML(text){
  return text.replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}

// Add one review card at the top of the list
function addReviewCard(review){
  reviewList.insertAdjacentHTML("afterbegin", `
    <div class="card" data-stars="${review.stars}">
      <div class="stars">${starText(review.stars)}</div>
      <p>"${escapeHTML(review.text)}"</p>
      <h3>– ${escapeHTML(review.name)}</h3>
    </div>`);
}

// Work out the average from every review card on the page
function updateAverage(){
  const cards = reviewList.querySelectorAll(".card");
  let total = 0;
  cards.forEach(c => total += Number(c.dataset.stars));
  const avg = cards.length ? total / cards.length : 0;
  document.getElementById("avgRating").textContent =
    `Average rating: ${avg.toFixed(1)} / 5 from ${cards.length} reviews`;
}

document.getElementById("reviewBtn").addEventListener("click", () => {
  const name = document.getElementById("rName").value.trim();
  const text = document.getElementById("rText").value.trim();
  const err  = document.getElementById("eReview");

  if (name.length < 2 || text.length < 5) {
    err.textContent = "Enter your name and a short review.";
    return;
  }
  err.textContent = "";

  const review = { name: name, text: text, stars: Number(document.getElementById("rStars").value) };
  userReviews.push(review);
  saveReviews();
  addReviewCard(review);
  updateAverage();

  document.getElementById("rName").value = "";
  document.getElementById("rText").value = "";
});

/* ===================== START ===================== */
userReviews.forEach(addReviewCard);   // show reviews saved earlier
highlightCard();
updateEstimate();
renderBookings();
updateAverage();