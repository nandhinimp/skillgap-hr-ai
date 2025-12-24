require("dotenv").config();
const express = require("express");
const cors = require("cors");
const analyzeRoute = require("./routes/analyze");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/analyze", analyzeRoute);

app.listen(5000, () => {
  console.log("🚀 Backend running at http://localhost:5000");
});
