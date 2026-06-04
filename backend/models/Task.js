const mongoose = require("mongoose");
const { createModelWrapper } = require("./dbWrapper");

const taskSchema = new mongoose.Schema({

  title: {
    type: String,
    required: true
  },

  description: {
    type: String
  },

  status: {
    type: String,
    enum: ["Todo", "In Progress", "Done"],
    default: "Todo"
  },

  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project"
  },

  dueDate: {
    type: Date
  }

}, {
  timestamps: true
});

const TaskModel = mongoose.model("Task", taskSchema);
module.exports = createModelWrapper("Task", TaskModel);