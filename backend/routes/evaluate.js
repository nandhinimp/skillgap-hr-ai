const express = require("express");
const { evaluateAnswer } = require("./services/evaluationService");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { question, answer } = req.body || {};
    const trimmedAnswer = (answer || "").trim();
    if (!question || !trimmedAnswer) {
      return res.status(400).json({ error: "Question and a non-empty answer are required" });
    }

    const feedback = await evaluateAnswer(question, trimmedAnswer);
    res.json(feedback);
  } catch (err) {
    console.error("Evaluation error:", err);
    res.status(500).json({ error: "Evaluation failed" });
  }
});

module.exports = router;
