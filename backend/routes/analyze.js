const express = require("express");
const multer = require("multer");
const fs = require("fs");
const { analyzeResume } = require("../Services/resumeAnalyzer");
const { extractJDText } = require("../Services/jdExtractor");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/", upload.fields([
  { name: "resume", maxCount: 1 },
  { name: "jobDescriptionFile", maxCount: 1 }
]), async (req, res) => {
  const uploadedFiles = [];
  try {
    if (!req.files || !req.files.resume || req.files.resume.length === 0) {
      return res.status(400).json({ error: "Resume PDF is required" });
    }

    const resumeFile = req.files.resume[0];
    uploadedFiles.push(resumeFile.path);

    let jobDescription = (req.body?.jobDescription || "").trim();
    
    if (req.files?.jobDescriptionFile && req.files.jobDescriptionFile.length > 0) {
      try {
        jobDescription = await extractJDText(req.files.jobDescriptionFile[0]);
        uploadedFiles.push(req.files.jobDescriptionFile[0].path);
      } catch (e) {
        console.error("JD extraction error:", e);
        return res.status(400).json({ error: "Failed to read job description file" });
      }
    }

    if (!jobDescription) {
      return res.status(400).json({ error: "Job description (text or PDF) is required" });
    }

    const analysis = await analyzeResume(resumeFile.path, jobDescription);
    res.json({ analysis });
  } catch (err) {
    console.error("Analyze error:", err.message, err.stack);
    const status = err.message && err.message.includes("unreadable") ? 400 : 500;
    res.status(status).json({ error: err.message || "Analysis failed" });
  } finally {
    uploadedFiles.forEach(file => {
      try {
        if (fs.existsSync(file)) fs.unlinkSync(file);
      } catch (e) {
        console.warn("Failed to cleanup file:", file);
      }
    });
  }
});

module.exports = router;
