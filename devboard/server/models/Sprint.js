const mongoose = require("mongoose");

const sprintSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    tasks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Task",
      },
    ],
    status: {
      type: String,
      enum: ["planning", "active", "completed"],
      default: "planning",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Sprint", sprintSchema);
