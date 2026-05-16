import { readFileSync } from "node:fs";

const failures = [];

function read(path) {
  return readFileSync(path, "utf8");
}

function fail(message) {
  failures.push(message);
}

const runtime = read("lib/practice/exercises.ts");
const explanations = read("lib/practice/explanations.ts");
const grammarPage = read("app/grammar/page.tsx");
const curatedTopics = read("lib/words/curated-topics.ts");
const pronounData = read("scripts/pronouns-content-data.mjs");
const latestPronounsMigration = read("supabase/migrations/20260516113000_fix_pronouns_ambiguity.sql");

const badBarePossessivePrompts = [
  "This is ___ book. Correct: my",
  "This is ___ pencil. Correct: your",
  "This is ___ dog. Correct: his",
  "This is ___ bag. Correct: her",
  "These are ___ toys. Correct: their",
  "This is ___ classroom. Correct: our",
  "Whose dog is this?"
];

for (const pattern of badBarePossessivePrompts) {
  if (pronounData.includes(`"${pattern}"`)) {
    fail(`Pronouns content data has ambiguous bare prompt: ${pattern}`);
  }
}

const requiredContextualPrompts = [
  "I have a book. This is ___ book. Correct: my",
  "You have a pencil. This is ___ pencil. Correct: your",
  "Tom has a dog. This is ___ dog. Correct: his",
  "Anna has a bag. This is ___ bag. Correct: her",
  "They have toys. These are ___ toys. Correct: their",
  "We have a classroom. This is ___ classroom. Correct: our"
];

for (const pattern of requiredContextualPrompts) {
  if (!pronounData.includes(pattern)) {
    fail(`Pronouns content data is missing contextual prompt: ${pattern}`);
  }
  if (!latestPronounsMigration.includes(pattern)) {
    fail(`Latest pronouns migration is missing contextual prompt: ${pattern}`);
  }
}

const possessiveBlock = runtime.match(/const possessiveGapExamples = \[([\s\S]*?)\];/);
if (!possessiveBlock) {
  fail("Could not find possessiveGapExamples in runtime practice generator.");
} else {
  const objects = possessiveBlock[1].split(/\n\s*},/).filter((item) => item.includes("prompt:"));
  for (const object of objects) {
    if (!object.includes("context:")) {
      fail(`Runtime possessive fill gap is missing context: ${object.trim().split("\n").join(" ")}`);
    }
  }
}

if (runtime.includes('prompt: "Whose dog is this?"')) {
  fail('Runtime generator contains ambiguous "Whose dog is this?" prompt.');
}

if (explanations.includes("Перевод недоступен")) {
  fail('Wrong-answer fallback must use the softer "Перевод пока не добавлен.", not "Перевод недоступен".');
}

for (const knownTranslation of [
  "have you got a dog",
  "whose pencils are these",
  "what are you doing",
  "anna has a bag this is her bag",
  "tom has a dog this is his dog",
  "they have toys these are their toys",
  "they are happy"
]) {
  if (!explanations.includes(`"${knownTranslation}"`)) {
    fail(`Missing known grammar answer translation: ${knownTranslation}`);
  }
}

for (const curatedKey of [
  "question_words",
  "pronouns_mixed",
  "days_time_prepositions",
  "demonstratives",
  "ing_actions"
]) {
  if (!curatedTopics.includes(`key: "${curatedKey}"`)) {
    fail(`Missing curated topic block: ${curatedKey}`);
  }
}

if (!grammarPage.includes("displayedItems") || !grammarPage.includes("isHardcodedGrammarDuplicate")) {
  fail("/grammar must de-duplicate hardcoded grammar blocks from DB grammar_patterns.");
}

if (failures.length) {
  console.error("content:check failed");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("content:check: ambiguity, known translations, curated topic blocks, and grammar de-dupe guards look good.");
