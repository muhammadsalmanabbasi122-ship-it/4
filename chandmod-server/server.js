const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// In-memory APK store (use a database for production)
const apkStore = new Map();
const userApks = new Map();

// ─── HOME PAGE ─────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>ChandMod - APK Builder</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          background: #1a1a2e;
          color: #fff;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          text-align: center;
          padding: 24px;
        }
        .logo { font-size: 72px; margin-bottom: 16px; }
        h1 { font-size: 36px; color: #FFD700; margin-bottom: 8px; }
        p { color: #8892b0; font-size: 16px; margin-bottom: 32px; }
        .badge {
          background: #16213e;
          border: 1px solid #FFD700;
          border-radius: 12px;
          padding: 12px 24px;
          color: #FFD700;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="logo">☽</div>
      <h1>ChandMod</h1>
      <p>APK Download Server is running</p>
      <div class="badge">chandtricker.qzz.io</div>
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

  console.log(`[APK] Generated: ${name} (${id}) for user ${userId}`);

  return res.status(201).json(record);
});

// ─── APK DOWNLOAD ───────────────────────────────────────────────────────────
app.get("/apk/:id.apk", (req, res) => {
  const id = req.params.id;
  const record = apkStore.get(id);

  if (!record) {
    return res.status(404).send(`
      <!DOCTYPE html><html><head>
      <style>body{background:#1a1a2e;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;text-align:center;}</style>
      </head><body>
      <div><div style="font-size:48px;margin-bottom:16px">☽</div>
      <h2 style="color:#FFD700">APK Not Found</h2>
      <p style="color:#8892b0">This APK has expired or does not exist.</p></div>
      </body></html>
    `);
  }

  // Increment download counter
  apkStore.set(id, { ...record, downloads: record.downloads + 1 });

  // In a real setup, you would serve the actual APK file here.
  // For now, we return an informational page.
  return res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Download ${record.appName}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          background: #1a1a2e;
          color: #fff;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          display: flex; align-items: center; justify-content: center;
          min-height: 100vh; padding: 24px;
        }
        .card {
          background: #16213e;
          border: 1px solid #0f3460;
          border-radius: 20px;
          padding: 32px;
          max-width: 400px;
          width: 100%;
          text-align: center;
        }
        .icon { font-size: 56px; margin-bottom: 16px; }
        h1 { font-size: 24px; font-weight: bold; margin-bottom: 8px; }
        .meta { color: #8892b0; font-size: 13px; margin-bottom: 24px; }
        .row {
          display: flex; justify-content: space-between;
          padding: 10px 0; border-bottom: 1px solid #0f3460;
          font-size: 14px;
        }
        .row:last-of-type { border-bottom: none; }
        .label { color: #8892b0; }
        .value { color: #fff; font-weight: 500; }
        .btn {
          display: block; background: #FFD700; color: #1a1a2e;
          font-weight: bold; font-size: 16px; padding: 16px;
          border-radius: 12px; margin-top: 24px; text-decoration: none;
          border: none; cursor: pointer; width: 100%;
        }
        .footer { color: #0f3460; font-size: 12px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="icon">📱</div>
        <h1>${record.appName}</h1>
        <p class="meta">Built with ChandMod</p>
        <div class="row"><span class="label">URL</span><span class="value">${new URL(record.url).hostname}</span></div>
        <div class="row"><span class="label">Size</span><span class="value">${record.size}</span></div>
        <div class="row"><span class="label">Downloads</span><span class="value">${record.downloads}</span></div>
        <div class="row"><span class="label">Created</span><span class="value">${new Date(record.createdAt).toLocaleDateString()}</span></div>
        <a href="${record.url}" class="btn">Open Website</a>
        <p class="footer">chandtricker.qzz.io • ChandMod APK Server</p>
      </div>
    </body>
    </html>
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

// ─── DELETE APK ─────────────────────────────────────────────────────────────
app.delete("/apk/:id", (req, res) => {
  const { userId } = req.body;
  const record = apkStore.get(req.params.id);
  if (!record) return res.status(404).json({ error: "Not found" });
  if (record.userId !== userId) return res.status(403).json({ error: "Forbidden" });
  apkStore.delete(req.params.id);
  const list = userApks.get(userId) || [];
  userApks.set(userId, list.filter((i) => i !== req.params.id));
  return res.json({ success: true });
});

// ─── START SERVER ───────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n☽  ChandMod APK Server running at http://localhost:${PORT}`);
  console.log(`   Domain: https://chandtricker.qzz.io\n`);
});
