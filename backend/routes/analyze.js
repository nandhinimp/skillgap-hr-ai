const express = require("express");
const multer = require("multer");
const { analyzeResume } = require("../services/resumeAnalyzer");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/", upload.single("resume"), async (req, res) => {
  try {
    const jobDescription = req.body.jobDescription;

    if (!req.file || !jobDescription) {
      return res.status(400).json({ error: "Resume and job description are required" });
    }

    const analysis = await analyzeResume(req.file.path, jobDescription);

    res.json({ analysis });
  } catch (err) {
    console.error("Analyze error:", err);
    res.status(500).json({ error: "Analysis failed" });
  }
});

module.exports = router;
