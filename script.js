// Scroll animation
const sections = document.querySelectorAll('.scroll-section');

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('active');
    }
  });
}, { threshold: 0.2 });

sections.forEach(section => observer.observe(section));


// Sticky header logic
const header = document.querySelector("header");

window.addEventListener("scroll", () => {
  if (window.scrollY > 1000) {  // ถ้าเลื่อนเกิน 100px
    header.classList.add("sticky");
  } else {
    header.classList.remove("sticky");
  }
});



const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let particlesArray = [];
const particleCount = 60; // ลดจำนวน
const maxLineDistance = 120;

class Particle {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 2 + 1.5;
    this.speedX = (Math.random() * 0.4) - 0.2; // ช้า
    this.speedY = (Math.random() * 0.4) - 0.2;
    this.color = 'rgba(255,255,255,0.6)'; // โปร่งใส
  }
  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    if (this.x < 0 || this.x > canvas.width) this.speedX = -this.speedX;
    if (this.y < 0 || this.y > canvas.height) this.speedY = -this.speedY;
  }
  draw() {
    ctx.fillStyle = this.color;
    ctx.shadowBlur = 5;     // เพิ่ม glow นิดหน่อย
    ctx.shadowColor = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

function initParticles() {
  particlesArray = [];
  for (let i = 0; i < particleCount; i++) {
    particlesArray.push(new Particle());
  }
}
initParticles();

function connectParticles() {
  for (let a = 0; a < particlesArray.length; a++) {
    for (let b = a + 1; b < particlesArray.length; b++) {
      const dx = particlesArray[a].x - particlesArray[b].x;
      const dy = particlesArray[a].y - particlesArray[b].y;
      const distance = Math.sqrt(dx*dx + dy*dy);
      if (distance < maxLineDistance) {
        ctx.strokeStyle = `rgba(255,255,255,${0.2*(1 - distance/maxLineDistance)})`;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
        ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
        ctx.stroke();
      }
    }
  }
}

function animateParticles() {
  // พื้นหลัง gradient ดำสวย
  const gradient = ctx.createLinearGradient(0,0,canvas.width,canvas.height);
  gradient.addColorStop(0,'#000000');
  gradient.addColorStop(1,'#0d0d0d');
  ctx.fillStyle = gradient;
  ctx.fillRect(0,0,canvas.width,canvas.height);

  particlesArray.forEach(p => {
    p.update();
    p.draw();
  });

  connectParticles();
  requestAnimationFrame(animateParticles);
}
animateParticles();

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  initParticles();
});








document.addEventListener("DOMContentLoaded", () => {
  let currentLang = localStorage.getItem("lang") || "en"; // โหลดค่าภาษาเดิมจาก localStorage
  let dataJSON = {};

  // โหลดข้อมูล JSON
  fetch("data.json")
    .then(response => response.json())
    .then(data => {
      dataJSON = data;
      renderContent(); // แสดงเนื้อหาเริ่มต้น
    });

  // ฟังก์ชันแสดงเนื้อหาตามภาษา
  function renderContent() {
    if (!dataJSON[currentLang]) return;

    const data = dataJSON[currentLang];

    // Intro
    document.getElementById("intro-name").innerText = data.name;
    document.getElementById("intro-title").innerText = data.title;
    document.getElementById("intro-quote").innerText = data.quote;
    document.getElementById("intro-quote2").innerText = data.quote2;

    // Hero
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

    // ----------------- Projects -----------------
    const projectsContainer = document.getElementById("projects-list");
    projectsContainer.innerHTML = "";

    // Project Modal
    if (!document.getElementById("project-modal")) {
      const projectModal = document.createElement("div");
      projectModal.id = "project-modal";
      projectModal.className = "modal";
      projectModal.innerHTML = `
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
        </div>
      `;
      document.body.appendChild(projectModal);
    }

    const projectModal = document.getElementById("project-modal");
    const projectModalImg = document.getElementById("project-modal-img");
    const projectModalTitle = document.getElementById("project-modal-title");
    const projectModalTags = document.getElementById("project-modal-tags");
    const projectModalDesc = document.getElementById("project-modal-desc");
    const projectModalClose = document.getElementById("project-modal-close");
    const projectModalLink = document.getElementById("project-modal-link");
    const projectModalKeyword = document.getElementById("project-modal-keyword");

    projectModalClose.addEventListener("click", () => projectModal.classList.remove("show"));
    window.addEventListener("click", e => { if (e.target === projectModal) projectModal.classList.remove("show"); });

    data.projects.forEach(project => {
      const card = document.createElement("div");
      card.className = "project-card";

      // Show first 3 tags + more
      let tagsHTML = "";
      if (project.tags.length > 3) {
        const firstThree = project.tags.slice(0, 3).map(tag => `<span class="tags">${tag}</span>`).join('');
        const extraCount = project.tags.length - 3;
        tagsHTML = firstThree + `<span class="tags more">+${extraCount} more</span>`;
      } else {
        tagsHTML = project.tags.map(tag => `<span class="tags">${tag}</span>`).join('');
      }

      card.innerHTML = `
        <img src="${project.img}" alt="${project.name}"/>
        <div class="project-card-container">
          <h3>${project.name}</h3>
          <div class="tags-container">${tagsHTML}</div>
          <p>${project.desc}</p>
        </div>
      `;

      card.addEventListener("click", () => {
        projectModalImg.src = project.img;
        projectModalTitle.textContent = project.name;
        projectModalTags.innerHTML = project.tags.map(tag => `<span class="modal-tags">${tag}</span>`).join('');
        projectModalDesc.textContent = project["desc-full"] || project.desc || "";
        projectModalLink.textContent = project.link;
        projectModalLink.href = project.link;

        if (Array.isArray(project.keyword)) {
          projectModalKeyword.innerHTML = project.keyword.map(k => `
            <div class="modal-key-container">
              <h4>${k.title}</h4>
              <p>${k.desc}</p>
            </div>`).join('');
        } else {
          projectModalKeyword.innerHTML = "";
        }
        projectModal.classList.add("show");
      });

      projectsContainer.appendChild(card);
    });

    // ----------------- Certificate -----------------
    const certificateContainer = document.getElementById("certificate-list");
    certificateContainer.innerHTML = "";

    // Certificate Modal
    if (!document.getElementById("certificate-modal")) {
      const certificateModal = document.createElement("div");
      certificateModal.id = "certificate-modal";
      certificateModal.className = "modal";
      certificateModal.innerHTML = `
        <div class="modal-content">
          <span id="certificate-modal-close" class="modal-close" title="Close">&times;</span>
          <img id="certificate-modal-img" src="" alt="" class="modal-cer-img"/>
          <h1 id="certificate-modal-name"></h1>
          <p id="certificate-modal-company"></p>
          <p id="certificate-modal-id"></p>
          <p id="certificate-modal-issued"></p>
          <p id="certificate-modal-expires"></p>
        </div>
      `;
      document.body.appendChild(certificateModal);
    }

    const certificateModal = document.getElementById("certificate-modal");
    const certificateModalImg = document.getElementById("certificate-modal-img");
    const certificateModalName = document.getElementById("certificate-modal-name");
    const certificateModalCompany = document.getElementById("certificate-modal-company");
    const certificateModalIssued = document.getElementById("certificate-modal-issued");
    const certificateModalExpires = document.getElementById("certificate-modal-expires");
    const certificateModalClose = document.getElementById("certificate-modal-close");
    const certificateModalID = document.getElementById("certificate-modal-id");

    certificateModalClose.addEventListener("click", () => certificateModal.classList.remove("show"));
    window.addEventListener("click", e => { if (e.target === certificateModal) certificateModal.classList.remove("show"); });

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
        </div>
      `;

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

    // ----------------- Contact -----------------
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
        </a>
      `;
      contactContainer.appendChild(card);
    });
  }

  // เปลี่ยนภาษาเมื่อกดปุ่ม
  document.querySelectorAll(".lang-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      currentLang = btn.dataset.lang;          // อัปเดตภาษา
      localStorage.setItem("lang", currentLang); // บันทึกใน localStorage
      renderContent();                           // รีเรนเดอร์เนื้อหา

      // เปลี่ยน active ของปุ่ม
      document.querySelectorAll(".lang-btn").forEach(b => {
        b.classList.toggle("active", b.dataset.lang === currentLang);
      });
    });
  });


});


