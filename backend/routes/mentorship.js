const router = require("express").Router();
const { run, get, all } = require("../database/db");
const { authenticate } = require("../middleware/auth");

router.get("/mentors", authenticate, async (req, res) => {
  try {
    const rows = await all("SELECT a.*, u.name, u.email, u.avatar FROM alumni a JOIN users u ON a.user_id=u.id WHERE a.status='mentor' ORDER BY u.name ASC");
    res.json(rows.map(m => ({ ...m, skills: JSON.parse(m.skills || "[]") })));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get("/requests", authenticate, async (req, res) => {
  try {
    const rows = await all(
      "SELECT mr.*, mentor.name as mentor_name, mentor.avatar as mentor_avatar, mentee.name as mentee_name, mentee.avatar as mentee_avatar FROM mentorship_requests mr JOIN users mentor ON mr.mentor_id=mentor.id JOIN users mentee ON mr.mentee_id=mentee.id WHERE mr.mentor_id=? OR mr.mentee_id=? ORDER BY mr.requested_at DESC",
      [req.user.id, req.user.id]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post("/request", authenticate, async (req, res) => {
  try {
    const { mentor_id, message } = req.body;
    if (!mentor_id) return res.status(400).json({ error: "mentor_id required" });
    const mentor = await get("SELECT id FROM users WHERE id=?", [mentor_id]);
    if (!mentor) return res.status(404).json({ error: "Mentor not found" });
    const existing = await get("SELECT id FROM mentorship_requests WHERE mentor_id=? AND mentee_id=? AND status='pending'", [mentor_id, req.user.id]);
    if (existing) return res.status(409).json({ error: "Request already sent" });
    const { lastInsertRowid } = await run("INSERT INTO mentorship_requests (mentor_id, mentee_id, message) VALUES (?,?,?)", [mentor_id, req.user.id, message]);
    res.status(201).json({ id: lastInsertRowid, message: "Request sent!" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put("/requests/:id", authenticate, async (req, res) => {
  try {
    const { status } = req.body;
    if (!["accepted","rejected"].includes(status)) return res.status(400).json({ error: "Invalid status" });
    const r = await get("SELECT * FROM mentorship_requests WHERE id=?", [req.params.id]);
    if (!r) return res.status(404).json({ error: "Not found" });
    if (r.mentor_id !== req.user.id) return res.status(403).json({ error: "Only the mentor can respond" });
    await run("UPDATE mentorship_requests SET status=? WHERE id=?", [status, req.params.id]);
    res.json({ message: `Request ${status}` });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
