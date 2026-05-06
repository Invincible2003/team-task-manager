const router = require("express").Router();

const Project = require("../models/Project");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/", authMiddleware, async (req, res) => {

  try {

    const project = await Project.create({
      name: req.body.name,
      description: req.body.description,
      createdBy: req.user.id
    });

    res.status(201).json(project);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

});

router.get("/", authMiddleware, async (req, res) => {

  try {

    const projects = await Project.find();

    res.json(projects);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

});

module.exports = router;