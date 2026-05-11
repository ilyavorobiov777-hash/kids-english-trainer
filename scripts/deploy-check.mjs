import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const requiredEnv = ["SUPABASE_URL", "SUPABASE_ANON_KEY", "NEXT_PUBLIC_APP_URL"];
const placeholderPatterns = [/your-/i, /placeholder/i, /example/i, /changeme/i, /supabase-anon-key/i];
const warnings = [];

function file(path) {
  return resolve(root, path);
}

function read(path) {
  return readFileSync(file(path), "utf8");
}

function warn(message) {
  warnings.push(message);
  console.warn(`deploy-check warning: ${message}`);
}

function fail(message) {
  console.error(`deploy-check failed: ${message}`);
  process.exit(1);
}

function readEnvFile(fileName) {
  if (!existsSync(file(fileName))) return {};

  return read(fileName)
    .split(/\r?\n/)
    .reduce((acc, line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) return acc;
      const separator = trimmed.indexOf("=");
      if (separator === -1) return acc;
      const key = trimmed.slice(0, separator).trim();
      const value = trimmed.slice(separator + 1).trim().replace(/^['"]|['"]$/g, "");
      acc[key] = value;
      return acc;
    }, {});
}

function gitTracked(path) {
  const result = spawnSync("git", ["ls-files", "--error-unmatch", path], {
    cwd: root,
    encoding: "utf8",
    shell: false
  });
  return result.status === 0;
}

function assertFile(path, label = path) {
  if (!existsSync(file(path))) fail(`Required file is missing: ${label}`);
}

assertFile("package.json");

const packageJson = JSON.parse(read("package.json"));
for (const script of ["dev", "build", "start", "typecheck", "content:report", "deploy:check"]) {
  if (!packageJson.scripts?.[script]) fail(`package.json script is missing: ${script}`);
}

const envExample = readEnvFile(".env.example");
for (const key of requiredEnv) {
  if (!(key in envExample)) fail(`.env.example must document ${key}`);
}

const localEnv = { ...readEnvFile(".env"), ...readEnvFile(".env.local"), ...process.env };
for (const key of requiredEnv) {
  const value = localEnv[key];
  if (!value) fail(`${key} is missing locally. Add it to .env.local and to Vercel Project Settings -> Environment Variables.`);
  if (placeholderPatterns.some((pattern) => pattern.test(value))) fail(`${key} still looks like a placeholder.`);
}

if (!localEnv.NEXT_PUBLIC_SUPABASE_URL.startsWith("https://")) {
  fail("NEXT_PUBLIC_SUPABASE_URL must be an HTTPS Supabase project URL.");
}

if (existsSync(file(".env.local")) && gitTracked(".env.local")) {
  fail(".env.local is tracked by Git. Remove it from Git before deploy.");
}

const gitignore = existsSync(file(".gitignore")) ? read(".gitignore") : "";
if (!gitignore.split(/\r?\n/).some((line) => line.trim() === ".env.local")) {
  fail(".gitignore must include .env.local");
}

for (const requiredFile of [
  "app/manifest.ts",
  "public/sw.js",
  "public/icons/icon-192.svg",
  "public/icons/icon-512.svg",
  "public/samples/cards-import-sample.csv",
  "next.config.mjs",
  "package-lock.json",
  "supabase/seed_350_learning_content.sql",
  "supabase/seed_starter_texts.sql",
  "supabase/seed_demonstratives_content.sql",
  "supabase/migrations/20260511100000_demonstratives_content.sql",
  "supabase/migrations/20260509210000_learning_texts.sql"
]) {
  assertFile(requiredFile);
}

if (!existsSync(file("public/manifest.json"))) {
  console.log("deploy-check: manifest is served by Next from app/manifest.ts as /manifest.webmanifest.");
}

const productionSensitiveFiles = [
  "app",
  "components",
  "hooks",
  "lib",
  "public/sw.js",
  "next.config.mjs"
];

const hardcodedLocalhost = [];
for (const target of productionSensitiveFiles) {
  const result = spawnSync("git", ["grep", "-n", "-E", "localhost:3000|localhost:3001|127\\.0\\.0\\.1", "--", target], {
    cwd: root,
    encoding: "utf8",
    shell: false
  });
  if (result.status === 0 && result.stdout.trim()) hardcodedLocalhost.push(result.stdout.trim());
}

if (hardcodedLocalhost.length) {
  fail(`Hardcoded localhost URL found in production-sensitive files:\n${hardcodedLocalhost.join("\n")}`);
}

const serviceRoleSearch = spawnSync("git", ["grep", "-n", "-E", "service_role|SUPABASE_SERVICE", "--", "app", "components", "hooks", "lib"], {
  cwd: root,
  encoding: "utf8",
  shell: false
});
if (serviceRoleSearch.status === 0 && serviceRoleSearch.stdout.trim()) {
  fail(`Service role reference found in frontend code:\n${serviceRoleSearch.stdout.trim()}`);
}

const clientDirectSupabaseSearches = [
  ["app", "app/api"],
  ["components", null],
  ["hooks", null]
];

for (const [target, excluded] of clientDirectSupabaseSearches) {
  const grepArgs = ["grep", "-n", "-E", "NEXT_PUBLIC_SUPABASE|@supabase/supabase-js|\\.supabase\\.co|createClient\\(|supabase\\.auth|supabase\\.from|auth/v1|rest/v1", "--", target];
  const result = spawnSync("git", grepArgs, {
    cwd: root,
    encoding: "utf8",
    shell: false
  });
  if (result.status === 0 && result.stdout.trim()) {
    const lines = result.stdout
      .trim()
      .split(/\r?\n/)
      .filter((line) => !excluded || !line.startsWith(`${excluded}/`));
    if (lines.length) {
      fail(`Direct browser Supabase usage found in client-side code:\n${lines.join("\n")}`);
    }
  }
}

console.log("deploy-check: env, git safety, PWA assets, seed files, and production-sensitive route files look good.");
console.log("deploy-check: running production build...");

const build = spawnSync(process.execPath, ["node_modules/next/dist/bin/next", "build"], {
  cwd: root,
  stdio: "inherit",
  shell: false
});

if (build.status !== 0) {
  fail("production build failed.");
}

if (warnings.length) {
  console.log(`deploy-check: completed with ${warnings.length} warning(s).`);
} else {
  console.log("deploy-check: ready for Vercel deploy.");
}
