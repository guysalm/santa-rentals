// Usage: node scripts/shot.mjs <path> <out.png> [width] [fullPage]
import { chromium } from "@playwright/test";
const [, , path = "/", out = "shot.png", width = "1366", full = "1"] = process.argv;
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: Number(width), height: 900 } });
await page.goto(`http://127.0.0.1:3100${path}`, { waitUntil: "networkidle", timeout: 180000 });
await page.waitForTimeout(800);
await page.screenshot({ path: out, fullPage: full === "1" });
await browser.close();
