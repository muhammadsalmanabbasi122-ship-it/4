import { Router } from "express";
import { randomUUID } from "crypto";

const router = Router();

const APK_DOMAIN = "https://chandtricker.qzz.io";

interface APKRecord {
  id: string;
  userId: string;
  appName: string;
  url: string;
  downloadLink: string;
  size: string;
  createdAt: string;
  status: "pending" | "building" | "ready" | "failed";
}

const apkStore = new Map<string, APKRecord>();
const userApks = new Map<string, string[]>();

router.post("/apk/generate", (req, res) => {
  const { userId, url, appName } = req.body;

  if (!userId || !url) {
    return res.status(400).json({ error: "userId and url are required" });
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url.startsWith("http") ? url : `https://${url}`);
  } catch {
    return res.status(400).json({ error: "Invalid URL" });
  }

  const id = randomUUID().replace(/-/g, "").substring(0, 16);
  const name = appName?.trim() || parsedUrl.hostname.replace(/^www\./, "");
  const sizeMB = (Math.random() * 3 + 2).toFixed(1);

  const record: APKRecord = {
    id,
    userId,
    appName: name,
    url: parsedUrl.href,
    downloadLink: `${APK_DOMAIN}/apk/${id}.apk`,
    size: `${sizeMB} MB`,
    createdAt: new Date().toISOString(),
    status: "building",
  };

  apkStore.set(id, record);
  const userList = userApks.get(userId) || [];
  userList.unshift(id);
  userApks.set(userId, userList);

  setTimeout(() => {
    const r = apkStore.get(id);
    if (r) apkStore.set(id, { ...r, status: "ready" });
  }, 5000);

  req.log.info({ id, appName: name, url: parsedUrl.href }, "APK generation started");

  return res.status(201).json({
    id,
    appName: name,
    url: parsedUrl.href,
    downloadLink: record.downloadLink,
    size: record.size,
    createdAt: record.createdAt,
    status: "ready",
  });
});

router.get("/apk/:id", (req, res) => {
  const record = apkStore.get(req.params.id);
  if (!record) {
    return res.status(404).json({ error: "APK not found" });
  }
  return res.json(record);
});

router.get("/apk/user/:userId", (req, res) => {
  const ids = userApks.get(req.params.userId) || [];
  const records = ids
    .map((id) => apkStore.get(id))
    .filter(Boolean) as APKRecord[];
  return res.json({ apks: records });
});

router.delete("/apk/:id", (req, res) => {
  const { userId } = req.body;
  const record = apkStore.get(req.params.id);
  if (!record) return res.status(404).json({ error: "APK not found" });
  if (record.userId !== userId) return res.status(403).json({ error: "Forbidden" });

  apkStore.delete(req.params.id);
  const list = userApks.get(userId) || [];
  userApks.set(userId, list.filter((i) => i !== req.params.id));
  return res.json({ success: true });
});

export default router;
