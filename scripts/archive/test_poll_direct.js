async function run() {
  const start = Date.now();
  try {
    const res = await fetch("https://text.pollinations.ai/Tell%20me%20a%20short%20joke");
    const text = await res.text();
    console.log(res.status, text.substring(0, 100), Date.now() - start, "ms");
  } catch(e) {
    console.log("Error", e.message);
  }
}
run();
