const fs = require("fs");
const path = require("path");

const POSTS_DIR = path.join(__dirname, "posts");

// Output file
const OUTPUT_FILE = path.join(POSTS_DIR, "index.json");

function parseFrontMatter(content) {
  const txt = content.replace(/\r\n/g, "\n");
  const match = txt.match(/^---\n([\s\S]+?)\n---\n/);
  if (!match) return {};

  const fm = match[1];
  const metadata = {};
  fm.split("\n").forEach(line => {
    const [key, ...rest] = line.split(":");
    if (!key) return;
    metadata[key.trim()] = rest.join(":").trim();
  });

  const body = txt.slice(match[0].length);
  return { metadata, body };
}

// function getExcerpt(text, wordCount = 30) {
//   const words = text.split(/\s+/).filter(Boolean);
//   if (words.length <= wordCount) return words.join(" ");
//   return words.slice(0, wordCount).join(" ") + "…";
// }

function getExcerptByChars(text, maxChars = 175) {
  const words = text.split(/\s+/).filter(Boolean);
  let excerpt = "";
  
  for (let word of words) {
    if ((excerpt + (excerpt ? " " : "") + word).length > maxChars) break;
    excerpt += (excerpt ? " " : "") + word;
  }

  if (excerpt.length < text.length) excerpt += "…"; // add ellipsis if truncated
  return excerpt;
}

function generateIndex() {
  const files = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith(".md"));

  const index = files.map(file => {
    const id = path.basename(file, ".md");
    const content = fs.readFileSync(path.join(POSTS_DIR, file), "utf8");
    const { metadata, body } = parseFrontMatter(content);
    return {
      id,
      title: metadata.title ?? "Untitled",
      date: metadata.date ?? "0000-00-00",
      excerpt: getExcerptByChars(body)
    };
  });

  // sort by date descending
  // index.sort((a, b) => new Date(b.date) - new Date(a.date));
  index.sort((a, b) => b.id.localeCompare(a.date));

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(index, null, 2));
  console.log(`Generated ${OUTPUT_FILE} with ${index.length} posts.`);
}

generateIndex();
