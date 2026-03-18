const router = require("express").Router();
const { get, all } = require("../database/db");
const { authenticate } = require("../middleware/auth");

router.get("/dashboard", authenticate, async (req, res) => {
  try {
    const { c: totalAlumni }    = await get("SELECT COUNT(*) as c FROM alumni");
    const { c: activeAlumni }   = await get("SELECT COUNT(*) as c FROM alumni WHERE status='active'");
    const { c: mentors }        = await get("SELECT COUNT(*) as c FROM alumni WHERE status='mentor'");
    const { c: totalEvents }    = await get("SELECT COUNT(*) as c FROM events");
    const { c: upcomingEvents } = await get("SELECT COUNT(*) as c FROM events WHERE status='upcoming'");
    const { t: totalDonations } = await get("SELECT SUM(amount) as t FROM donations") || { t: 0 };
    const { c: totalJobs }      = await get("SELECT COUNT(*) as c FROM jobs WHERE status='open'");
    const byDept = await all("SELECT department, COUNT(*) as count FROM alumni GROUP BY department ORDER BY count DESC");
    const recentRows = await all("SELECT a.*, u.name, u.email, u.avatar FROM alumni a JOIN users u ON a.user_id=u.id ORDER BY a.created_at DESC LIMIT 5");
    const recentAlumni = recentRows.map(a => ({ ...a, skills: JSON.parse(a.skills || "[]") }));
    res.json({ totalAlumni, activeAlumni, mentors, totalEvents, upcomingEvents, totalDonations: totalDonations || 0, totalJobs, byDept, recentAlumni });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
