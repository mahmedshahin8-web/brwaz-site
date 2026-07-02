import { generateDiverseTopics } from "../../src/lib/gemini";

// Monkey patch fetch
const originalFetch = global.fetch;
global.fetch = function(url, options) {
   if (typeof url === 'string' && url.startsWith("/")) {
      url = "http://localhost:3000" + url;
   }
   return originalFetch(url, options);
};

(async () => {
    try {
        console.log("Generating diverse topics...");
        const result = await generateDiverseTopics("صناعة المحتوى", "gemini");
        console.log("Result:", JSON.stringify(result, null, 2));
    } catch (e) {
        console.error("Caught error:", e);
    }
})();
