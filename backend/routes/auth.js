const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { run, get } = require("../database/db");
const { authenticate } = require("../middleware/auth");

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";
const JWT_EXPIRES = process.env.JWT_EXPIRES_IN || "7d";

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password required" });
    const user = await get("SELECT * FROM users WHERE email = ?", [email]);
    if (!user || !bcrypt.compareSync(password, user.password))
      return res.status(401).json({ error: "Invalid credentials" });
    const token = jwt.sign({ id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role = "alumni" } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: "Name, email and password required" });
    const exists = await get("SELECT id FROM users WHERE email = ?", [email]);
    if (exists) return res.status(409).json({ error: "Email already registered" });
    const hashed = bcrypt.hashSync(password, 10);
    const avatar = name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    const { lastInsertRowid: userId } = await run(
      "INSERT INTO users (name, email, password, role, avatar) VALUES (?, ?, ?, ?, ?)",
      [name, email, hashed, role, avatar]
    );
    const token = jwt.sign({ id: userId, name, email, role, avatar }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
    res.status(201).json({ token, user: { id: userId, name, email, role, avatar } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get("/me", authenticate, async (req, res) => {
  try {
    const user = await get("SELECT id, name, email, role, avatar, created_at FROM users WHERE id = ?", [req.user.id]);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
