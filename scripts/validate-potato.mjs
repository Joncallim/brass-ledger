import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const documentationRoot = "Brass Ledge Documentation";
const root = path.resolve(documentationRoot, "GROCER");
const wikiLinkPattern = /\[\[([^\]|#]+)(?:#[^\]|]+)?(?:\|[^\]]+)?\]\]/g;
const indexNotes = new Map([
  ["GROCER", "GROCER.md"],
  ["POTATO", "POTATO/POTATO.md"],
  ["CELERY", "CELERY/CELERY.md"],
  ["CARROT", "CARROT/CARROT.md"],
  ["CAPSICUM", "CAPSICUM/README.md"],
]);
const indexNotePaths = new Set([
  ...indexNotes.values(),
  "POTATO/README.md",
  "CELERY/README.md",
  "CARROT/README.md",
  "CAPSICUM/README.md",
].map((file) => path.resolve(root, file)));

async function listMarkdownFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(dir, entry.name);
      if (entry.isDirectory()) return listMarkdownFiles(entryPath);
      return entry.isFile() && entry.name.endsWith(".md") ? [entryPath] : [];
    }),
  );
  return files.flat();
}

function hasFrontmatter(markdown) {
  return markdown.startsWith("---\n") && markdown.indexOf("\n---", 4) !== -1;
}

function parseFrontmatter(markdown) {
  const end = markdown.indexOf("\n---", 4);
  if (end === -1) return new Map();
  const entries = new Map();
  for (const line of markdown.slice(4, end).split("\n")) {
    const match = /^([A-Za-z0-9_-]+):\s*(.*)$/.exec(line);
    if (match) entries.set(match[1], match[2]);
  }
  return entries;
}

function linkCandidates(filePath, target) {
  const normalized = target.replace(/\\([|#[\]])/g, "$1").replace(/\\$/g, "").replace(/\\/g, "/").replace(/\.md$/i, "");
  const candidates = [
    path.resolve(path.dirname(filePath), `${normalized}.md`),
    path.resolve(root, `${normalized}.md`),
    path.resolve(root, `${path.basename(normalized)}.md`),
  ];
  const indexNote = indexNotes.get(normalized) ?? indexNotes.get(path.basename(normalized));
  if (indexNote) candidates.push(path.resolve(root, indexNote));
  return candidates;
}

const files = await listMarkdownFiles(root);
const fileSet = new Set(files.map((file) => path.resolve(file)));
const failures = [];

for (const file of files) {
  const markdown = await readFile(file, "utf8");
  const relative = path.relative(".", file);
  if (!hasFrontmatter(markdown)) {
    failures.push(`${relative}: missing YAML frontmatter`);
    continue;
  }

  const frontmatter = parseFrontmatter(markdown);
  if (!frontmatter.has("type")) {
    failures.push(`${relative}: frontmatter must include type`);
  }
  if (!indexNotePaths.has(path.resolve(file)) && !markdown.includes("Backlink: [[")) {
    failures.push(`${relative}: missing Backlink`);
  }

  for (const match of markdown.matchAll(wikiLinkPattern)) {
    const target = match[1].trim();
    if (target.startsWith("http")) continue;
    const exists = linkCandidates(file, target).some((candidate) => fileSet.has(candidate));
    if (!exists) {
      failures.push(`${relative}: broken wikilink [[${target}]]`);
    }
  }
}

if (!fileSet.has(path.resolve(root, "GROCER.md"))) {
  failures.push(`${documentationRoot}/GROCER/GROCER.md: vault index is required`);
}

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(`Validated ${files.length} GROCER notes in ${documentationRoot}.`);
