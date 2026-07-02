import fs from 'fs';

let content = fs.readFileSync('server.ts', 'utf8');

const tableSearch = `  CREATE TABLE IF NOT EXISTS system_metrics (`;
const tableReplace = `  CREATE TABLE IF NOT EXISTS render_jobs (
    id TEXT PRIMARY KEY,
    projectId TEXT,
    status TEXT,
    progress INTEGER,
    videoUrl TEXT,
    logs TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  
  CREATE TABLE IF NOT EXISTS system_metrics (`;

if (!content.includes('CREATE TABLE IF NOT EXISTS render_jobs')) {
  content = content.replace(tableSearch, tableReplace);
}

const apiSearch = `  // Serve static uploads`;
const apiReplace = `  // --- HEADLESS RENDER ENGINE ---
  app.post("/api/render/start", async (req, res) => {
    try {
      const { projectId, scriptTimestamps } = req.body;
      const jobId = "job_" + Date.now().toString(36);
      console.log("[RNDR_ENGINE] Queuing new job:", jobId, "for project:", projectId);
      
      // Create initial job record
      db.prepare("INSERT INTO render_jobs (id, projectId, status, progress, logs) VALUES (?, ?, ?, ?, ?)").run(
        jobId, projectId, "QUEUED", 0, "[]"
      );
      
      // TODO: Background processor (Puppeteer + fluent-ffmpeg)
      // This will be triggered here once the user's Prompt Engine provides the precise Micro-Timestamps.
      
      res.json({ success: true, jobId, status: "QUEUED" });
    } catch (e: any) {
      console.error("[RNDR_ENGINE] Error:", e);
      res.status(500).json({ error: "Failed to queue render job" });
    }
  });

  app.get("/api/render/status/:jobId", (req, res) => {
    try {
      const job = db.prepare("SELECT * FROM render_jobs WHERE id = ?").get(req.params.jobId);
      if (job) {
        res.json({ success: true, job });
      } else {
        res.status(404).json({ error: "Job not found" });
      }
    } catch (e) {
      res.status(500).json({ error: "Failed to get render status" });
    }
  });

  // Serve static uploads`;

if (!content.includes('/api/render/start')) {
  content = content.replace(apiSearch, apiReplace);
}

fs.writeFileSync('server.ts', content);
console.log('Render Engine Scaffolding added to server.ts');
