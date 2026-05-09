import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const requiredEnv = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"];
const placeholderPatterns = [/your-/i, /placeholder/i, /example/i, /changeme/i, /supabase-anon-key/i];

function readEnvFile(fileName) {
  const filePath = resolve(root, fileName);
  if (!existsSync(filePath)) return {};

  return readFileSync(filePath, "utf8")
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

function fail(message) {
  console.error(`deploy-check failed: ${message}`);
  process.exit(1);
}

const localEnv = { ...readEnvFile(".env"), ...readEnvFile(".env.local"), ...process.env };

for (const key of requiredEnv) {
  const value = localEnv[key];
  if (!value) fail(`${key} is missing. Add it locally and in Vercel Project Settings -> Environment Variables.`);
  if (placeholderPatterns.some((pattern) => pattern.test(value))) fail(`${key} still looks like a placeholder.`);
}

if (!localEnv.NEXT_PUBLIC_SUPABASE_URL.startsWith("https://")) {
  fail("NEXT_PUBLIC_SUPABASE_URL must be an HTTPS Supabase project URL.");
}

const requiredFiles = [
  "app/manifest.ts",
  "public/sw.js",
  "public/icons/icon-192.svg",
  "public/icons/icon-512.svg",
  "public/samples/cards-import-sample.csv",
  "next.config.mjs",
  "package-lock.json"
];

for (const file of requiredFiles) {
  if (!existsSync(resolve(root, file))) fail(`Required deploy asset is missing: ${file}`);
}

const packageJson = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8"));
for (const script of ["dev", "build", "start", "typecheck", "content:report"]) {
  if (!packageJson.scripts?.[script]) fail(`package.json script is missing: ${script}`);
}

console.log("deploy-check: env and assets look good. Running production build...");

const build = spawnSync(process.execPath, ["node_modules/next/dist/bin/next", "build"], {
  cwd: root,
  stdio: "inherit",
  shell: false
});

if (build.status !== 0) {
  fail("npm run build failed.");
}

console.log("deploy-check: ready for Vercel deploy.");
