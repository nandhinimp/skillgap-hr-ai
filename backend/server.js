require("dotenv").config();
const express = require("express");
const cors = require("cors");

const analyzeRoute = require("./routes/analyze");
const interviewRoute = require("./routes/interview");
const evaluateRoute = require("./routes/evaluate");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/analyze", analyzeRoute);
app.use("/interview", interviewRoute);
app.use("/evaluate-answer", evaluateRoute);

app.listen(5000, () =>
  console.log("🚀 Backend running at http://localhost:5000")
);
