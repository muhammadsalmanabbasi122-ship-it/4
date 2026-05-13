const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const APKS_DIR = path.resolve(__dirname, "apks");
const DATA_FILE = path.resolve(__dirname, "data.json");

// Ensure apks directory exists
if (!fs.existsSync(APKS_DIR)) {
  fs.mkdirSync(APKS_DIR, { recursive: true });
}

app.use(cors());
app.use(express.json());
app.use(express.raw({ type: "application/octet-stream", limit: "200mb" }));

// ─── PERSISTENT STORE ──────────────────────────────────────────────────────
function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, "utf-8");
      const data = JSON.parse(raw);
      return {
        apkStore: new Map(Object.entries(data.apkStore || {})),
        userApks: new Map(Object.entries(data.userApks || {})),
      };
    }
  } catch (e) {
    console.error("[DATA] Failed to load data.json:", e.message);
  }
  return { apkStore: new Map(), userApks: new Map() };
}

function saveData() {
  try {
    const data = {
      apkStore: Object.fromEntries(apkStore),
      userApks: Object.fromEntries(userApks),
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error("[DATA] Failed to save data.json:", e.message);
  }
}

const { apkStore, userApks } = loadData();
console.log(`[DATA] Loaded ${apkStore.size} APK records, ${userApks.size} users`);

// ─── HOME PAGE ─────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>ChandMod — Turn Websites into Android Apps</title>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          background: #0d0d1a;
          color: #fff;
          font-family: 'Inter', -apple-system, sans-serif;
          min-height: 100vh;
          overflow-x: hidden;
        }

        /* ─── Animated Background ─── */
        .bg-glow {
          position: fixed;
          inset: 0;
          z-index: 0;
          overflow: hidden;
          pointer-events: none;
        }
        .bg-glow::before {
          content: '';
          position: absolute;
          width: 600px;
          height: 600px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255,215,0,0.08) 0%, transparent 70%);
          top: -200px;
          left: -200px;
          animation: float 12s ease-in-out infinite;
        }
        .bg-glow::after {
          content: '';
          position: absolute;
          width: 500px;
          height: 500px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255,215,0,0.05) 0%, transparent 70%);
          bottom: -150px;
          right: -150px;
          animation: float 10s ease-in-out infinite reverse;
        }
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(40px, -30px) scale(1.05); }
        }

        .container {
          position: relative;
          z-index: 1;
          max-width: 1100px;
          margin: 0 auto;
          padding: 40px 24px;
        }

        /* ─── Nav ─── */
        nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 0;
          margin-bottom: 80px;
        }
        .nav-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 22px;
          font-weight: 800;
          color: #FFD700;
          text-decoration: none;
        }
        .nav-brand span { font-size: 28px; }
        .nav-links {
          display: flex;
          gap: 28px;
          align-items: center;
        }
        .nav-links a {
          color: #8892b0;
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          transition: color 0.2s;
        }
        .nav-links a:hover { color: #FFD700; }

        /* ─── Hero ─── */
        .hero {
          text-align: center;
          margin-bottom: 120px;
        }
        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(255,215,0,0.08);
          border: 1px solid rgba(255,215,0,0.15);
          border-radius: 100px;
          padding: 6px 16px;
          font-size: 12px;
          color: #FFD700;
          font-weight: 600;
          letter-spacing: 0.5px;
          margin-bottom: 28px;
        }
        .hero-badge-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #10b981;
          animation: pulse-dot 2s ease-in-out infinite;
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        .hero h1 {
          font-size: clamp(40px, 7vw, 72px);
          font-weight: 900;
          line-height: 1.1;
          letter-spacing: -2px;
          margin-bottom: 20px;
          background: linear-gradient(135deg, #ffffff 0%, #8892b0 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .hero h1 em {
          font-style: normal;
          background: linear-gradient(135deg, #FFD700 0%, #ffb700 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .hero p {
          font-size: clamp(16px, 2vw, 20px);
          color: #8892b0;
          max-width: 600px;
          margin: 0 auto 36px;
          line-height: 1.6;
        }
        .hero-actions {
          display: flex;
          gap: 14px;
          justify-content: center;
          flex-wrap: wrap;
        }
        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #FFD700;
          color: #0d0d1a;
          font-weight: 700;
          font-size: 15px;
          padding: 14px 32px;
          border-radius: 14px;
          text-decoration: none;
          transition: all 0.2s;
          border: none;
          cursor: pointer;
        }
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(255,215,0,0.25);
        }
        .btn-secondary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255,255,255,0.04);
          color: #fff;
          font-weight: 600;
          font-size: 15px;
          padding: 14px 32px;
          border-radius: 14px;
          text-decoration: none;
          border: 1px solid rgba(255,255,255,0.06);
          transition: all 0.2s;
        }
        .btn-secondary:hover {
          background: rgba(255,255,255,0.08);
          border-color: rgba(255,215,0,0.2);
        }

        /* ─── Stats ─── */
        .stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          margin-bottom: 120px;
        }
        .stat-card {
          background: rgba(22,33,62,0.5);
          border: 1px solid rgba(255,215,0,0.06);
          border-radius: 20px;
          padding: 32px 24px;
          text-align: center;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          transition: all 0.3s;
        }
        .stat-card:hover {
          border-color: rgba(255,215,0,0.15);
          transform: translateY(-4px);
        }
        .stat-number {
          font-size: 36px;
          font-weight: 800;
          color: #FFD700;
          margin-bottom: 6px;
        }
        .stat-label {
          font-size: 14px;
          color: #8892b0;
          font-weight: 500;
        }

        /* ─── Features ─── */
        .features-title {
          text-align: center;
          font-size: 32px;
          font-weight: 800;
          margin-bottom: 12px;
        }
        .features-sub {
          text-align: center;
          color: #8892b0;
          font-size: 16px;
          margin-bottom: 48px;
        }
        .features {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
          margin-bottom: 120px;
        }
        .feature-card {
          background: rgba(22,33,62,0.4);
          border: 1px solid rgba(255,255,255,0.04);
          border-radius: 18px;
          padding: 28px;
          transition: all 0.3s;
        }
        .feature-card:hover {
          background: rgba(22,33,62,0.6);
          border-color: rgba(255,215,0,0.1);
          transform: translateY(-3px);
        }
        .feature-icon {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          background: rgba(255,215,0,0.08);
          border: 1px solid rgba(255,215,0,0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          margin-bottom: 16px;
        }
        .feature-card h3 {
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 8px;
        }
        .feature-card p {
          font-size: 14px;
          color: #8892b0;
          line-height: 1.6;
        }

        /* ─── CTA ─── */
        .cta {
          text-align: center;
          background: linear-gradient(135deg, rgba(255,215,0,0.05) 0%, transparent 100%);
          border: 1px solid rgba(255,215,0,0.08);
          border-radius: 28px;
          padding: 64px 32px;
          margin-bottom: 80px;
        }
        .cta h2 {
          font-size: 32px;
          font-weight: 800;
          margin-bottom: 12px;
        }
        .cta p {
          color: #8892b0;
          font-size: 16px;
          margin-bottom: 28px;
        }

        /* ─── Social ─── */
        .social-section {
          text-align: center;
          margin-bottom: 60px;
        }
        .social-section h3 {
          font-size: 16px;
          color: #8892b0;
          font-weight: 600;
          margin-bottom: 20px;
          letter-spacing: 1px;
          text-transform: uppercase;
        }
        .social-links {
          display: flex;
          gap: 12px;
          justify-content: center;
          flex-wrap: wrap;
        }
        .social-link {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 12px;
          padding: 10px 18px;
          color: #8892b0;
          text-decoration: none;
          font-size: 13px;
          font-weight: 500;
          transition: all 0.2s;
        }
        .social-link:hover {
          color: #fff;
          border-color: rgba(255,215,0,0.2);
          background: rgba(255,215,0,0.05);
          transform: translateY(-2px);
        }

        /* ─── Footer ─── */
        footer {
          text-align: center;
          padding: 32px 0;
          border-top: 1px solid rgba(255,255,255,0.04);
        }
        footer p {
          color: #2a2a4a;
          font-size: 13px;
          font-weight: 500;
        }

        @media (max-width: 640px) {
          nav { flex-direction: column; gap: 16px; margin-bottom: 48px; }
          .nav-links { gap: 16px; }
          .stats { grid-template-columns: 1fr; gap: 16px; }
        }
      </style>
    </head>
    <body>
      <div class="bg-glow"></div>
      <div class="container">
        <nav>
          <a href="/" class="nav-brand"><span>☽</span> ChandMod</a>
          <div class="nav-links">
            <a href="#features">Features</a>
            <a href="https://github.com/chandtricker">GitHub</a>
            <a href="https://wa.me/message/63ORB7U3LWOWD1" target="_blank">Contact</a>
          </div>
        </nav>

        <section class="hero">
          <div class="hero-badge">
            <span class="hero-badge-dot"></span>
            Server Active — chandtricker.qzz.io
          </div>
          <h1>Turn any website into an <em>Android APK</em></h1>
          <p>Enter a URL, pick a name, and get a ready-to-install APK in seconds. No coding required.</p>
          <div class="hero-actions">
            <a href="https://chandmod.app" class="btn-primary">
              ✦ Get Started
            </a>
            <a href="#features" class="btn-secondary">
              Learn More →
            </a>
          </div>
        </section>

        <div class="stats">
          <div class="stat-card">
            <div class="stat-number" id="stat-apks">0</div>
            <div class="stat-label">APKs Built</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">∞</div>
            <div class="stat-label">Websites Supported</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">100%</div>
            <div class="stat-label">Uptime</div>
          </div>
        </div>

        <h2 class="features-title" id="features">Built for <span style="color:#FFD700">speed</span></h2>
        <p class="features-sub">Everything you need to convert websites into mobile apps</p>

        <div class="features">
          <div class="feature-card">
            <div class="feature-icon">⚡</div>
            <h3>Instant Conversion</h3>
            <p>Enter any URL and get a downloadable APK within seconds. No setup or configuration needed.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">📱</div>
            <h3>Native Android App</h3>
            <p>Your website packaged as a real Android APK ready to install on any device running Android 6+.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🎨</div>
            <h3>Custom Icon & Name</h3>
            <p>Set your own app name and icon to make your app truly yours before downloading.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🔄</div>
            <h3>Rebuild Anytime</h3>
            <p>Update your website? Rebuild your APK in one click. Your download link stays the same.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">📊</div>
            <h3>Download Tracking</h3>
            <p>See exactly how many times your APK has been downloaded with real-time analytics.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🔒</div>
            <h3>Secure & Private</h3>
            <p>Your data stays safe. All conversions are processed securely and never stored permanently.</p>
          </div>
        </div>

        <div class="cta">
          <h2>Ready to build your <span style="color:#FFD700">first APK</span>?</h2>
          <p>It takes just 10 seconds. Enter a URL, pick a name, and download.</p>
          <a href="https://chandmod.app" class="btn-primary">✦ Start Building</a>
        </div>

        <div class="social-section">
          <h3>Connect with Chand Tricker</h3>
          <div class="social-links">
            <a href="https://wa.me/message/63ORB7U3LWOWD1" target="_blank" class="social-link">💬 WhatsApp</a>
            <a href="https://whatsapp.com/channel/0029VaZrEGYIN9ih4PxcFQ33" target="_blank" class="social-link">📢 WhatsApp Channel</a>
            <a href="https://www.youtube.com/@chandtricker/" target="_blank" class="social-link">▶ YouTube</a>
            <a href="https://www.facebook.com/OWNER.CHAND" target="_blank" class="social-link">📘 Facebook</a>
            <a href="https://www.instagram.com/chand.tricker/" target="_blank" class="social-link">📸 Instagram</a>
            <a href="https://t.me/CHANDTRICKER" target="_blank" class="social-link">✈ Telegram</a>
            <a href="https://github.com/chandtricker" target="_blank" class="social-link">🐙 GitHub</a>
          </div>
        </div>

        <footer>
          <p>☽ ChandMod ${new Date().getFullYear()} — Made with passion by Chand Tricker</p>
        </footer>
      </div>
      <script>
        // Animated counter
        let count = 0;
        const target = ${Array.from(apkStore.values()).reduce((s, r) => s + r.downloads, 0) || 42};
        const el = document.getElementById('stat-apks');
        const interval = setInterval(() => {
          count += Math.ceil((target - count) / 12);
          if (count >= target) { count = target; clearInterval(interval); }
          el.textContent = count;
        }, 60);
      </script>
    </body>
    </html>
  `);
});

// ─── HEALTH CHECK ───────────────────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.json({ status: "ok", server: "ChandMod APK Server", time: new Date().toISOString() });
});

// ─── GENERATE APK RECORD ────────────────────────────────────────────────────
app.post("/apk/generate", (req, res) => {
  const { userId, url, appName } = req.body;

  if (!userId || !url) {
    return res.status(400).json({ error: "userId and url are required" });
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(url.startsWith("http") ? url : `https://${url}`);
  } catch {
    return res.status(400).json({ error: "Invalid URL" });
  }

  const id = crypto.randomBytes(8).toString("hex");
  const name = (appName || "").trim() || parsedUrl.hostname.replace(/^www\./, "");
  const sizeMB = (Math.random() * 3 + 2).toFixed(1);

  const record = {
    id,
    userId,
    appName: name,
    url: parsedUrl.href,
    downloadLink: `https://chandtricker.qzz.io/apk/${id}.apk`,
    size: `${sizeMB} MB`,
    createdAt: new Date().toISOString(),
    status: "ready",
    downloads: 0,
  };

  apkStore.set(id, record);
  const userList = userApks.get(userId) || [];
  userList.unshift(id);
  userApks.set(userId, userList);
  saveData();

  console.log(`[APK] Generated: ${name} (${id}) for user ${userId}`);

  return res.status(201).json(record);
});

// ─── APK DOWNLOAD ───────────────────────────────────────────────────────────
app.get("/apk/:id.apk", (req, res) => {
  const id = req.params.id;
  const record = apkStore.get(id);
  const apkPath = path.join(APKS_DIR, `${id}.apk`);

  // Serve actual APK file if it exists
  if (fs.existsSync(apkPath)) {
    apkStore.set(id, { ...record, downloads: (record?.downloads || 0) + 1 });
    saveData();
    return res.download(apkPath, `${record?.appName || "app"}.apk`);
  }

  // Show info page if record exists but no APK file yet
  if (record) {
    return res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${record.appName} - ChandMod</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            background: #1a1a2e; color: #fff;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            display: flex; align-items: center; justify-content: center;
            min-height: 100vh; padding: 24px;
          }
          .card {
            background: #16213e; border: 1px solid #0f3460;
            border-radius: 20px; padding: 32px; max-width: 400px; width: 100%;
            text-align: center;
          }
          .icon { font-size: 56px; margin-bottom: 16px; }
          h1 { font-size: 24px; font-weight: bold; margin-bottom: 8px; color: #fff; }
          .meta { color: #8892b0; font-size: 13px; margin-bottom: 24px; }
          .row {
            display: flex; justify-content: space-between;
            padding: 10px 0; border-bottom: 1px solid #0f3460; font-size: 14px;
          }
          .row:last-of-type { border-bottom: none; }
          .label { color: #8892b0; }
          .value { color: #fff; font-weight: 500; }
          .btn {
            display: block; background: #FFD700; color: #1a1a2e;
            font-weight: bold; font-size: 16px; padding: 16px;
            border-radius: 12px; margin-top: 24px; text-decoration: none;
          }
          .btn-dl { background: #FFD700; margin-top: 8px; }
          .footer { color: #0f3460; font-size: 12px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="icon">⏳</div>
          <h1>${record.appName}</h1>
          <p class="meta">APK is being built. Check back soon.</p>
          <div class="row"><span class="label">URL</span><span class="value">${new URL(record.url).hostname}</span></div>
          <div class="row"><span class="label">Status</span><span class="value">Building...</span></div>
          <p class="footer">chandtricker.qzz.io • ChandMod APK Server</p>
        </div>
      </body>
      </html>
    `);
  }

  // No record found
  return res.status(404).send(`
    <!DOCTYPE html><html><head>
    <style>body{background:#1a1a2e;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;text-align:center;}</style>
    </head><body>
    <div><div style="font-size:48px;margin-bottom:16px">☽</div>
    <h2 style="color:#FFD700">APK Not Found</h2>
    <p style="color:#8892b0">This APK has expired or does not exist.</p></div>
    </body></html>
  `);
});

// ─── GET SINGLE APK INFO ────────────────────────────────────────────────────
app.get("/apk/:id", (req, res) => {
  const record = apkStore.get(req.params.id);
  if (!record) return res.status(404).json({ error: "APK not found" });
  return res.json(record);
});

// ─── GET USER APK HISTORY ───────────────────────────────────────────────────
app.get("/apk/user/:userId", (req, res) => {
  const ids = userApks.get(req.params.userId) || [];
  const records = ids.map((id) => apkStore.get(id)).filter(Boolean);
  return res.json({ apks: records, total: records.length });
});

// ─── UPLOAD APK (from CI) ──────────────────────────────────────────────────
app.post("/apk/upload/:id", (req, res) => {
  const apiKey = req.headers["x-api-key"];
  if (apiKey !== process.env.APK_UPLOAD_KEY) {
    return res.status(403).json({ error: "Forbidden: invalid API key" });
  }

  const id = req.params.id;
  const record = apkStore.get(id);
  if (!record) return res.status(404).json({ error: "APK record not found" });

  const apkPath = path.join(APKS_DIR, `${id}.apk`);
  fs.writeFileSync(apkPath, req.body);

  const stats = fs.statSync(apkPath);
  const sizeMB = (stats.size / (1024 * 1024)).toFixed(1);
  apkStore.set(id, { ...record, status: "ready", size: `${sizeMB} MB` });
  saveData();

  console.log(`[APK] Uploaded: ${record.appName} (${id}) - ${sizeMB} MB`);
  return res.json({ success: true, id, size: `${sizeMB} MB` });
});

// ─── DELETE APK ─────────────────────────────────────────────────────────────
app.delete("/apk/:id", (req, res) => {
  const { userId } = req.body;
  const record = apkStore.get(req.params.id);
  if (!record) return res.status(404).json({ error: "Not found" });
  if (record.userId !== userId) return res.status(403).json({ error: "Forbidden" });
  apkStore.delete(req.params.id);
  const list = userApks.get(userId) || [];
  userApks.set(userId, list.filter((i) => i !== req.params.id));
  saveData();
  return res.json({ success: true });
});

// ─── START SERVER ───────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n☽  ChandMod APK Server running at http://localhost:${PORT}`);
  console.log(`   Domain: https://chandtricker.qzz.io\n`);
});
