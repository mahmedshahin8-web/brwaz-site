const fs = require("fs");
const content = fs.readFileSync("src/pages/ContentCreationPage.tsx", "utf-8");
const matches = content.match(/type: "([^"]+)"/g);
const counts = {};
let duplicate = false;
matches.forEach(m => {
  if (counts[m]) {
    console.log("Duplicate found:", m);
    duplicate = true;
  }
  counts[m] = true;
});
if (!duplicate) console.log("No duplicates found in types.");
