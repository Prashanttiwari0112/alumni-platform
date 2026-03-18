const router = require("express").Router();
const { run, get, all } = require("../database/db");
const { authenticate, authorize } = require("../middleware/auth");
const parse = (j) => j ? { ...j, skills: JSON.parse(j.skills || "[]") } : null;

router.get("/", authenticate, async (req, res) => {
  try {
    const { type, status = "open" } = req.query;
    let q = "SELECT j.*, u.name as poster_name, u.avatar as poster_avatar FROM jobs j LEFT JOIN users u ON j.posted_by=u.id WHERE j.status=?";
    const p = [status];
    if (type) { q += " AND j.type=?"; p.push(type); }
    q += " ORDER BY j.created_at DESC";
    const jobs = await all(q, p);
    const enriched = await Promise.all(jobs.map(async j => {
      const applied = await get("SELECT id FROM job_applications WHERE job_id=? AND user_id=?", [j.id, req.user.id]);
      return { ...parse(j), applied: !!applied };
    }));
    res.json(enriched);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post("/", authenticate, authorize("alumni","admin"), async (req, res) => {
  try {
    const { title, company, description, location, type, skills = [] } = req.body;
    if (!title || !company) return res.status(400).json({ error: "Title and company required" });
    const { lastInsertRowid } = await run(
      "INSERT INTO jobs (title, company, description, location, type, skills, posted_by) VALUES (?,?,?,?,?,?,?)",
      [title, company, description, location, type || "Full-time", JSON.stringify(skills), req.user.id]
    );
    res.status(201).json(parse(await get("SELECT * FROM jobs WHERE id=?", [lastInsertRowid])));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post("/:id/apply", authenticate, async (req, res) => {
  try {
    const job = await get("SELECT * FROM jobs WHERE id=?", [req.params.id]);
    if (!job) return res.status(404).json({ error: "Job not found" });
    if (job.status !== "open") return res.status(400).json({ error: "Job is closed" });
    const existing = await get("SELECT id FROM job_applications WHERE job_id=? AND user_id=?", [job.id, req.user.id]);
    if (existing) return res.status(409).json({ error: "Already applied" });
    await run("INSERT INTO job_applications (job_id, user_id) VALUES (?,?)", [job.id, req.user.id]);
    res.json({ message: "Application submitted!" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete("/:id", authenticate, async (req, res) => {
  try {
    const job = await get("SELECT * FROM jobs WHERE id=?", [req.params.id]);
    if (!job) return res.status(404).json({ error: "Not found" });
    if (req.user.role !== "admin" && job.posted_by !== req.user.id) return res.status(403).json({ error: "Forbidden" });
    await run("DELETE FROM jobs WHERE id=?", [req.params.id]);
    res.json({ message: "Job deleted" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
