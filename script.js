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

// ─── Scroll animation ────────────────────────────────────────
const sections = document.querySelectorAll('.scroll-section');
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('active');
  });
}, { threshold: 0.2 });
sections.forEach(section => observer.observe(section));

// ─── Sticky header ───────────────────────────────────────────
const header = document.querySelector("header");
window.addEventListener("scroll", () => {
  header?.classList.toggle("sticky", window.scrollY > 1000);
});

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

  // ── Modal open/close with background scroll lock ──────────
  function openModal(modal) {
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    document.body.style.paddingRight = scrollbarWidth > 0 ? `${scrollbarWidth}px` : "";
    modal.classList.add("show");
  }

  function closeModal(modal) {
    modal.classList.remove("show");
    document.body.style.overflow = "";
    document.body.style.paddingRight = "";
  }

  // ── Image lightbox (zoom) ──────────────────────────────────
  const lightbox = document.createElement("div");
  lightbox.id = "image-lightbox";
  lightbox.className = "img-lightbox";
  lightbox.innerHTML = `
    <span id="lightbox-close" class="modal-close" title="Close">&times;</span>
    <img id="lightbox-img" src="" alt=""/>
  `;
  document.body.appendChild(lightbox);
  const lightboxImg = document.getElementById("lightbox-img");

  function openLightbox(src) {
    lightboxImg.src = src;
    lightbox.classList.add("show");
  }

  function closeLightbox() {
    lightbox.classList.remove("show");
  }

  document.getElementById("lightbox-close").addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", e => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener("keydown", e => {
    if (e.key !== "Escape") return;
    if (lightbox.classList.contains("show")) {
      closeLightbox();
      return;
    }
    document.querySelectorAll(".modal.show").forEach(m => closeModal(m));
  });

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
    Educontainer.innerHTML = "";

    data.education
    .filter(edu => edu.isEnabled === true)
    .forEach((edu, index) => {
      const side = index % 2 === 0 ? "left" : "right";

      const card = document.createElement("div");
      card.className = `timeline-item ${side}`;

      card.innerHTML = `
        <div class="timeline-content ${side}">

          ${side === "left" ? `
            <div class="text-box">
              <h3>${edu.name}</h3>
              <p class="job">${edu.level}</p>
              <p class="desc" style="padding: 0; margin: 0;">${edu.desc}</p>
              <span>${edu.duration}</span>              
            </div>
            <div class="logo-box" >
              <img src="${edu.img}" />
            </div>
          ` : `
            <div class="logo-box" >
              <img src="${edu.img}" />
            </div>
            <div class="text-box">
              <h3>${edu.name}</h3>
              <p class="job">${edu.level}</p>
              <p class="desc" style="padding: 0; margin: 0;">${edu.desc}</p>
              <span>${edu.duration}</span>
            </div>
          `}
        </div>
      `;

      Educontainer.appendChild(card);
    });


    // Experience
    const Expcontainer = document.getElementById("experience-list");
    Expcontainer.innerHTML = "";

    data.experience.forEach((exp, index) => {
      const side = index % 2 === 0 ? "left" : "right";

      const card = document.createElement("div");
      card.className = `timeline-item ${side}`;

      card.innerHTML = `
        <div class="timeline-content ${side}">

          ${side === "left" ? `
            <div class="text-box">
              <h3>${exp.name}</h3>
              <p class="job">${exp.job}</p>
              <span>${exp.duration}</span>              
              <p class="desc">${exp.desc}</p>
            </div>
            <div class="logo-box">
              <img src="${exp.img}" />
            </div>
          ` : `
            <div class="logo-box">
              <img src="${exp.img}" />
            </div>
            <div class="text-box">
              <h3>${exp.name}</h3>
              <p class="job">${exp.job}</p>
              <span>${exp.duration}</span>
              <p class="desc">${exp.desc}</p>
            </div>
          `}
        </div>
      `;

      Expcontainer.appendChild(card);
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
          <div class="modal-media">
            <div id="project-modal-bg" class="modal-media-bg"></div>
            <img id="project-modal-img" src="" alt="" class="modal-img"/>
            <span class="modal-zoom-hint"><i class="fas fa-expand"></i></span>
          </div>
          <div class="modal-body">
            <h1 id="project-modal-title"></h1>
            <h2>// About Project</h2>
            <div id="project-modal-desc"></div>
            <h2>// Technology In Project</h2>
            <div id="project-modal-tags" class="modal-tags-container"></div>
            <h2>// Keyword</h2>
            <div id="project-modal-keyword" class="modal-key-grid"></div>
            <a id="project-modal-link" class="modal-link-btn" title="Click to Preview" target="_blank">
              <i class="fas fa-external-link-alt"></i> View Project
            </a>
          </div>
        </div>`;
      document.body.appendChild(m);
    }

    const projectModal = document.getElementById("project-modal");
    const projectModalImg = document.getElementById("project-modal-img");
    const projectModalBg = document.getElementById("project-modal-bg");
    const projectModalTitle = document.getElementById("project-modal-title");
    const projectModalTags = document.getElementById("project-modal-tags");
    const projectModalDesc = document.getElementById("project-modal-desc");
    const projectModalLink = document.getElementById("project-modal-link");
    const projectModalKeyword = document.getElementById("project-modal-keyword");
    projectModal.querySelector(".modal-media").onclick = () => openLightbox(projectModalImg.src);

    const oldClose = document.getElementById("project-modal-close");
    const newClose = oldClose.cloneNode(true);
    oldClose.replaceWith(newClose);
    newClose.addEventListener("click", () => closeModal(projectModal));
    window.addEventListener("click", e => {
      if (e.target === projectModal) closeModal(projectModal);
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
          <div class="clamp-3">${project["desc-full"] || project.desc}</div>
          <div class="tags-container" style="padding-top:10px;">
            ${tagsHTML}
          </div>
        </div>`;
        card.addEventListener("click", () => {
          projectModalImg.src = project.img;
          projectModalBg.style.backgroundImage = `url(${project.img})`;
          projectModalTitle.textContent = project.name;
          projectModalTags.innerHTML = project.tags.map(t => `<span class="modal-tags">${t}</span>`).join('');
          projectModalDesc.innerHTML = project["desc-full"] || project.desc || "";
          projectModalLink.href = project.link;
          projectModalKeyword.innerHTML = Array.isArray(project.keyword)
            ? project.keyword.map(k => `<div class="modal-key-container"><h4>${k.title}</h4><p>${k.desc}</p></div>`).join('')
            : "";
          openModal(projectModal);
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
          <div class="modal-media">
            <div id="certificate-modal-bg" class="modal-media-bg"></div>
            <img id="certificate-modal-img" src="" alt="" class="modal-cer-img"/>
            <span class="modal-zoom-hint"><i class="fas fa-expand"></i></span>
          </div>
          <div class="modal-body">
            <h1 id="certificate-modal-name"></h1>
            <div class="modal-info-grid">
              <div class="modal-info-item">
                <span class="modal-info-label">Organization</span>
                <p id="certificate-modal-company"></p>
              </div>
              <div class="modal-info-item">
                <span class="modal-info-label">Certificate ID</span>
                <p id="certificate-modal-id"></p>
              </div>
              <div class="modal-info-item">
                <span class="modal-info-label">Issued On</span>
                <p id="certificate-modal-issued"></p>
              </div>
              <div class="modal-info-item">
                <span class="modal-info-label">Expires On</span>
                <p id="certificate-modal-expires"></p>
              </div>
            </div>
          </div>
        </div>`;
      document.body.appendChild(m);
    }

    const certificateModal = document.getElementById("certificate-modal");
    const certificateModalImg = document.getElementById("certificate-modal-img");
    const certificateModalBg = document.getElementById("certificate-modal-bg");
    const certificateModalName = document.getElementById("certificate-modal-name");
    const certificateModalCompany = document.getElementById("certificate-modal-company");
    const certificateModalIssued = document.getElementById("certificate-modal-issued");
    const certificateModalExpires = document.getElementById("certificate-modal-expires");
    const certificateModalID = document.getElementById("certificate-modal-id");
    certificateModal.querySelector(".modal-media").onclick = () => openLightbox(certificateModalImg.src);

    const oldCertClose = document.getElementById("certificate-modal-close");
    const newCertClose = oldCertClose.cloneNode(true);
    oldCertClose.replaceWith(newCertClose);
    newCertClose.addEventListener("click", () => closeModal(certificateModal));
    window.addEventListener("click", e => {
      if (e.target === certificateModal) closeModal(certificateModal);
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
        certificateModalBg.style.backgroundImage = `url(${cert.img})`;
        certificateModalName.textContent = cert.name;
        certificateModalCompany.textContent = cert.company;
        certificateModalIssued.textContent = cert.issued;
        certificateModalExpires.textContent = cert.expires;
        certificateModalID.textContent = cert.cerID;
        openModal(certificateModal);
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
        <div class="contact-card-top">
          <i class="${contact.icon}"></i>
          <div class="contact-card-info">
            <h3>${contact.name}</h3>
            <p>${contact.desc}</p>
          </div>
        </div>
        <div class="contact-card-footer">
          <a class="contact-btn" href="${contact.link}" target="_blank">
            <i class="fas fa-external-link-alt"></i><span>${contact.btn}</span>
          </a>
        </div>`;
      contactContainer.appendChild(card);
    });
  } // end renderContent

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