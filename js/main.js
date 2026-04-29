/* ===== NAV ===== */
async function loadNav() {
  const res  = await fetch("/components/nav.html");
  const data = await res.text();
  document.getElementById("nav-container").innerHTML = data;

  const icons = document.querySelectorAll(".utility-icon");
  const currentPath = window.location.pathname;
  icons.forEach(icon => {
    const iconPath = new URL(icon.href).pathname;
    if (iconPath === currentPath) icon.classList.add("active");
  });

  // Called here ONLY — after nav is injected so all links exist
  setupTransitions();
}

/* ===== PAGE TRANSITIONS ===== */
function setupTransitions() {
  document.querySelectorAll("a").forEach(link => {
    if (link.hostname !== window.location.hostname) return;

    link.addEventListener("click", function(e) {
      const target  = this.href;
      const current = window.location.href;

      if (target === current || this.getAttribute("href") === "#") return;

      e.preventDefault();

      document.body.classList.remove("fade-in");
      document.body.classList.add("fade-out");

      // 🔥 shortened from 500 → 300
      setTimeout(() => {
        window.location.href = target;
      }, 300);
    });
  });
}

/* ===== WEB APP DETECTION ===== */
function detectWebAppMode() {
  return window.matchMedia('(display-mode: standalone)').matches
      || window.navigator.standalone === true;
}

/* ===== THEMED POPUP (web-app mode blocker) ===== */
function showCloakBlockedPopup() {
  if (document.getElementById("cloak-blocked-popup")) return;

  const popup = document.createElement("div");
  popup.id = "cloak-blocked-popup";
  popup.style.cssText = [
    "position:fixed", "inset:0", "z-index:99999",
    "display:flex", "justify-content:center", "align-items:center",
    "background:rgba(0,0,0,0.6)",
    "backdrop-filter:blur(14px)",
    "-webkit-backdrop-filter:blur(14px)"
  ].join(";");

  popup.innerHTML = `
    <div style="
      background:rgba(17,17,17,0.95);
      border-radius:22px;
      padding:40px 36px;
      max-width:360px;
      width:88%;
      text-align:center;
      color:#fff;
      font-family:'Inter',sans-serif;
      box-shadow:0 0 30px #e65c00, 0 0 60px rgba(230,92,0,0.4);
    ">
      <div style="font-size:2.4rem;margin-bottom:14px;">&#x1F512;</div>
      <p style="font-size:1.15rem;font-weight:700;margin-bottom:10px;line-height:1.4;">
        Not Available in Web-App Mode
      </p>
      <p style="font-size:0.9rem;color:#aaa;margin-bottom:28px;line-height:1.5;">
        Cloaking is disabled in web-app mode.
      </p>
      <button id="cloak-blocked-close" style="
        padding:14px 36px;
        border:none;
        border-radius:14px;
        background:#e65c00;
        color:#fff;
        font-weight:700;
        font-size:1rem;
        cursor:pointer;
        box-shadow:0 0 12px #e65c00, 0 0 24px rgba(230,92,0,0.5);
        transition:transform 0.2s, box-shadow 0.2s;
      ">Got it</button>
    </div>
  `;

  document.body.appendChild(popup);

  popup.querySelector("#cloak-blocked-close").addEventListener("click", () => popup.remove());
  popup.addEventListener("click", (e) => { if (e.target === popup) popup.remove(); });
}

/* ===== CLOAK ===== */
function openCloak() {
  if (detectWebAppMode()) {
    showCloakBlockedPopup();
    return;
  }

  var win = window.open("", "_blank");
  if (!win) {
    window.location.replace("https://google.com");
    return;
  }

  var iframe = win.document.createElement("iframe");
  iframe.style.cssText = "position:absolute;top:0;left:0;width:100%;height:100%;border:none;";
  iframe.src = "https://carey-network.github.io";

  win.document.body.style.margin = "0";
  win.document.body.style.height = "100vh";
  win.document.body.appendChild(iframe);
  win.document.title = "Carey Network";

  window.location.replace("https://google.com");
}

/* ===== AUTO CLOAK ===== */
function maybeAutoCloak() {
  // basic guards
  if (window !== window.top) return;
  if (localStorage.getItem("autoCloak") !== "true") return;
  if (detectWebAppMode()) return;

  // wait until page fully loaded
  if (document.readyState !== "complete") {
    window.addEventListener("load", maybeAutoCloak, { once: true });
    return;
  }

  const overlay = document.createElement("div");
  overlay.id = "cloak-overlay";
  overlay.style.cssText = [
    "position:fixed", "inset:0",
    "background:linear-gradient(135deg,#e65c00,#000)",
    "z-index:99999",
    "display:flex", "flex-direction:column",
    "justify-content:center", "align-items:center",
    "cursor:pointer",
    "user-select:none", "-webkit-user-select:none"
  ].join(";");

  overlay.innerHTML = `
    <div style="
      text-align:center;
      color:#fff;
      font-family:'Inter',sans-serif;
      pointer-events:none;
    ">
      <div style="
        font-size:3.5rem;
        font-weight:800;
        letter-spacing:-0.02em;
        margin-bottom:14px;
        text-shadow:0 0 30px rgba(255,255,255,0.3);
      ">Click to Cloak</div>
      <div style="
        font-size:1rem;
        color:rgba(255,255,255,0.6);
        font-weight:500;
        letter-spacing:0.04em;
      ">Tap anywhere to continue</div>
    </div>
  `;

  document.body.appendChild(overlay);

  function triggerCloak(e) {
    e.preventDefault();

    // remove once to avoid double dih
    overlay.removeEventListener("click", triggerCloak);
    overlay.remove();

    // edge
    openCloak();
  }

  // ts makes it more sigma
  overlay.addEventListener("click", triggerCloak);
}

window.openCloak = openCloak;

/* ===== PANIC BUTTON LOADER ===== */
function loadPanicButton() {
  const enabled = localStorage.getItem("panicEnabled") === "true";
  if (!enabled) return;
  if (document.getElementById("panic-btn")) return;

  if (!document.querySelector('link[href="/css/panic.css"]')) {
    const link = document.createElement("link");
    link.rel  = "stylesheet";
    link.href = "/css/panic.css";
    document.head.appendChild(link);
  }

  const script = document.createElement("script");
  script.src = "/js/panic.js";
  document.body.appendChild(script);
}

/* ===== INIT ===== */
window.onload = () => {
  document.body.classList.add("fade-in");

  loadNav();
  loadPanicButton();
  maybeAutoCloak();

  const isWebApp = detectWebAppMode();

  const cloakButton      = document.querySelector('.setting-card:first-child button');
  const autoCloakToggle  = document.querySelector('.setting-card:nth-child(2) input[type="checkbox"]');
  const panicToggle      = document.querySelector('.setting-card:nth-child(3) input[type="checkbox"]');
  const webAppToggle     = document.querySelector('.setting-card:nth-child(4) input[type="checkbox"]');

  const popup        = document.getElementById('settings-popup');
  const popupMessage = document.getElementById('popup-message');
  const popupClose   = document.getElementById('popup-close');

  function showPopup(msg) {
    if (!popup || !popupMessage) return;
    popupMessage.textContent = msg;
    popup.classList.add('show');
  }

  if (popupClose) popupClose.addEventListener('click', () => popup.classList.remove('show'));

  if (isWebApp) {
    if (webAppToggle) {
      webAppToggle.checked  = true;
      webAppToggle.disabled = true;
      webAppToggle.addEventListener('click', () => {
        showPopup('Web-App Mode cannot be turned off while in standalone mode.');
      });
    }
  } else if (webAppToggle) {
    webAppToggle.checked  = false;
    webAppToggle.disabled = true;
  }

  [cloakButton, autoCloakToggle].forEach(el => {
    if (!el) return;
    el.addEventListener('click', e => {
      if (webAppToggle?.checked) {
        e.preventDefault();
        if (el.type === 'checkbox') el.checked = false;
        showPopup('This Setting Cannot Be Activated Due To Web-App Mode');
      }
    });
  });

  if (autoCloakToggle) {
    autoCloakToggle.checked = localStorage.getItem("autoCloak") === "true";
    autoCloakToggle.addEventListener("change", () => {
      if (!webAppToggle?.checked) {
        localStorage.setItem("autoCloak", autoCloakToggle.checked);
      } else {
        autoCloakToggle.checked = false;
        showPopup("This Setting Cannot Be Activated Due To Web-App Mode");
      }
    });
  }

  if (panicToggle) {
    panicToggle.checked = localStorage.getItem("panicEnabled") === "true";
    panicToggle.addEventListener('change', () => {
      localStorage.setItem("panicEnabled", panicToggle.checked);
      if (panicToggle.checked) {
        loadPanicButton();
      } else {
        const panicBtn = document.getElementById("panic-btn");
        if (panicBtn) panicBtn.style.display = "none";
      }
      window.dispatchEvent(new Event("panicSettingsChanged"));
    });
  }
};
