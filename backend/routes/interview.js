const express = require("express");
const { generateInterviewQuestions } = require("../Services/interviewService");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { missingSkills } = req.body || {};
    if (!Array.isArray(missingSkills)) {
      return res.status(400).json({ error: "missingSkills array is required" });
    }

    const questions = await generateInterviewQuestions(missingSkills);
    res.json(questions);
  } catch (err) {
    console.error("Interview error:", err);
    res.status(500).json({ error: "Interview generation failed" });
  }
});

module.exports = router;
