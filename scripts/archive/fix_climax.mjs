import fs from 'fs';

const file = fs.readFileSync('src/lib/gemini.ts', 'utf8');

const strToFind = '    const climaxText = await callWithRetry(async () => {';

const idx1 = file.indexOf(strToFind);
if (idx1 !== -1) {
  const idx2 = file.indexOf(strToFind, idx1 + 1);
  if (idx2 !== -1) {
    const toDelete = file.substring(idx1, idx2);
    const newFile = file.substring(0, idx1) + file.substring(idx2);
    fs.writeFileSync('src/lib/gemini.ts', newFile);
    console.log("DELETION SUCCESS!");
  } else {
    console.log("SECOND INDEX NOT FOUND");
  }
} else {
  console.log("FIRST INDEX NOT FOUND");
}
