const express = require("express");
const { evaluateAnswer } = require("../Services/evaluationService");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { question, answer } = req.body || {};
    if (!question || !answer) {
      return res.status(400).json({ error: "Question and answer required" });
    }

    const feedback = await evaluateAnswer(question, answer);
    res.json(feedback);
  } catch (err) {
    console.error("Evaluation error:", err);
    res.status(500).json({ error: "Evaluation failed" });
  }
});

module.exports = router;
