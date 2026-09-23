/* =========================================================
   LumarisSMP — script.js
   Edit the CONFIG block below to update the server address
   or social links. Every button on the site reads from here.
   ========================================================= */

const CONFIG = {
    serverIP: "play.lumarismc.xyz",
    discord: "https://discord.gg/lumaris",
    youtube: "https://www.youtube.com/@lumarismc",
    tiktok: "https://www.tiktok.com/@lumarissmp"
};

(function applyConfig() {
    document.querySelectorAll("[data-discord-link]").forEach(el => el.href = CONFIG.discord);
    document.querySelectorAll("[data-youtube-link]").forEach(el => el.href = CONFIG.youtube);
    document.querySelectorAll("[data-tiktok-link]").forEach(el => el.href = CONFIG.tiktok);

    document.querySelectorAll("#serverIP, .ip-box__value").forEach(el => {
        el.textContent = CONFIG.serverIP;
    });
})();

/* ---------------------------------------------------------
   Navbar: scrolled state + mobile menu
   --------------------------------------------------------- */
const navbar = document.getElementById("navbar");
const navToggle = document.getElementById("navToggle");
const mobileMenu = document.getElementById("mobileMenu");

function onScroll() {
    if (window.scrollY > 24) {
        navbar.classList.add("navbar--scrolled");
    } else {
        navbar.classList.remove("navbar--scrolled");
    }
}
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

function closeMobileMenu() {
    mobileMenu.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Open menu");
}

navToggle.addEventListener("click", () => {
    const isOpen = mobileMenu.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
    navToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
});

mobileMenu.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", closeMobileMenu);
});

/* ---------------------------------------------------------
   Copy IP buttons (hero + how-to-join + final CTA)
   --------------------------------------------------------- */
const copyToast = document.getElementById("copyToast");
let toastTimer;

function showToast() {
    copyToast.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => copyToast.classList.remove("is-visible"), 2200);
}

function flashButton(btn, textEl) {
    const original = textEl.textContent;
    textEl.textContent = "Copied!";
    btn.classList.add("is-copied");
    setTimeout(() => {
        textEl.textContent = original;
        btn.classList.remove("is-copied");
    }, 1800);
}

async function copyServerIP(btn, textEl) {
    try {
        await navigator.clipboard.writeText(CONFIG.serverIP);
    } catch (err) {
        // Fallback for browsers without Clipboard API support
        const temp = document.createElement("textarea");
        temp.value = CONFIG.serverIP;
        temp.style.position = "fixed";
        temp.style.opacity = "0";
        document.body.appendChild(temp);
        temp.select();
        document.execCommand("copy");
        document.body.removeChild(temp);
    }
    flashButton(btn, textEl);
    showToast();
}

const heroCopyBtn = document.getElementById("copyBtn");
if (heroCopyBtn) {
    const heroCopyText = document.getElementById("copyBtnText");
    heroCopyBtn.addEventListener("click", () => copyServerIP(heroCopyBtn, heroCopyText));
}

document.querySelectorAll("[data-copy-btn]").forEach(btn => {
    const textEl = btn.querySelector("[data-copy-text]");
    btn.addEventListener("click", () => copyServerIP(btn, textEl));
});

/* ---------------------------------------------------------
   Reveal-on-scroll for section content
   --------------------------------------------------------- */
const revealTargets = document.querySelectorAll(
    ".section-head, .explore__inner, .feature-card, .world__grid, .gallery__grid, .community__inner, .steps, .final-cta__inner"
);
revealTargets.forEach(el => el.setAttribute("data-reveal", ""));

const revealObserver = new IntersectionObserver(
    entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                revealObserver.unobserve(entry.target);
            }
        });
    },
    { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
);
revealTargets.forEach(el => revealObserver.observe(el));

/* ---------------------------------------------------------
   Hero starfield: twinkling stars + slow drifting particles
   --------------------------------------------------------- */
(function starfield() {
    const canvas = document.getElementById("starCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let stars = [];
    let particles = [];
    let width, height, dpr;

    function resize() {
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        width = canvas.clientWidth;
        height = canvas.clientHeight;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        seed();
    }

    function seed() {
        const starCount = Math.round((width * height) / 9000);
        stars = Array.from({ length: starCount }, () => ({
            x: Math.random() * width,
            y: Math.random() * height * 0.75,
            r: Math.random() * 1.3 + 0.3,
            baseAlpha: Math.random() * 0.5 + 0.4,
            speed: Math.random() * 0.02 + 0.01,
            phase: Math.random() * Math.PI * 2
        }));

        particles = Array.from({ length: 22 }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            r: Math.random() * 1.6 + 0.6,
            vy: -(Math.random() * 0.12 + 0.03),
            vx: (Math.random() - 0.5) * 0.05,
            alpha: Math.random() * 0.35 + 0.15
        }));
    }

    let t = 0;
    function draw() {
        ctx.clearRect(0, 0, width, height);

        stars.forEach(s => {
            const twinkle = prefersReducedMotion ? 0 : Math.sin(t * s.speed + s.phase) * 0.35;
            ctx.globalAlpha = Math.max(0, Math.min(1, s.baseAlpha + twinkle));
            ctx.fillStyle = "#f4f0ff";
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fill();
        });

        if (!prefersReducedMotion) {
            particles.forEach(p => {
                ctx.globalAlpha = p.alpha;
                ctx.fillStyle = "#c9a6ff";
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fill();

                p.x += p.vx;
                p.y += p.vy;
                if (p.y < -10) {
                    p.y = height + 10;
                    p.x = Math.random() * width;
                }
            });
        }

        ctx.globalAlpha = 1;
        t += 1;
        requestAnimationFrame(draw);
    }

    window.addEventListener("resize", resize, { passive: true });
    resize();
    draw();
})();
