const express = require("express");
const { generateInterviewQuestions } = require("../services/interviewService");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    let { missingSkills, resumeText, jdText } = req.body || {};
    // Accept string payloads and coerce to array to avoid 400s from minor client mistakes.
    if (typeof missingSkills === "string") {
      missingSkills = missingSkills
        .split(/\r?\n|,/)
        .map((s) => s.trim())
        .filter(Boolean);
    }

    if (!Array.isArray(missingSkills) || missingSkills.length === 0) {
      return res.status(400).json({ error: "missingSkills array is required" });
    }

    const questions = await generateInterviewQuestions(
      missingSkills,
      resumeText || "",
      jdText || ""
    );
    res.json(questions);
  } catch (err) {
    console.error("Interview error:", err);
    res.status(500).json({ error: "Interview generation failed" });
  }
});

module.exports = router;
