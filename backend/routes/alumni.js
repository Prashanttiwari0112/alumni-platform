const router = require("express").Router();
const { run, get, all } = require("../database/db");
const { authenticate, authorize } = require("../middleware/auth");

const parse = (a) => a ? { ...a, skills: JSON.parse(a.skills || "[]") } : null;

router.get("/", authenticate, async (req, res) => {
  try {
    const { search, status, batch, dept } = req.query;
    let q = "SELECT a.*, u.name, u.email, u.avatar FROM alumni a JOIN users u ON a.user_id = u.id WHERE 1=1";
    const p = [];
    if (search) { q += " AND (u.name LIKE ? OR a.company LIKE ? OR a.department LIKE ?)"; const s = `%${search}%`; p.push(s, s, s); }
    if (status) { q += " AND a.status = ?"; p.push(status); }
    if (batch)  { q += " AND a.batch = ?";  p.push(batch); }
    if (dept)   { q += " AND a.department = ?"; p.push(dept); }
    q += " ORDER BY a.created_at DESC";
    const rows = await all(q, p);
    res.json(rows.map(parse));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get("/:id", authenticate, async (req, res) => {
  try {
    const row = await get("SELECT a.*, u.name, u.email, u.avatar FROM alumni a JOIN users u ON a.user_id = u.id WHERE a.id = ?", [req.params.id]);
    if (!row) return res.status(404).json({ error: "Alumni not found" });
    res.json(parse(row));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post("/", authenticate, async (req, res) => {
  try {
    const { user_id, batch, department, job_title, company, location, phone, linkedin, skills = [], status = "active", bio } = req.body;
    if (!batch || !department) return res.status(400).json({ error: "Batch and department required" });
    const uid = user_id || req.user.id;
    const { lastInsertRowid } = await run(
      "INSERT INTO alumni (user_id, batch, department, job_title, company, location, phone, linkedin, skills, status, bio) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [uid, batch, department, job_title, company, location, phone, linkedin, JSON.stringify(skills), status, bio]
    );
    const row = await get("SELECT a.*, u.name, u.email, u.avatar FROM alumni a JOIN users u ON a.user_id = u.id WHERE a.id = ?", [lastInsertRowid]);
    res.status(201).json(parse(row));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put("/:id", authenticate, async (req, res) => {
  try {
    const existing = await get("SELECT * FROM alumni WHERE id = ?", [req.params.id]);
    if (!existing) return res.status(404).json({ error: "Alumni not found" });
    if (req.user.role !== "admin" && existing.user_id !== req.user.id) return res.status(403).json({ error: "Forbidden" });
    const { batch, department, job_title, company, location, phone, linkedin, skills, status, bio } = req.body;
    await run(
      "UPDATE alumni SET batch=COALESCE(?,batch), department=COALESCE(?,department), job_title=COALESCE(?,job_title), company=COALESCE(?,company), location=COALESCE(?,location), phone=COALESCE(?,phone), linkedin=COALESCE(?,linkedin), skills=COALESCE(?,skills), status=COALESCE(?,status), bio=COALESCE(?,bio), updated_at=CURRENT_TIMESTAMP WHERE id=?",
      [batch, department, job_title, company, location, phone, linkedin, skills ? JSON.stringify(skills) : null, status, bio, req.params.id]
    );
    const updated = await get("SELECT a.*, u.name, u.email, u.avatar FROM alumni a JOIN users u ON a.user_id = u.id WHERE a.id = ?", [req.params.id]);
    res.json(parse(updated));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete("/:id", authenticate, authorize("admin"), async (req, res) => {
  try {
    const ex = await get("SELECT id FROM alumni WHERE id = ?", [req.params.id]);
    if (!ex) return res.status(404).json({ error: "Alumni not found" });
    await run("DELETE FROM alumni WHERE id = ?", [req.params.id]);
    res.json({ message: "Alumni deleted" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
