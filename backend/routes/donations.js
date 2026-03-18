const router = require("express").Router();
const { run, get, all } = require("../database/db");
const { authenticate } = require("../middleware/auth");

router.get("/summary", authenticate, async (req, res) => {
  try {
    const { total } = await get("SELECT SUM(amount) as total FROM donations") || { total: 0 };
    const { cnt: count } = await get("SELECT COUNT(*) as cnt FROM donations");
    const topDonors = await all("SELECT u.id, u.name, u.avatar, SUM(d.amount) as total_donated FROM donations d JOIN users u ON d.donor_id=u.id GROUP BY d.donor_id ORDER BY total_donated DESC LIMIT 10");
    const byPurpose = await all("SELECT purpose, SUM(amount) as amount FROM donations GROUP BY purpose ORDER BY amount DESC");
    res.json({ total: total || 0, count, topDonors, byPurpose });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get("/mine", authenticate, async (req, res) => {
  try {
    const rows = await all("SELECT * FROM donations WHERE donor_id=? ORDER BY donated_at DESC", [req.user.id]);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post("/", authenticate, async (req, res) => {
  try {
    const { amount, purpose = "General Fund", message } = req.body;
    if (!amount || isNaN(amount) || amount <= 0) return res.status(400).json({ error: "Valid amount required" });
    const { lastInsertRowid } = await run("INSERT INTO donations (donor_id, amount, purpose, message) VALUES (?,?,?,?)", [req.user.id, parseFloat(amount), purpose, message]);
    res.status(201).json({ id: lastInsertRowid, amount: parseFloat(amount), purpose, message: "Donation recorded. Thank you!" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
