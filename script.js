// ============================================================
//  script.js  —  Firebase Firestore Realtime Edition (onSnapshot)
// ============================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, doc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { query, orderBy } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ─── 🔥 Firebase Config (แก้ตรงนี้) ────────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyBJCPSj8_ri7hac9tXsARk8Jetct4YhBPI",
  authDomain: "protfolio-northsnx.firebaseapp.com",
  projectId: "protfolio-northsnx",
  storageBucket: "protfolio-northsnx.firebasestorage.app",
  messagingSenderId: "490217881335",
  appId: "1:490217881335:web:585273d0961d3653921df2",
  measurementId: "G-Q9Q0GM1ND5"
};
// ────────────────────────────────────────────────────────────

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ─── Back to top button ──────────────────────────────────────
const backToTopBtn = document.getElementById('back-to-top');
window.addEventListener('scroll', () => {
  backToTopBtn?.classList.toggle('show', window.scrollY > 300);
});
backToTopBtn?.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ─── Main ────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {

  let currentLang = localStorage.getItem("lang") || "en";
  let dataJSON = {};

  // ── Language switcher hide/show on scroll ─────────────────
  const languageSwitcher = document.querySelector('.language-switcher');
  let lastScrollY = window.scrollY;
  window.addEventListener('scroll', () => {
    if (!languageSwitcher) return;
    if (window.scrollY > lastScrollY) {
      languageSwitcher.style.transform = 'translateY(-100px)';
      languageSwitcher.style.opacity = '0';
    } else {
      languageSwitcher.style.transform = 'translateY(0)';
      languageSwitcher.style.opacity = '1';
    }
    lastScrollY = window.scrollY;
  });

  // ── 🔥 Realtime listener จาก Firestore ───────────────────
  onSnapshot(doc(db, "portfolio", currentLang), (docSnap) => {
    if (docSnap.exists()) {
      const baseData = docSnap.data();
      loadSubcollections(baseData);
    }
  });

  async function loadSubcollections(baseData) {
    const [skillsSnap, educationSnap, experienceSnap, projectsSnap, certSnap, contactSnap] = await Promise.all([
      getDocs(query(
        collection(db, "portfolio", currentLang, "skills"),
        orderBy("id", "asc")
      )),

      getDocs(query(
        collection(db, "portfolio", currentLang, "education"),
        orderBy("id", "desc")
      )),

      getDocs(query(
        collection(db, "portfolio", currentLang, "company"),
        orderBy("id", "desc")
      )),

      getDocs(query(
        collection(db, "portfolio", currentLang, "projects"),
        orderBy("order", "desc")
      )),

      getDocs(query(
        collection(db, "portfolio", currentLang, "certificates"),
        orderBy("order", "desc")
      )),

      getDocs(collection(db, "portfolio", currentLang, "contacts"))
    ]);

    const data = {
      ...baseData,
      skill: skillsSnap.docs.map(doc => doc.data()),
      education: educationSnap.docs.map(doc => doc.data()),
      experience: experienceSnap.docs.map(doc => doc.data()),
      projects: projectsSnap.docs.map(doc => doc.data()),
      certificate: certSnap.docs.map(doc => doc.data()),
      contact: contactSnap.docs.map(doc => doc.data())
    };

    dataJSON[currentLang] = data;
    renderContent();

    document.getElementById("loading-screen")?.classList.add("hide");
  }

  // ── Render ────────────────────────────────────────────────
  function renderContent() {
    if (!dataJSON[currentLang]) return;
    const data = dataJSON[currentLang];

    document.getElementById("intro-quote").innerText = data.quote || "";
    document.getElementById("intro-quote2").innerText = data.quote2 || "";
    document.getElementById("hero-image").src = data.image;
    document.getElementById("hero-name").innerText = data.hero.name;
    document.getElementById("hero-edu").innerText = data.hero.edu;
    document.getElementById("about-text").innerText = data.hero.about || "";
    document.getElementById("about-text2").innerText = data.hero.about2 || "";

    // Skills
    const skillsContainer = document.getElementById("skills-list");
    skillsContainer.innerHTML = "";
    data.skill.forEach(skill => {
      const div = document.createElement("div");
      div.className = "skill";
      div.innerHTML = `<i class="${skill.icon}"></i> ${skill.name}`;
      skillsContainer.appendChild(div);
    });

    // Education
    const Educontainer = document.getElementById("education-list");
    Educontainer.innerHTML = '<div class="timeline-progress"></div>';

    data.education
    .filter(edu => edu.isEnabled === true)
    .forEach(edu => {
      const item = document.createElement("div");
      item.className = "timeline-item";

      item.innerHTML = `
        <span class="timeline-date">${edu.duration}</span>
        <div class="timeline-card">
          <div class="timeline-logo">
            <img src="${edu.img}" />
          </div>
          <div class="timeline-text">
            <h3>${edu.name}</h3>
            <p class="job">${edu.level}</p>
            <p class="desc">${edu.desc}</p>
          </div>
        </div>
      `;

      Educontainer.appendChild(item);
    });


    // Experience
    const Expcontainer = document.getElementById("experience-list");
    Expcontainer.innerHTML = '<div class="timeline-progress"></div>';

    data.experience.forEach(exp => {
      const item = document.createElement("div");
      item.className = "timeline-item";

      item.innerHTML = `
        <span class="timeline-date">${exp.duration}</span>
        <div class="timeline-card">
          <div class="timeline-logo">
            <img src="${exp.img}" />
          </div>
          <div class="timeline-text">
            <h3>${exp.name}</h3>
            <p class="job">${exp.job}</p>
            <p class="desc">${exp.desc}</p>
          </div>
        </div>
      `;

      Expcontainer.appendChild(item);
    });

    // Projects
    const projectsContainer = document.getElementById("projects-list");
    projectsContainer.innerHTML = "";

    if (!document.getElementById("project-modal")) {
      const m = document.createElement("div");
      m.id = "project-modal"; m.className = "modal";
      m.innerHTML = `
        <div class="modal-content">
          <span id="project-modal-close" class="modal-close" title="Close">&times;</span>
          <img id="project-modal-img" src="" alt="" class="modal-img"/>
          <h1 id="project-modal-title"></h1>
          <h2>// About Project</h2>
          <p id="project-modal-desc"></p>
          <h2>// Technology In Project</h2>
          <div id="project-modal-tags" class="modal-tags-container"></div>
          <h2>// Keyword</h2>
          <div id="project-modal-keyword" class="modal-key-grid"></div>
          <h2>// Reference</h2>
          <p>- Link Preview: <a id="project-modal-link" title="Click to Preview" target="_blank"></a></p>
        </div>`;
      document.body.appendChild(m);
    }

    const projectModal = document.getElementById("project-modal");
    const projectModalImg = document.getElementById("project-modal-img");
    const projectModalTitle = document.getElementById("project-modal-title");
    const projectModalTags = document.getElementById("project-modal-tags");
    const projectModalDesc = document.getElementById("project-modal-desc");
    const projectModalLink = document.getElementById("project-modal-link");
    const projectModalKeyword = document.getElementById("project-modal-keyword");

    const oldClose = document.getElementById("project-modal-close");
    const newClose = oldClose.cloneNode(true);
    oldClose.replaceWith(newClose);
    newClose.addEventListener("click", () => projectModal.classList.remove("show"));
    window.addEventListener("click", e => {
      if (e.target === projectModal) projectModal.classList.remove("show");
    });

    data.projects
      .filter(project => project.isEnabled === true)
      .forEach(project => {
        const card = document.createElement("div");
        card.className = "project-card";
        let tagsHTML = project.tags.length > 3
          ? project.tags.slice(0, 3).map(t => `<span class="tags">${t}</span>`).join('') +
          `<span class="tags more">+${project.tags.length - 3} more</span>`
          : project.tags.map(t => `<span class="tags">${t}</span>`).join('');
        card.innerHTML = `
        <img src="${project.img}" alt="${project.name}"/>
        <div class="project-card-container">
          <h3>${project.name}</h3>
          <p>${project.desc}</p>
          <div class="tags-container" style="padding-top:10px;">
            ${tagsHTML}
          </div>
        </div>`;
        card.addEventListener("click", () => {
          projectModalImg.src = project.img;  
          projectModalTitle.textContent = project.name;
          projectModalTags.innerHTML = project.tags.map(t => `<span class="modal-tags">${t}</span>`).join('');
          projectModalDesc.textContent = project["desc-full"] || project.desc || "";
          projectModalLink.textContent = project.link;
          projectModalLink.href = project.link;
          projectModalKeyword.innerHTML = Array.isArray(project.keyword)
            ? project.keyword.map(k => `<div class="modal-key-container"><h4>${k.title}</h4><p>${k.desc}</p></div>`).join('')
            : "";
          projectModal.classList.add("show");
        });
        projectsContainer.appendChild(card);
      });

    // Certificate
    const certificateContainer = document.getElementById("certificate-list");
    certificateContainer.innerHTML = "";

    if (!document.getElementById("certificate-modal")) {
      const m = document.createElement("div");
      m.id = "certificate-modal"; m.className = "modal";
      m.innerHTML = `
        <div class="modal-content">
          <span id="certificate-modal-close" class="modal-close" title="Close">&times;</span>
          <img id="certificate-modal-img" src="" alt="" class="modal-cer-img"/>
          <h1 id="certificate-modal-name"></h1>
          <p id="certificate-modal-company"></p>
          <p id="certificate-modal-id"></p>
          <p id="certificate-modal-issued"></p>
          <p id="certificate-modal-expires"></p>
        </div>`;
      document.body.appendChild(m);
    }

    const certificateModal = document.getElementById("certificate-modal");
    const certificateModalImg = document.getElementById("certificate-modal-img");
    const certificateModalName = document.getElementById("certificate-modal-name");
    const certificateModalCompany = document.getElementById("certificate-modal-company");
    const certificateModalIssued = document.getElementById("certificate-modal-issued");
    const certificateModalExpires = document.getElementById("certificate-modal-expires");
    const certificateModalID = document.getElementById("certificate-modal-id");

    const oldCertClose = document.getElementById("certificate-modal-close");
    const newCertClose = oldCertClose.cloneNode(true);
    oldCertClose.replaceWith(newCertClose);
    newCertClose.addEventListener("click", () => certificateModal.classList.remove("show"));
    window.addEventListener("click", e => {
      if (e.target === certificateModal) certificateModal.classList.remove("show");
    });

    data.certificate.forEach(cert => {
      const card = document.createElement("div");
      card.className = "certificate-card";
      card.innerHTML = `
        <img src="${cert.img}" alt="${cert.name}"/>
        <div class="certificate-card-container">
          <h3>${cert.name}</h3>
          <h4>${cert.company}</h4>
          <p>Issued on: ${cert.issued}</p>
          <p>Expires on: ${cert.expires}</p>
        </div>`;
      card.addEventListener("click", () => {
        certificateModalImg.src = cert.img;
        certificateModalName.textContent = cert.name;
        certificateModalCompany.textContent = "Company / Organization: " + cert.company;
        certificateModalIssued.textContent = "Issued on: " + cert.issued;
        certificateModalExpires.textContent = "Expires on: " + cert.expires;
        certificateModalID.textContent = "Certificate ID / Reference Number: " + cert.cerID;
        certificateModal.classList.add("show");
      });
      certificateContainer.appendChild(card);
    });

    // Contact
    const contactContainer = document.getElementById("contact-list");
    contactContainer.innerHTML = "";
    data.contact.forEach(contact => {
      const card = document.createElement("div");
      card.className = "contact-card";
      card.innerHTML = `
        <i class="${contact.icon}"></i>
        <h3>${contact.name}</h3>
        <p>${contact.desc}</p>
        <a class="contact-btn" href="${contact.link}" target="_blank">
          <i class="fas fa-external-link-alt" style="font-size:16px;"></i> ${contact.btn}
        </a>`;
      contactContainer.appendChild(card);
    });

    setupScrollAnimations();
  } // end renderContent

  // ── GSAP ScrollTrigger animations ──────────────────────────
  let scrollCtx = null;

  function setupScrollAnimations() {
    if (!window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);

    // Re-render replaces the DOM (language switch / live Firestore updates),
    // so tear down the previous batch of triggers before rebuilding them.
    if (scrollCtx) scrollCtx.revert();

    scrollCtx = gsap.context(() => {
      // Hero: chained intro sequence, plays once on load (not scroll-bound)
      gsap.timeline({ defaults: { ease: "power3.out", duration: 0.7 } })
        .from(".eyebrow", { opacity: 0, y: 16 })
        .from("#hero-name", { opacity: 0, y: 24 }, "-=0.45")
        .from(".hero-edu", { opacity: 0, y: 16 }, "-=0.45")
        .from(".hero-about", { opacity: 0, y: 16, stagger: 0.12 }, "-=0.35")
        .from(".hero-cta .btn", { opacity: 0, y: 12, stagger: 0.1 }, "-=0.3")
        .from(".hero-media-frame", { opacity: 0, scale: 0.94 }, "-=0.6");

      // Subtle parallax drift on the hero portrait
      gsap.to(".hero-media-frame", {
        y: 30,
        ease: "none",
        scrollTrigger: { trigger: ".hero-section", start: "top top", end: "bottom top", scrub: true }
      });

      // Every other section fades/slides in as it enters the viewport
      gsap.utils.toArray(".section:not(.hero-section)").forEach(section => {
        gsap.from(section, {
          opacity: 0,
          y: 32,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: { trigger: section, start: "top 82%" }
        });
      });

      // Cards / list items play in one after another (staggered) per section
      const staggerIn = (containerSelector, itemSelector) => {
        const container = document.querySelector(containerSelector);
        if (!container) return;
        const items = container.querySelectorAll(itemSelector);
        if (!items.length) return;
        gsap.from(items, {
          opacity: 0,
          y: 24,
          duration: 0.55,
          ease: "power2.out",
          stagger: 0.08,
          scrollTrigger: { trigger: container, start: "top 85%" }
        });
      };

      staggerIn(".skills-grid", ".skill");
      staggerIn("#experience-list", ".timeline-item");
      staggerIn("#education-list", ".timeline-item");
      staggerIn(".projects-grid", ".project-card");
      staggerIn(".certificate-grid", ".certificate-card");
      staggerIn(".contact-grid", ".contact-card");

      // Timeline "progress line" draws itself in sync with scroll
      document.querySelectorAll(".timeline").forEach(tl => {
        const line = tl.querySelector(".timeline-progress");
        if (!line) return;
        gsap.to(line, {
          scaleY: 1,
          ease: "none",
          scrollTrigger: { trigger: tl, start: "top 75%", end: "bottom 65%", scrub: 0.6 }
        });
      });
    });

    ScrollTrigger.refresh();
  }

  // Language switcher
  document.querySelectorAll(".lang-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      currentLang = btn.dataset.lang;
      localStorage.setItem("lang", currentLang);
      renderContent();
      document.querySelectorAll(".lang-btn").forEach(b => {
        b.classList.toggle("active", b.dataset.lang === currentLang);
      });
    });
  });

  // Scrollspy
  // const navLinks = document.querySelectorAll('nav a');
  // window.addEventListener('scroll', () => {
  //   let current = '';
  //   document.querySelectorAll('section').forEach(section => {
  //     if (pageYOffset >= section.offsetTop - section.clientHeight / 3) {
  //       current = section.getAttribute('id');
  //     }
  //   });
  //   navLinks.forEach(a => {
  //     a.classList.remove('active');
  //     if (a.getAttribute('href') === `#${current}`) a.classList.add('active');
  //   });
  // });
  const navLinks = document.querySelectorAll('nav a');

  window.addEventListener('scroll', () => {
    let current = '';

    document.querySelectorAll('section').forEach(section => {
      const rect = section.getBoundingClientRect();

      if (rect.top <= 150 && rect.bottom >= 150) {
        current = section.id;
      }
    });

    navLinks.forEach(a => {
      a.classList.remove('active');
      if (a.getAttribute('href') === `#${current}`) {
        a.classList.add('active');
      }
    });
  });

}); // end DOMContentLoaded