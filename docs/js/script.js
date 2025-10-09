const menuToggle = document.getElementById("menu-toggle");
const navLinks = document.getElementById("nav-links");

menuToggle.addEventListener("click", () => {
  navLinks.classList.toggle("show");
});

// === Fade-in animation on scroll ===
document.addEventListener("DOMContentLoaded", () => {
  const elements = document.querySelectorAll(".fade-in");

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        }
      });
    },
    { threshold: 0.2 }
  );

  elements.forEach(el => observer.observe(el));
});
// === Header ===
const phrases = [
  "Turning data into insights.",
  "Automating decisions with intelligence.",
  "Empowering smarter business strategies."
];

let index = 0;
const textElement = document.getElementById("dynamic-text");

setInterval(() => {
  index = (index + 1) % phrases.length;
  textElement.textContent = phrases[index];
}, 3500);

