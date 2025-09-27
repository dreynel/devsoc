const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigins = [
  "https://legendary-cat-097c25.netlify.app",
  "https://dulcet-druid-ebce06.netlify.app"
];

app.use(cors({
  origin: function(origin, callback){
    // allow requests with no origin (like Postman or server-to-server)
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1){
      const msg = "The CORS policy for this site does not allow access from the specified Origin.";
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ["GET", "POST"]
}));

app.use(bodyParser.json());

// MongoDB connection
const mongoURI = process.env.MONGODB_URI;
if (!mongoURI) {
  console.error("❌ MONGODB_URI is not defined in environment variables");
  process.exit(1);
}

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ Connected to MongoDB Atlas"))
.catch((err) => {
  console.error("❌ MongoDB connection error:", err);
  process.exit(1);
});

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
    const existing = await Student.findOne({
      $or: [{ email }, { contact }],
    });

    if (existing) {
      if (existing.email === email) return res.json({ success: false, error: "Email already registered." });
      if (existing.contact === contact) return res.json({ success: false, error: "Contact number already registered." });
    }

    const student = new Student({ firstName, lastName, address, course, contact, email, message });
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
  console.log(`✅ Backend running on port ${PORT}`);
});
