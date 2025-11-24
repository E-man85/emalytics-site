// Run after DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  /* =========================
     Mobile nav (accessible)
  ========================== */
  const menuToggle = document.getElementById("menu-toggle");
  const navLinks = document.getElementById("nav-links");

  if (menuToggle && navLinks) {
    const closeMenu = () => {
      navLinks.classList.remove("show");
      document.body.classList.remove("no-scroll");
      menuToggle.setAttribute("aria-expanded", "false");
    };

    const openMenu = () => {
      navLinks.classList.add("show");
      document.body.classList.add("no-scroll");
      menuToggle.setAttribute("aria-expanded", "true");
    };

    // Init ARIA
    menuToggle.setAttribute("aria-controls", "nav-links");
    menuToggle.setAttribute("aria-expanded", "false");

    menuToggle.addEventListener(
      "click",
      () => {
        const isOpen = navLinks.classList.contains("show");
        isOpen ? closeMenu() : openMenu();
      },
      { passive: true }
    );

    // Close when a link is clicked (better UX on mobile)
    navLinks.addEventListener("click", (e) => {
      if (e.target.matches("a")) closeMenu();
    });

    // Close on Escape
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeMenu();
    });

    // Close when clicking outside
    document.addEventListener("click", (e) => {
      const clickInside =
        navLinks.contains(e.target) || menuToggle.contains(e.target);
      if (!clickInside && navLinks.classList.contains("show")) closeMenu();
    });
  }

  /* =========================
     Fade-in on scroll (perf)
  ========================== */
  const elements = document.querySelectorAll(".fade-in");

  // Respect users who prefer reduced motion
  const prefersReduced = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  if (prefersReduced) {
    elements.forEach((el) => el.classList.add("visible"));
  } else if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target); // observe once
          }
        });
      },
      {
        root: null,
        rootMargin: "0px 0px -10% 0px", // start a touch earlier
        threshold: 0.15,
      }
    );
    elements.forEach((el) => io.observe(el));
  } else {
    // Fallback
    elements.forEach((el) => el.classList.add("visible"));
  }

  /* =========================
     Rotating header text (safe)
  ========================== */
  const phrases = window.rotatingPhrases || [];

  let index = 0;
  const textElement = document.getElementById("dynamic-text");

  if (textElement) {
    setInterval(() => {
      index = (index + 1) % phrases.length;
      textElement.textContent = phrases[index];
    }, 3500);
  }
});

// ==============================
// Online Users + Chart Section
// ==============================
const API_URL = "https://api.emalytics.pt";  
let sessionId = null;

// --- Create new session ---
async function createSession() {
  try {
    const res = await fetch(`${API_URL}/session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({})
    });
    const data = await res.json();
    sessionId = data.sessionId;
  } catch (err) {
    console.error("Error creating session:", err);
  }
}

// --- Deactivate session ---
async function deactivateSession() {
  if (!sessionId) return;
  try {
    await fetch(`${API_URL}/session/inactive`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId })
    });
  } catch (err) {
    console.error("Error deactivating session:", err);
  }
}

// --- Update online counter ---
let stealthCount = null;

async function updateOnlineCount() {
  try {
    const res = await fetch(`${API_URL}/online-count`);
    const data = await res.json();

    let realCount = data.online;

    // If real >= 3, display the real number and exit stealth mode
    if (realCount >= 3) {
      stealthCount = null; // reset
      document.getElementById("online-count").textContent = realCount;
      return;
    }

    // --- Modo STEALTH ---
    if (stealthCount === null) {
      // start stealth between 3 and 5
      stealthCount = Math.floor(Math.random() * 3) + 3;
    } else {
      // Smooth natural oscillation: -1, 0, or +1
      const variation = Math.floor(Math.random() * 3) - 1;
      stealthCount += variation;

      // Keep between 3 and 6
      if (stealthCount < 3) stealthCount = 3;
      if (stealthCount > 6) stealthCount = 6;
    }

    // If there are real users, we naturally add them up.
    stealthCount += realCount;

    document.getElementById("online-count").textContent = stealthCount;

  } catch (err) {
    console.error("Error getting online count:", err);
  }
}


// --- Load hourly data and compute percentage ---
async function loadVisitsData() {
  try {
    const res = await fetch(`${API_URL}/visits`);
    const visits = await res.json();

    // Count visits per hour
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const counts = hours.map(h => visits.filter(v => new Date(v.startTime).getHours() === h).length);

    // Convert to percentage of total
    const total = counts.reduce((sum, n) => sum + n, 0);
    const percentages = total > 0 ? counts.map(n => (n / total * 100).toFixed(2)) : Array(24).fill(0);

    // Highlight current hour
    const currentHour = new Date().getHours();
    const colors = hours.map(h => (h === currentHour ? "#3B82F6" : "#1E3A8A"));

    updateChart(hours, percentages, colors);
  } catch (err) {
    console.error("Error loading visit data:", err);
  }
}

// --- Initialize Chart.js ---
const ctx = document.getElementById("visitorsChart").getContext("2d");
const visitorsChart = new Chart(ctx, {
  type: "bar",
  data: {
    labels: Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`),
    datasets: [{
      label: "% of total visits",
      data: Array(24).fill(0),
      backgroundColor: Array(24).fill("#1E3A8A"),
      borderWidth: 1,
      borderRadius: 4
    }]
  },
  options: {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: "Hourly traffic distribution (%)",
        color: "#333333",
        font: { size: 16, weight: "bold" }
      },
      tooltip: {
        callbacks: {
          label: ctx => `${ctx.formattedValue}% of total visits`
        }
      },
      datalabels: {
        color: "#3B82F6",
        anchor: "end",
        align: "end",
        font: {
          weight: "bold",
          size: 12
        },
        formatter: (value, context) => {
          const hour = context.dataIndex;
          const currentHour = new Date().getHours();
          return hour === currentHour ? "Now" : "";
        }
      }
    },
    scales: {
      x: {
        ticks: { color: "#333333" },
        grid: { display: false }
      },
      y: {
        ticks: { color: "#333333", callback: v => `${v}%` },
        beginAtZero: true,
        max: 100
      }
    }
  },
  plugins: [ChartDataLabels]
});

// --- Update chart ---
function updateChart(hours, percentages, colors) {
  visitorsChart.data.datasets[0].data = percentages;
  visitorsChart.data.datasets[0].backgroundColor = colors;
  visitorsChart.update();
}

// --- Init + refresh ---
createSession();
updateOnlineCount();
loadVisitsData();
setInterval(() => {
  updateOnlineCount();
  loadVisitsData();
}, 60000);
window.addEventListener("beforeunload", deactivateSession);

// --- Heartbeat to keep session active ---
async function heartbeat() {
  if (!sessionId) return;
  try {
    await fetch(`${API_URL}/session/heartbeat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId })
    });
  } catch (err) {
    console.error("Error sending heartbeat:", err);
  }
}

setInterval(heartbeat, 30000); // 30 seconds


/* =========================
   Footer Year Auto-Update
========================= */
document.addEventListener("DOMContentLoaded", function () {
    const yearSpan = document.getElementById("current-year");
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
});

/* =========================
   success message
========================= */
document.addEventListener("DOMContentLoaded", function () {
    if (window.location.hash === "#sucesso") {
        document.getElementById("form-success").style.display = "block";
    }
});
document.addEventListener("DOMContentLoaded", function () {
    if (window.location.hash === "#success") {
        const box = document.getElementById("form-success");
        if (box) box.style.display = "block";
    }
});
