/* Stamps the shared chunks (head, header, footer) from partials/ into every
   page. Run `node stamp.js` after editing anything in partials/.

   In a page, a stamped region looks like:

     <!-- @stamp header -->
     ...whatever is here gets overwritten...
     <!-- @end header -->

   The name is the filename in partials/. The nav link matching the page's
   own filename gets aria-current="page" added on the way in. */

const fs = require("fs");
const path = require("path");

const root = __dirname;
const partialsDir = path.join(root, "partials");

const partials = {};
for (const file of fs.readdirSync(partialsDir)) {
  if (file.endsWith(".html")) {
    partials[file.replace(/\.html$/, "")] = fs.readFileSync(path.join(partialsDir, file), "utf8").trimEnd();
  }
}

function markCurrent(html, page) {
  return html.replace(
    new RegExp('(<a href="' + page.replace(/\./g, "\\.") + '")(?=>)'),
    '$1 aria-current="page"'
  );
}

let changed = 0;
let failed = false;

for (const page of fs.readdirSync(root).filter(f => f.endsWith(".html"))) {
  const file = path.join(root, page);
  const before = fs.readFileSync(file, "utf8");

  const after = before.replace(
    /([ \t]*)<!-- @stamp ([\w-]+) -->[\s\S]*?<!-- @end \2 -->/g,
    (whole, indent, name) => {
      if (!partials[name]) {
        console.error(`${page}: no partials/${name}.html`);
        failed = true;
        return whole;
      }
      const body = markCurrent(partials[name], page)
        .split("\n")
        .map(line => (line ? indent + line : line))
        .join("\n");
      return `${indent}<!-- @stamp ${name} -->\n${body}\n${indent}<!-- @end ${name} -->`;
    }
  );

  if (after !== before) {
    fs.writeFileSync(file, after);
    console.log("updated " + page);
    changed++;
  }
}

if (failed) process.exit(1);
console.log(changed ? `${changed} file(s) updated.` : "Everything already up to date.");
