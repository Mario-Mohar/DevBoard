const express = require("express");
const router = express.Router();
const Sprint = require("../models/Sprint");
const { protect } = require("../middleware/auth");

// GET /api/sprints/active — get the current active sprint
router.get("/active", protect, async (req, res) => {
  try {
    const sprint = await Sprint.findOne({ status: "active" }).sort({
      startDate: -1,
    });
    res.json(sprint);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
