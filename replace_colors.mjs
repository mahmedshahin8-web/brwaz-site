import fs from "fs";
const file = "src/pages/ContentCreationPage.tsx";
let code = fs.readFileSync(file, "utf8");

const replaces = [
  { from: /bg-black\/80/g, to: "bg-white/80" },
  { from: /bg-black\b/g, to: "bg-white" }
];

replaces.forEach(r => {
  code = code.replace(r.from, r.to);
});

fs.writeFileSync(file, code, "utf8");
console.log("Cleaned bg-black");
