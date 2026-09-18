// WasteWise Dashboard — Version 2 (backend-driven recycling stats)
// Recycle stats now come from backend/database, not hardcoded JS

const API_BASE = window.__WASTEWISE_API__ || 'http://localhost:8080';

// Points conversion — single configurable location (not stored in DB)
const POINTS_PER_RUPEE = 20; // 20 points = ₹1

// Centralized user data — recycling stats are FETCHED from backend
// Only name/email/memberId are hydrated from localStorage (auth), stats are 0 until fetch
const currentUser = {
  name: "—",
  email: "—",
  memberId: "—",
  bottlesRecycled: 0,
  petWeightKg: 0,
  points: 0,
};

// Rewards catalog — also centralized so backend can replace it later
// costs map to money via POINTS_PER_RUPEE (cost / 20 = ₹)
const rewards = [
  { id: "r25", title: "₹25 Eco Reward", cost: 500, desc: "Eco-friendly reward" },
  { id: "r50", title: "₹50 Eco Reward", cost: 1000, desc: "Community partner coupon" },
  { id: "r100", title: "₹100 Eco Reward", cost: 2000, desc: "Sustainable goodies" },
  { id: "r250", title: "₹250 Eco Reward", cost: 5000, desc: "Premium eco bundle" },
];

// ---- DOM refs ----
const welcomeTitle = document.getElementById("welcome-title");
const profileAvatar = document.getElementById("profile-avatar");
const profileName = document.getElementById("profile-name");
const profileEmail = document.getElementById("profile-email");
const profileId = document.getElementById("profile-id");
const statPet = document.getElementById("stat-pet");
const statBottles = document.getElementById("stat-bottles");
const statPoints = document.getElementById("stat-points");
const statRupee = document.getElementById("stat-rupee");
const contribMain = document.getElementById("contrib-main");
const contribCount = document.getElementById("contrib-count");
const contribDetail = document.getElementById("contrib-detail");
const redeemGrid = document.getElementById("redeem-grid");
const modal = document.getElementById("redeem-modal");
const modalMsg = document.getElementById("modal-msg");
const modalClose = document.getElementById("modal-close");
const modalBackdrop = document.getElementById("modal-backdrop");

function getInitials(name) {
  return name.split(" ").filter(Boolean).slice(0, 2).map(s => s[0].toUpperCase()).join("");
}

function formatNumber(n) {
  return Number(n).toLocaleString("en-IN");
}

function formatKg(kg) {
  const v = Number(kg) || 0;
  return v.toLocaleString("en-IN", { minimumFractionDigits: v % 1 === 0 ? 0 : 2, maximumFractionDigits: 2 }) + " kg";
}

function rupeesFromPoints(points) {
  return Math.floor((Number(points) || 0) / POINTS_PER_RUPEE);
}

// Load profile + fetch recycling stats from backend
async function loadUserData() {
  // Hydrate name/email from localStorage (set by auth.js)
  try {
    const stored = JSON.parse(localStorage.getItem("wastewise_user") || "null");
    if (stored) {
      if (stored.name) currentUser.name = stored.name;
      if (stored.email) currentUser.email = stored.email;
      if (stored.id) currentUser.memberId = "WW-" + String(stored.id).padStart(6, "0");
    }
  } catch (_) {}
  // Render profile immediately (stats still 0)
  renderUserData();
  // Fetch stats from backend/database
  await fetchRecyclingStats();
}

async function fetchRecyclingStats() {
  const token = localStorage.getItem("wastewise_token");
  if (!token) {
    // Not logged in: keep zeros (spec: show 0 kg / 0 / ₹0, no error page)
    renderUserData();
    return;
  }
  try {
    const res = await fetch(`${API_BASE}/api/user/recycling-stats`, {
      headers: { "Authorization": `Bearer ${token}` },
    });
    if (res.status === 401) {
      // Invalid/expired token — keep zeros, optionally redirect to login
      console.warn("Unauthorized fetching recycling stats");
      renderUserData();
      return;
    }
    if (!res.ok) throw new Error("Failed to fetch stats: " + res.status);
    const data = await res.json();
    // Backend returns { pet_weight_kg, bottles_recycled, points }
    currentUser.petWeightKg = Number(data.pet_weight_kg ?? data.petWeightKg ?? 0);
    currentUser.bottlesRecycled = Number(data.bottles_recycled ?? data.bottlesRecycled ?? 0);
    currentUser.points = Number(data.points ?? 0);
  } catch (e) {
    console.error("fetchRecyclingStats error:", e);
    // On error, keep zeros (no error page)
    currentUser.petWeightKg = 0;
    currentUser.bottlesRecycled = 0;
    currentUser.points = 0;
  }
  renderUserData();
}

function renderUserData() {
  const firstName = currentUser.name.split(" ")[0] || currentUser.name;
  welcomeTitle.textContent = currentUser.name === "—" ? "Welcome" : `Welcome back, ${firstName}`;
  profileAvatar.textContent = currentUser.name === "—" ? "—" : getInitials(currentUser.name);
  profileName.textContent = currentUser.name;
  profileEmail.textContent = currentUser.email;
  profileEmail.href = currentUser.email && currentUser.email !== "—" ? `mailto:${currentUser.email}` : "mailto:";
  profileId.textContent = `Member ID: ${currentUser.memberId}`;
  if (statPet) statPet.textContent = formatKg(currentUser.petWeightKg);
  statBottles.textContent = formatNumber(currentUser.bottlesRecycled);
  statPoints.textContent = formatNumber(currentUser.points);
  if (statRupee) statRupee.textContent = `≈ ₹${formatNumber(rupeesFromPoints(currentUser.points))}`;
  contribMain.textContent = `${formatKg(currentUser.petWeightKg)} PET diverted from waste`;
  contribCount.textContent = formatKg(currentUser.petWeightKg);
  if (contribDetail) contribDetail.textContent = `Across ${formatNumber(currentUser.bottlesRecycled)} bottles.`;
  renderRewards();
}

function renderRewards() {
  redeemGrid.innerHTML = "";
  rewards.forEach(r => {
    const canAfford = currentUser.points >= r.cost;
    const card = document.createElement("article");
    card.className = "card redeem-card";
    card.innerHTML = `
      <div class="redeem-top">
        <h3>${r.title}</h3>
        <span class="redeem-cost">${formatNumber(r.cost)} Points</span>
      </div>
      <p class="redeem-desc">${r.desc}</p>
      <button class="btn ${canAfford ? "btn-white" : "btn-ghost"} redeem-btn" data-id="${r.id}" ${canAfford ? "" : "disabled"} aria-label="Redeem ${r.title} for ${r.cost} points">
        ${canAfford ? "Redeem" : `Need ${formatNumber(r.cost - currentUser.points)} more`}
      </button>
    `;
    redeemGrid.appendChild(card);
  });
  redeemGrid.querySelectorAll(".redeem-btn").forEach(btn => {
    btn.addEventListener("click", () => handleRedeem(btn.dataset.id));
  });
}

function handleRedeem(rewardId) {
  const reward = rewards.find(r => r.id === rewardId);
  if (!reward) return;
  if (currentUser.points < reward.cost) return;
  showModal(`"${reward.title}" redemption will be connected to your account shortly. (${formatNumber(reward.cost)} points required — you have ${formatNumber(currentUser.points)}.)`);
}

function showModal(msg) {
  modalMsg.textContent = msg;
  modal.hidden = false;
  document.body.style.overflow = "hidden";
  modalClose.focus();
}
function hideModal() {
  modal.hidden = true;
  document.body.style.overflow = "";
}

function handleLogout() {
  localStorage.removeItem("wastewise_token");
  localStorage.removeItem("wastewise_user");
  window.location.href = "login.html";
}

// ---- events ----
document.getElementById("logout-btn")?.addEventListener("click", handleLogout);
document.getElementById("logout-btn-mobile")?.addEventListener("click", handleLogout);
modalClose?.addEventListener("click", hideModal);
modalBackdrop?.addEventListener("click", hideModal);
document.addEventListener("keydown", e => { if (e.key === "Escape" && !modal.hidden) hideModal(); });

// Mobile menu
const toggle = document.querySelector(".nav-toggle");
const menu = document.getElementById("mobile-menu");
if (toggle && menu) {
  toggle.addEventListener("click", () => {
    const open = menu.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
    const spans = toggle.querySelectorAll("span");
    if (open) {
      spans[0].style.transform = "translateY(6px) rotate(45deg)";
      spans[1].style.opacity = "0";
      spans[2].style.transform = "translateY(-6px) rotate(-45deg)";
    } else {
      spans[0].style.transform = "";
      spans[1].style.opacity = "";
      spans[2].style.transform = "";
    }
  });
}

// init
loadUserData();
