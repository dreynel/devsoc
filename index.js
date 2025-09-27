const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = 5000;

// Middleware
// app.use(cors());

// Or allow only your frontend
app.use(cors({
    origin: "https://legendary-cat-097c25.netlify.app",
    methods: ["GET", "POST"]
  }));

app.use(bodyParser.json());



// MongoDB connection (with dbdevsoc as database name)
mongoose.connect("mongodb+srv://bjohnlenard_db_user:LaXMU2UBzDstjOiw@cluster0.7up5ery.mongodb.net/dbdevsoc?retryWrites=true&w=majority&appName=Cluster0", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ Connected to MongoDB Atlas (dbdevsoc)"))
.catch((err) => console.error("❌ MongoDB connection error:", err));

// Schema & Model
const studentSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  address: String,
  course: String,
  contact: { type: String, unique: true },
  email: { type: String, unique: true },
  message: String,
  createdAt: { type: Date, default: Date.now },
});

const Student = mongoose.model("Student", studentSchema);

// Test route
app.get("/", (req, res) => {
  res.send("API is running with MongoDB (dbdevsoc) 🚀");
});

// Register student
app.post("/register", async (req, res) => {
  const { firstName, lastName, address, course, contact, email, message } = req.body;

  try {
    // Check duplicate email/contact
    const existing = await Student.findOne({
      $or: [{ email: email }, { contact: contact }],
    });

    if (existing) {
      if (existing.email === email) {
        return res.json({ success: false, error: "Email already registered." });
      }
      if (existing.contact === contact) {
        return res.json({ success: false, error: "Contact number already registered." });
      }
    }

    // Insert new student
    const student = new Student({
      firstName,
      lastName,
      address,
      course,
      contact,
      email,
      message,
    });

    await student.save();
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Server error." });
  }
});

// Get all students
app.get("/students", async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });
    res.json(students);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Server error." });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});
