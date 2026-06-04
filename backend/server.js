const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
const authMiddleware = require("./middleware/authMiddleware");


app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json());

const mongoURI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/taskmanager";

mongoose.connect(mongoURI, {
  serverSelectionTimeoutMS: 3000,
  connectTimeoutMS: 3000,
})
  .then(() => {
    console.log("MongoDB Connected Successfully");
    global.mongoConnectionFailed = false;
  })
  .catch((err) => {
    global.mongoConnectionFailed = true;
    console.error("\n============================================================");
    console.error("DATABASE CONNECTION ERROR: Fallback to Local JSON DB Active!");
    console.error("Could not connect to MongoDB Atlas / Local MongoDB.");
    console.error("Reason:", err.message);
    console.error("\nWe have automatically enabled a local JSON-file fallback database.");
    console.error("You can fully use the app! All data is saved in 'backend/data/db.json'.");
    console.error("\nTo connect to a real database:");
    console.error("1. If using MongoDB Atlas, make sure your IP is whitelisted.");
    console.error("2. If using local MongoDB, start the service and check port 27017.");
    console.error("============================================================\n");
  });

app.get("/api/db-status", (req, res) => {
  res.json({
    connected: mongoose.connection.readyState === 1,
    uri: mongoURI.replace(/\/\/.*@/, "//***:***@"), // Hide password
  });
});

app.get("/", (req, res) => {
  res.send("API Running");
});

app.use("/api/auth", require("./routes/authRoutes"));
app.get("/api/protected", authMiddleware, (req, res) => {
  res.json({
    message: "Protected route working",
    user: req.user
  });
});
app.use("/api/projects", require("./routes/projectRoutes"));
app.use("/api/tasks", require("./routes/taskRoutes"));
const Task = require("./models/Task");

app.get("/api/dashboard", authMiddleware, async (req, res) => {

  try {

    const totalTasks = await Task.countDocuments();

    const completedTasks = await Task.countDocuments({
      status: "Done"
    });

    const pendingTasks = await Task.countDocuments({
      status: {
        $ne: "Done"
      }
    });

    const overdueTasks = await Task.countDocuments({
      dueDate: {
        $lt: new Date()
      },
      status: {
        $ne: "Done"
      }
    });

    res.json({
      totalTasks,
      completedTasks,
      pendingTasks,
      overdueTasks
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
// Trigger nodemon restart & Railway redeploy for Atlas connection recheck