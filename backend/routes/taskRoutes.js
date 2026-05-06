const router = require("express").Router();

const Task = require("../models/Task");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/", authMiddleware, async (req, res) => {

  try {

    const task = await Task.create({
      title: req.body.title,
      description: req.body.description,
      assignedTo: req.body.assignedTo,
      projectId: req.body.projectId,
      dueDate: req.body.dueDate
    });

    res.status(201).json(task);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

});

router.get("/", authMiddleware, async (req, res) => {

  try {

    const tasks = await Task.find()
      .populate("assignedTo", "name email")
      .populate("projectId", "name");

    res.json(tasks);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

});

router.put("/:id", authMiddleware, async (req, res) => {

  try {

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updatedTask);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

});

module.exports = router;