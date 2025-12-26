const fs = require("fs");
const pdfParse = require("pdf-parse");

async function extractJDText(file) {
  if (!file || !file.path) {
    throw new Error("Invalid file object");
  }

  try {
    const buffer = fs.readFileSync(file.path);
    
    if (file.mimetype === "application/pdf" || file.originalname.endsWith(".pdf")) {
      const pdfData = await pdfParse(buffer);
      return pdfData.text.trim();
    }
    
    return buffer.toString("utf8").trim();
  } catch (err) {
    throw new Error(`Failed to extract JD: ${err.message}`);
  }
}

module.exports = { extractJDText };
