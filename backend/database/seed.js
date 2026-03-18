require("dotenv").config({ path: require("path").join(__dirname, "../.env.example") });
const bcrypt = require("bcryptjs");
const { run, get, all, exec } = require("./db");

const HASH = bcrypt.hashSync("password123", 10);

const usersData = [
  { name: "Admin User",      email: "admin@alumni.edu",   role: "admin",   avatar: "AU" },
  { name: "Priya Sharma",    email: "priya@alumni.edu",   role: "alumni",  avatar: "PS" },
  { name: "Arjun Mehta",     email: "arjun@alumni.edu",   role: "alumni",  avatar: "AM" },
  { name: "Sneha Patel",     email: "sneha@alumni.edu",   role: "alumni",  avatar: "SP" },
  { name: "Rahul Nair",      email: "rahul@alumni.edu",   role: "alumni",  avatar: "RN" },
  { name: "Ananya Roy",      email: "ananya@alumni.edu",  role: "alumni",  avatar: "AR" },
  { name: "Vikram Singh",    email: "vikram@alumni.edu",  role: "alumni",  avatar: "VS" },
  { name: "Meera Krishnan",  email: "meera@alumni.edu",   role: "alumni",  avatar: "MK" },
  { name: "Karan Gupta",     email: "karan@alumni.edu",   role: "alumni",  avatar: "KG" },
  { name: "Student User",    email: "student@alumni.edu", role: "student", avatar: "SU" },
];

const alumniData = [
  { email: "priya@alumni.edu",  batch: "2019", dept: "Computer Science", title: "Senior SDE",        company: "Google",      location: "Bangalore", phone: "+91 98765 43210", skills: ["React","Node.js","ML"],          status: "mentor", bio: "Passionate about AI and open source." },
  { email: "arjun@alumni.edu",  batch: "2018", dept: "Electronics",      title: "Product Manager",   company: "Microsoft",   location: "Hyderabad", phone: "+91 91234 56789", skills: ["Product","Agile","Data"],        status: "active", bio: "Building products that matter." },
  { email: "sneha@alumni.edu",  batch: "2020", dept: "Mechanical",        title: "Design Engineer",   company: "Tata Motors", location: "Pune",      phone: "+91 87654 32109", skills: ["CAD","SolidWorks","FEA"],        status: "mentor", bio: "EV enthusiast and designer." },
  { email: "rahul@alumni.edu",  batch: "2017", dept: "Civil",             title: "Project Director",  company: "L&T",         location: "Mumbai",    phone: "+91 76543 21098", skills: ["Construction","AutoCAD","PM"],   status: "active", bio: "Building India's infrastructure." },
  { email: "ananya@alumni.edu", batch: "2021", dept: "Computer Science",  title: "Data Scientist",    company: "Amazon",      location: "Chennai",   phone: "+91 65432 10987", skills: ["Python","TensorFlow","SQL"],     status: "mentor", bio: "Data tells stories." },
  { email: "vikram@alumni.edu", batch: "2016", dept: "MBA",               title: "VP Finance",        company: "HDFC Bank",   location: "Delhi",     phone: "+91 54321 09876", skills: ["Finance","Strategy","Risk"],     status: "donor",  bio: "Giving back to the next generation." },
  { email: "meera@alumni.edu",  batch: "2022", dept: "Biotech",           title: "Research Associate",company: "Biocon",      location: "Bangalore", phone: "+91 43210 98765", skills: ["Genomics","CRISPR","Lab"],       status: "active", bio: "Science is the future." },
  { email: "karan@alumni.edu",  batch: "2015", dept: "Electronics",       title: "CTO",               company: "Startup X",   location: "Pune",      phone: "+91 32109 87654", skills: ["IoT","Embedded","Python"],       status: "donor",  bio: "Serial entrepreneur." },
];

const eventsData = [
  { title: "Annual Alumni Meet 2025",     desc: "Grand annual gathering.", date: "2025-03-15", location: "Main Auditorium",    type: "Networking",  capacity: 300, status: "upcoming" },
  { title: "Tech Talk: AI in Industry",   desc: "AI adoption insights.",   date: "2025-02-20", location: "Seminar Hall B",      type: "Seminar",     capacity: 100, status: "upcoming" },
  { title: "Founders & Fundraisers Gala", desc: "Exclusive donor evening.",date: "2025-04-10", location: "Convention Centre",   type: "Fundraiser",  capacity: 200, status: "upcoming" },
  { title: "Campus Mentorship Day",       desc: "One-on-one mentoring.",   date: "2024-12-10", location: "Multiple Classrooms", type: "Mentorship",  capacity: 60,  status: "completed" },
  { title: "Career & Placement Fair",     desc: "Meet top recruiters.",    date: "2025-05-22", location: "Sports Complex",      type: "Placement",   capacity: 500, status: "upcoming" },
];

const jobsData = [
  { title: "Frontend Developer",  company: "Google",    desc: "Work on large-scale React apps.", location: "Bangalore", type: "Full-time",  skills: ["React","TypeScript"], poster: "priya@alumni.edu" },
  { title: "Data Science Intern", company: "Amazon",    desc: "Analyze customer behavior data.", location: "Chennai",   type: "Internship", skills: ["Python","ML"],        poster: "ananya@alumni.edu" },
  { title: "Product Manager",     company: "Microsoft", desc: "Drive product roadmap.",          location: "Hyderabad", type: "Full-time",  skills: ["Product","Analytics"],poster: "arjun@alumni.edu" },
  { title: "DevOps Engineer",     company: "Startup X", desc: "Build CI/CD pipelines.",          location: "Pune",      type: "Full-time",  skills: ["Docker","Kubernetes"],poster: "karan@alumni.edu" },
];

const donationsData = [
  { email: "priya@alumni.edu",  amount: 5000,  purpose: "Student Scholarships" },
  { email: "arjun@alumni.edu",  amount: 12000, purpose: "Infrastructure Development" },
  { email: "sneha@alumni.edu",  amount: 2000,  purpose: "Research & Labs" },
  { email: "rahul@alumni.edu",  amount: 25000, purpose: "Student Scholarships" },
  { email: "ananya@alumni.edu", amount: 3500,  purpose: "Sports & Culture" },
  { email: "vikram@alumni.edu", amount: 50000, purpose: "General Fund" },
  { email: "meera@alumni.edu",  amount: 1000,  purpose: "Research & Labs" },
  { email: "karan@alumni.edu",  amount: 75000, purpose: "General Fund" },
];

async function seed() {
  console.log("🌱 Seeding database...");

  // Wait for schema to be ready
  await new Promise(r => setTimeout(r, 500));

  // Users
  for (const u of usersData) {
    await run(
      "INSERT OR IGNORE INTO users (name, email, password, role, avatar) VALUES (?, ?, ?, ?, ?)",
      [u.name, u.email, HASH, u.role, u.avatar]
    );
  }

  // Alumni profiles
  for (const a of alumniData) {
    const user = await get("SELECT id FROM users WHERE email = ?", [a.email]);
    if (user) {
      await run(
        `INSERT OR IGNORE INTO alumni (user_id, batch, department, job_title, company, location, phone, skills, status, bio)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [user.id, a.batch, a.dept, a.title, a.company, a.location, a.phone, JSON.stringify(a.skills), a.status, a.bio]
      );
    }
  }

  // Events
  for (const e of eventsData) {
    await run(
      "INSERT OR IGNORE INTO events (title, description, event_date, location, type, capacity, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [e.title, e.desc, e.date, e.location, e.type, e.capacity, e.status]
    );
  }

  // Jobs
  for (const j of jobsData) {
    const user = await get("SELECT id FROM users WHERE email = ?", [j.poster]);
    if (user) {
      await run(
        "INSERT OR IGNORE INTO jobs (title, company, description, location, type, skills, posted_by) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [j.title, j.company, j.desc, j.location, j.type, JSON.stringify(j.skills), user.id]
      );
    }
  }

  // Donations
  await run("DELETE FROM donations");
  for (const d of donationsData) {
    const user = await get("SELECT id FROM users WHERE email = ?", [d.email]);
    if (user) {
      await run(
        "INSERT INTO donations (donor_id, amount, purpose) VALUES (?, ?, ?)",
        [user.id, d.amount, d.purpose]
      );
    }
  }

  console.log("✅ Database seeded successfully!");
  console.log("\n📋 Login credentials (password: password123):");
  console.log("   Admin   → admin@alumni.edu");
  console.log("   Alumni  → priya@alumni.edu");
  console.log("   Student → student@alumni.edu\n");
  process.exit(0);
}

seed().catch(err => { console.error("Seed failed:", err); process.exit(1); });
