// ─── Scroll lock helpers (iOS Safari safe) ───────────────────────
let _scrollY = 0;

function lockScroll() {
  _scrollY = window.scrollY;
  document.body.style.overflow = "hidden";
  document.body.style.position = "fixed";
  document.body.style.top      = `-${_scrollY}px`;
  document.body.style.width    = "100%";
}

function unlockScroll() {
  document.body.style.overflow = "";
  document.body.style.position = "";
  document.body.style.top      = "";
  document.body.style.width    = "";
  window.scrollTo(0, _scrollY);
}

// ─── Panel open / close ──────────────────────────────────────────
function openPanel(type) {
  lockScroll();

  const overlay = document.getElementById("extras-panel");
  const title   = document.getElementById("panel-title");
  const body    = document.getElementById("panel-body");
  if (!overlay || !title || !body) return;

  overlay.classList.add("show");
  body.innerHTML = "";

  if (type === "cloak") {
    title.textContent = "App Cloaking";
    body.innerHTML = `
      <p id="cloak-status" class="cloak-status"></p>
      <p class="panel-hint">Select a cloak icon.</p>
      <div class="cloak-grid">
        <div class="cloak-option" onclick="setCloak('classroom')">
          <img src="/images/cloak/classroom.png" /><span>Classroom</span>
        </div>
        <div class="cloak-option" onclick="setCloak('docs')">
          <img src="/images/cloak/docs.png" /><span>Docs</span>
        </div>
        <div class="cloak-option" onclick="setCloak('slides')">
          <img src="/images/cloak/slides.png" /><span>Slides</span>
        </div>
        <div class="cloak-option" onclick="setCloak('drive')">
          <img src="/images/cloak/drive.png" /><span>Drive</span>
        </div>
      </div>
      <button class="panel-reset" onclick="resetCloak()">Reset</button>
    `;
    const active = localStorage.getItem("appName");
    if (active) showCloakStatus(`Active: ${active}`);
  }

  if (type === "links") {
    title.textContent = "Links";
    body.innerHTML = `<button class="panel-btn">Add link here</button>`;
  }

  if (type === "changelog") {
    title.textContent = "Changelog";
    body.innerHTML = `
      <p>v1.0 - Initial release</p>
      <p>v1.1 - Cloaking system</p>
      <p>v1.2 - Extras panel added</p>
    `;
  }

  if (type === "code") {
    title.textContent = "Code Panel";
    body.innerHTML = `
      <input class="panel-input" id="codeInput" placeholder="Enter code…" />
      <button class="panel-btn" onclick="submitCode()">Submit</button>
      <pre id="codeOutput" class="code-output"></pre>
    `;
  }
}

function closePanel() {
  unlockScroll();
  const overlay = document.getElementById("extras-panel");
  if (overlay) overlay.classList.remove("show");
}

document.addEventListener("click", function (e) {
  const overlay = document.getElementById("extras-panel");
  if (overlay && e.target === overlay) closePanel();
});

// ─── Status UI ───────────────────────────────────────────────────
function showCloakStatus(msg, color = "#e65c00") {
  const el = document.getElementById("cloak-status");
  if (!el) return;
  el.textContent = msg;
  el.style.color = color;
}

// ─── Apply icon + manifest (used by setCloak/resetCloak) ─────────
function applyIconLinks(iconUrl) {
  let favicon = document.querySelector("link[rel~='icon']");
  if (!favicon) {
    favicon = document.createElement("link");
    favicon.rel = "icon";
    document.head.appendChild(favicon);
  }
  favicon.href = iconUrl;

  let apple = document.querySelector("link[rel='apple-touch-icon']");
  if (!apple) {
    apple = document.createElement("link");
    apple.rel = "apple-touch-icon";
    document.head.appendChild(apple);
  }
  apple.href = iconUrl;

  injectManifest(document.title || "The Carey Network", iconUrl);
}

// ─── Manifest injection ───────────────────────────────────────────
let manifestURL = null;

function injectManifest(appName, iconUrl) {
  const manifest = {
    name:             appName,
    short_name:       appName,
    start_url:        "/",
    display:          "standalone",
    background_color: "#111111",
    theme_color:      "#e65c00",
    icons: [
      { src: iconUrl, sizes: "192x192", type: "image/png" },
      { src: iconUrl, sizes: "512x512", type: "image/png" }
    ]
  };

  const blob = new Blob([JSON.stringify(manifest)], { type: "application/json" });
  const url  = URL.createObjectURL(blob);

  const link = document.querySelector("link[rel='manifest']")
             || document.createElement("link");
  link.rel  = "manifest";
  link.href = url;
  if (!link.parentNode) document.head.appendChild(link);

  if (manifestURL) URL.revokeObjectURL(manifestURL);
  manifestURL = url;
}

// ─── Cloak system ────────────────────────────────────────────────
const CLOAKS = {
  classroom: { name: "Google Classroom", icon: "/images/cloak/classroom.png" },
  docs:      { name: "Google Docs",      icon: "/images/cloak/docs.png"      },
  slides:    { name: "Google Slides",    icon: "/images/cloak/slides.png"    },
  drive:     { name: "Google Drive",     icon: "/images/cloak/drive.png"     }
};

function setCloak(type) {
  const p = CLOAKS[type];
  if (!p) return;
  document.title = p.name;
  applyIconLinks(p.icon);
  localStorage.setItem("appName", p.name);
  localStorage.setItem("appIcon", p.icon);
  showCloakStatus(`✓ Cloaked as ${p.name}`);
}

function resetCloak() {
  const name = "Carey Network";
  const icon = "/images/icon.png";
  document.title = name;
  applyIconLinks(icon);
  localStorage.removeItem("appName");
  localStorage.removeItem("appIcon");
  showCloakStatus("✓ Reset to default", "#aaa");
}

// ─── Code panel ───────────────────────────────────────────────────
function submitCode() {
  const input = document.getElementById("codeInput");
  const out   = document.getElementById("codeOutput");
  if (!input || !out) return;
  const val = input.value.trim();
  try {
    const result = Function('"use strict"; return (' + val + ')')();
    out.textContent = String(result);
    out.style.color = "#7fff7f";
  } catch (err) {
    out.textContent = "✗ " + err.message;
    out.style.color = "#ff6b6b";
  }
}
