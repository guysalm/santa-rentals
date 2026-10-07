// Usage: node scripts/console.mjs <path> — prints browser console errors + a text probe.
import { chromium } from "@playwright/test";
const [, , path = "/"] = process.argv;
const browser = await chromium.launch();
const page = await browser.newPage();
page.on("console", (m) => (m.type() === "error" || m.type() === "warning") && console.log(`[${m.type()}]`, m.text().slice(0, 400)));
page.on("pageerror", (e) => console.log("[pageerror]", e.message.slice(0, 400)));
await page.goto(`http://127.0.0.1:3100${path}`, { waitUntil: "networkidle", timeout: 180000 });
await page.waitForTimeout(4000);
console.log("left/seats text:", await page.locator("text=/left|Sold out|seats|Checking/").allTextContents());
await browser.close();
