async function run() {
  try {
     const res = await fetch("https://text.pollinations.ai/models");
     console.log(res.status, await res.text());
  } catch(e) {
     console.log(e);
  }
}
run();
