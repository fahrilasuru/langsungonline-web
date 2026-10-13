// ===== HEADER SCROLL =====
/** @type {HTMLElement | null} */
const header = document.getElementById("header");
let lastScroll = 0;

if (header) {
    window.addEventListener(
        "scroll",
        () => {
            const currentScroll = window.pageYOffset;
            if (currentScroll > 20) {
                header.classList.add("scrolled");
            } else {
                header.classList.remove("scrolled");
            }
            lastScroll = currentScroll;
        },
        { passive: true },
    );
}

// ===== MOBILE MENU =====
/** @type {HTMLButtonElement | null} */
const mobileMenuBtn = document.getElementById("mobileMenuBtn");
/** @type {HTMLElement | null} */
const mobileNav = document.getElementById("mobileNav");
let menuOpen = false;

if (mobileMenuBtn && mobileNav) {
    mobileMenuBtn.addEventListener("click", () => {
        menuOpen = !menuOpen;
        mobileMenuBtn.classList.toggle("active", menuOpen);
        mobileNav.classList.toggle("open", menuOpen);
        mobileMenuBtn.setAttribute("aria-expanded", String(menuOpen));
        document.body.style.overflow = menuOpen ? "hidden" : "";
    });

    mobileNav.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
            menuOpen = false;
            mobileMenuBtn.classList.remove("active");
            mobileNav.classList.remove("open");
            mobileMenuBtn.setAttribute("aria-expanded", "false");
            document.body.style.overflow = "";
        });
    });
}

// ===== REVEAL ANIMATION =====
const revealObserver = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                revealObserver.unobserve(entry.target);
            }
        });
    },
    {
        threshold: 0.1,
        rootMargin: "0px 0px -40px 0px",
    },
);

document.querySelectorAll(".reveal").forEach((el) => {
    revealObserver.observe(el);
});

// ===== PORTFOLIO FILTER =====
/** @type {NodeListOf<HTMLButtonElement>} */
const filterBtns = document.querySelectorAll(".filter-btn");
/** @type {NodeListOf<HTMLElement>} */
const portfolioCards = document.querySelectorAll(".portfolio-card");

filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
        filterBtns.forEach((b) => {
            b.classList.remove("active");
            b.setAttribute("aria-selected", "false");
        });
        btn.classList.add("active");
        btn.setAttribute("aria-selected", "true");

        const filter = btn.dataset.filter;

        portfolioCards.forEach((card) => {
            if (filter === "all" || card.dataset.category === filter) {
                card.classList.remove("hidden");
                card.style.animation = "none";
                void card.offsetHeight; // Trigger reflow
                card.style.animation = "fadeInUp 0.4s ease-out forwards";
            } else {
                card.classList.add("hidden");
            }
        });
    });
});

// Add fadeInUp animation
const style = document.createElement("style");
style.textContent = `
    @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(16px); }
        to { opacity: 1; transform: translateY(0); }
    }
`;
document.head.appendChild(style);

// ===== PORTFOLIO MODAL =====
/**
 * @typedef {Object} Project
 * @property {string} title
 * @property {string} location
 * @property {string} type
 * @property {string} img
 * @property {string} need
 * @property {string} solution
 * @property {string} scope
 */

/** @type {Record<string, Project>} */
const projectData = {
    p1: {
        title: "Modern Warm House — Surabaya Barat",
        location: "Surabaya Barat",
        type: "Renovasi interior rumah • 145 m²",
        img: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800&q=80&auto=format&fit=crop",
        need: "Klien ingin rumah terasa lebih hangat dan tidak kaku. Ruang keluarga dan dapur terasa terpisah dan kurang terhubung.",
        solution:
            "Kami buka sebagian dinding penghubung, gunakan material kayu natural, dan pilih pencahayaan hangat untuk menciptakan suasana yang lebih menyatu.",
        scope: "Pembongkaran dinding partisi, perbaikan lantai, pengecatan ulang, custom furniture untuk ruang keluarga, dan penataan pencahayaan.",
    },
    p2: {
        title: "Compact Kitchen — Sidoarjo",
        location: "Sidoarjo",
        type: "Kitchen set • 12 m²",
        img: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80&auto=format&fit=crop",
        need: "Dapur kecil dengan layout yang tidak efisien. Penyimpanan kurang dan alur kerja sempit.",
        solution:
            "Kami desain ulang layout dengan sistem penyimpanan vertikal, gunakan warna terang, dan optimalkan setiap sudut ruang.",
        scope: "Pembuatan kitchen set custom, instalasi countertop granit, dan penambahan rak gantung.",
    },
    p3: {
        title: "Minimalist Home Office — Citraland",
        location: "Citraland, Surabaya",
        type: "Interior workspace • 18 m²",
        img: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80&auto=format&fit=crop",
        need: "Klien butuh ruang kerja yang tenang dan tidak mengganggu aktivitas rumah tangga.",
        solution:
            "Kami buat partisi akustik, pilih furniture minimalis, dan atur pencahayaan yang nyaman untuk bekerja.",
        scope: "Pembuatan meja kerja custom, partisi ruangan, rak buku built-in, dan penataan kabel.",
    },
    p4: {
        title: "Family Living Room — Pakuwon",
        location: "Pakuwon, Surabaya",
        type: "Interior & custom furniture • 42 m²",
        img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80&auto=format&fit=crop",
        need: "Ruang keluarga yang luas tapi terasa kosong dan tidak nyaman untuk berkumpul.",
        solution:
            "Kami bagi ruang menjadi zona duduk, baca, dan penyimpanan tanpa membuatnya terasa penuh.",
        scope: "Custom sofa, rak TV built-in, kabinet penyimpanan, dan penataan karpet serta pencahayaan.",
    },
    p5: {
        title: "Coffee Shop Interior — Surabaya",
        location: "Surabaya",
        type: "Commercial interior • 80 m²",
        img: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&q=80&auto=format&fit=crop",
        need: "Pemilik ingin coffee shop dengan suasana hangat yang mengundang pelanggan untuk berlama-lama.",
        solution:
            "Konsep industrial dengan sentuhan kayu hangat, pencahayaan ambient, dan area duduk yang variatif.",
        scope: "Desain interior, counter bar, area duduk, pencahayaan, dan dekorasi.",
    },
    p6: {
        title: "Built-in Wardrobe — Gresik",
        location: "Gresik",
        type: "Custom furniture",
        img: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=800&q=80&auto=format&fit=crop",
        need: "Klien butuh lemari yang pas dengan ukuran ruang dan cukup untuk menyimpan banyak pakaian.",
        solution:
            "Kami desain built-in wardrobe dengan kombinasi pintu geser, laci, dan rak gantung sesuai kebutuhan.",
        scope: "Pembuatan lemari built-in dari material plywood finishing HPL, dengan pencahayaan LED internal.",
    },
};

/** @type {HTMLElement | null} */
const modalOverlay = document.getElementById("portfolioModal");
/** @type {HTMLImageElement | null} */
const modalImg = document.getElementById("modalImg");
/** @type {HTMLElement | null} */
const modalTitle = document.getElementById("modalTitle");
/** @type {HTMLElement | null} */
const modalLocation = document.getElementById("modalLocation");
/** @type {HTMLElement | null} */
const modalType = document.getElementById("modalType");
/** @type {HTMLElement | null} */
const modalNeed = document.getElementById("modalNeed");
/** @type {HTMLElement | null} */
const modalSolution = document.getElementById("modalSolution");
/** @type {HTMLElement | null} */
const modalScope = document.getElementById("modalScope");
/** @type {HTMLElement | null} */
const modalClose = document.getElementById("modalClose");

if (modalOverlay) {
    portfolioCards.forEach((card) => {
        card.addEventListener("click", () => {
            const id = card.dataset.project;
            if (!id || !projectData[id]) return;
            const data = projectData[id];

            if (modalImg) {
                modalImg.src = data.img;
                modalImg.alt = data.title;
            }
            if (modalTitle) modalTitle.textContent = data.title;
            if (modalLocation) modalLocation.textContent = data.location;
            if (modalType) modalType.textContent = data.type;
            if (modalNeed) modalNeed.textContent = data.need;
            if (modalSolution) modalSolution.textContent = data.solution;
            if (modalScope) modalScope.textContent = data.scope;

            modalOverlay.classList.add("open");
            document.body.style.overflow = "hidden";
        });
    });

    const closeModal = () => {
        modalOverlay.classList.remove("open");
        document.body.style.overflow = "";
    };

    if (modalClose) {
        modalClose.addEventListener("click", closeModal);
    }

    modalOverlay.addEventListener("click", (e) => {
        if (e.target === modalOverlay) closeModal();
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && modalOverlay.classList.contains("open")) {
            closeModal();
        }
    });
}

// ===== BEFORE AFTER SLIDER =====
document.querySelectorAll("[data-ba]").forEach((slider) => {
    /** @type {HTMLElement | null} */
    const afterImg = slider.querySelector(".ba-after");
    /** @type {HTMLElement | null} */
    const handle = slider.querySelector(".ba-handle");
    let isDragging = false;

    /** @param {number} x */
    function updateSlider(x) {
        if (!afterImg || !handle) return;
        const rect = slider.getBoundingClientRect();
        let pos = (x - rect.left) / rect.width;
        pos = Math.max(0, Math.min(1, pos));
        const percent = pos * 100;
        afterImg.style.clipPath = `inset(0 ${100 - percent}% 0 0)`;
        handle.style.left = percent + "%";
    }

    slider.addEventListener("mousedown", (/** @type {MouseEvent} */ e) => {
        isDragging = true;
        updateSlider(e.clientX);
    });

    window.addEventListener("mousemove", (/** @type {MouseEvent} */ e) => {
        if (!isDragging) return;
        updateSlider(e.clientX);
    });

    window.addEventListener("mouseup", () => {
        isDragging = false;
    });

    slider.addEventListener(
        "touchstart",
        (/** @type {TouchEvent} */ e) => {
            isDragging = true;
            updateSlider(e.touches[0].clientX);
        },
        { passive: true },
    );

    window.addEventListener(
        "touchmove",
        (/** @type {TouchEvent} */ e) => {
            if (!isDragging) return;
            updateSlider(e.touches[0].clientX);
        },
        { passive: true },
    );

    window.addEventListener("touchend", () => {
        isDragging = false;
    });
});

// ===== FAQ ACCORDION =====
document.querySelectorAll(".faq-item").forEach((item) => {
    /** @type {HTMLElement | null} */
    const question = item.querySelector(".faq-question");
    /** @type {HTMLElement | null} */
    const answer = item.querySelector(".faq-answer");

    if (question && answer) {
        question.addEventListener("click", () => {
            const isOpen = item.classList.contains("open");

            // Close all
            document.querySelectorAll(".faq-item").forEach((i) => {
                i.classList.remove("open");
                /** @type {HTMLElement | null} */
                const ans = i.querySelector(".faq-answer");
                /** @type {HTMLElement | null} */
                const qst = i.querySelector(".faq-question");
                if (ans) ans.style.maxHeight = "";
                if (qst) qst.setAttribute("aria-expanded", "false");
            });

            // Open current if it was closed
            if (!isOpen) {
                item.classList.add("open");
                answer.style.maxHeight = answer.scrollHeight + "px";
                question.setAttribute("aria-expanded", "true");
            }
        });
    }
});

// ===== SMOOTH SCROLL FOR NAV =====
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
        /** @type {HTMLAnchorElement} */
        const linkAnchor = /** @type {HTMLAnchorElement} */ (this);
        const href = linkAnchor.getAttribute("href");
        if (!href || href === "#") return;
        const target = document.querySelector(href);
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    });
});

// ===== LAZY LOAD IMAGES =====
if (!("loading" in HTMLImageElement.prototype)) {
    /** @type {NodeListOf<HTMLImageElement>} */
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                /** @type {HTMLImageElement} */
                const img = /** @type {HTMLImageElement} */ (entry.target);
                img.src = img.dataset.src || img.src;
                imageObserver.unobserve(img);
            }
        });
    });
    lazyImages.forEach((img) => imageObserver.observe(img));
}

console.log("RuangRapi Interior demo website loaded successfully.");
console.log("Demo oleh Langsung.Online — https://langsung.online");
