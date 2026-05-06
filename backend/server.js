const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
const authMiddleware = require("./middleware/authMiddleware");

const cors = require("cors");

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
}));
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected"))
.catch((err) => console.log(err));

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