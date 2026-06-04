const mongoose = require("mongoose");
const { createModelWrapper } = require("./dbWrapper");

const projectSchema = new mongoose.Schema({

  name: {
    type: String,
    required: true
  },

  description: {
    type: String
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ]

}, {
  timestamps: true
});

const ProjectModel = mongoose.model("Project", projectSchema);
module.exports = createModelWrapper("Project", ProjectModel);