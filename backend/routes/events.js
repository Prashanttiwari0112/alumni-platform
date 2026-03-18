const router = require("express").Router();
const { run, get, all } = require("../database/db");
const { authenticate, authorize } = require("../middleware/auth");

router.get("/", authenticate, async (req, res) => {
  try {
    const { status, type } = req.query;
    let q = "SELECT * FROM events WHERE 1=1"; const p = [];
    if (status) { q += " AND status=?"; p.push(status); }
    if (type)   { q += " AND type=?";   p.push(type); }
    q += " ORDER BY event_date ASC";
    const events = await all(q, p);
    const enriched = await Promise.all(events.map(async ev => {
      const { cnt: attendees } = await get("SELECT COUNT(*) as cnt FROM event_registrations WHERE event_id=?", [ev.id]);
      const reg = await get("SELECT id FROM event_registrations WHERE event_id=? AND user_id=?", [ev.id, req.user.id]);
      return { ...ev, attendees, registered: !!reg };
    }));
    res.json(enriched);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get("/:id", authenticate, async (req, res) => {
  try {
    const ev = await get("SELECT * FROM events WHERE id=?", [req.params.id]);
    if (!ev) return res.status(404).json({ error: "Event not found" });
    const { cnt: attendees } = await get("SELECT COUNT(*) as cnt FROM event_registrations WHERE event_id=?", [ev.id]);
    const reg = await get("SELECT id FROM event_registrations WHERE event_id=? AND user_id=?", [ev.id, req.user.id]);
    res.json({ ...ev, attendees, registered: !!reg });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post("/", authenticate, authorize("admin"), async (req, res) => {
  try {
    const { title, description, event_date, location, type, capacity } = req.body;
    if (!title || !event_date) return res.status(400).json({ error: "Title and date required" });
    const { lastInsertRowid } = await run(
      "INSERT INTO events (title, description, event_date, location, type, capacity, created_by) VALUES (?,?,?,?,?,?,?)",
      [title, description, event_date, location, type, capacity || 100, req.user.id]
    );
    res.status(201).json(await get("SELECT * FROM events WHERE id=?", [lastInsertRowid]));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post("/:id/register", authenticate, async (req, res) => {
  try {
    const ev = await get("SELECT * FROM events WHERE id=?", [req.params.id]);
    if (!ev) return res.status(404).json({ error: "Event not found" });
    if (ev.status !== "upcoming") return res.status(400).json({ error: "Not open for registration" });
    const existing = await get("SELECT id FROM event_registrations WHERE event_id=? AND user_id=?", [ev.id, req.user.id]);
    if (existing) {
      await run("DELETE FROM event_registrations WHERE event_id=? AND user_id=?", [ev.id, req.user.id]);
      return res.json({ registered: false, message: "Unregistered" });
    }
    const { cnt } = await get("SELECT COUNT(*) as cnt FROM event_registrations WHERE event_id=?", [ev.id]);
    if (cnt >= ev.capacity) return res.status(400).json({ error: "Event is full" });
    await run("INSERT INTO event_registrations (event_id, user_id) VALUES (?,?)", [ev.id, req.user.id]);
    res.json({ registered: true, message: "Registered successfully" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete("/:id", authenticate, authorize("admin"), async (req, res) => {
  try {
    await run("DELETE FROM events WHERE id=?", [req.params.id]);
    res.json({ message: "Event deleted" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
