// Create (or promote) a back-office user.
// Usage: npm run make-admin -- you@example.com [admin|staff]
// Uses NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY from .env.local (or the shell env).
import { readFileSync, existsSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

if (existsSync(".env.local")) {
  for (const line of readFileSync(".env.local", "utf8").replace(/^﻿/, "").split(/\r?\n/)) {
    const m = /^([A-Z0-9_]+)=(.*)$/.exec(line);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}

const [email, role = "admin"] = process.argv.slice(2);
if (!email || !["admin", "staff"].includes(role)) {
  console.error("Usage: npm run make-admin -- <email> [admin|staff]");
  process.exit(1);
}

const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });

const { data: list } = await db.auth.admin.listUsers({ perPage: 1000 });
let user = list?.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
if (!user) {
  const { data, error } = await db.auth.admin.createUser({ email, email_confirm: true });
  if (error) throw error;
  user = data.user;
  console.log(`Created auth user ${email}`);
}
const { error } = await db.from("profiles").upsert({ id: user.id, role });
if (error) throw error;
console.log(`${email} is now ${role}. Log in at /login with a magic link.`);
