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
  const phrases = [
    "Turning data into insights.",
    "Automating decisions with intelligence.",
    "Empowering smarter business strategies.",
  ];
  let index = 0;
  const textElement = document.getElementById("dynamic-text");

  if (textElement) {
    setInterval(() => {
      index = (index + 1) % phrases.length;
      textElement.textContent = phrases[index];
    }, 3500);
  }
});
