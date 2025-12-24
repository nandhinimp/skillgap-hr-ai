"use client";

import { useState } from "react";

export default function Home() {
  const [resume, setResume] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!resume || !jobDescription) {
      setError("Please upload resume and enter job description");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    const formData = new FormData();
    formData.append("resume", resume);
    formData.append("jobDescription", jobDescription);

    try {
      const response = await fetch("http://localhost:5000/analyze", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Backend error");
      }

      const data = await response.json();
      // backend returns { analysis: ... }
      setResult(data.analysis || data);
    } catch (err) {
      console.error(err);
      setError("Failed to analyze resume");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ maxWidth: 700, margin: "40px auto", fontFamily: "Arial" }}>
      <h1>AI Resume Analyzer</h1>

      <div style={{ marginBottom: 20 }}>
        <label><b>Upload Resume (PDF)</b></label><br />
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setResume(e.target.files?.[0] || null)}
        />
      </div>

      <div style={{ marginBottom: 20 }}>
        <label><b>Job Description</b></label><br />
        <textarea
          rows={6}
          style={{ width: "100%" }}
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
        />
      </div>

      <button onClick={handleSubmit} disabled={loading}>
        {loading ? "Analyzing..." : "Analyze Resume"}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {result && (
        <div style={{ marginTop: 40 }}>
          <h2>Analysis Result</h2>
          {result.rawOutput ? (
            <pre style={{ whiteSpace: "pre-wrap" }}>{result.rawOutput}</pre>
          ) : (
            <>
              <p><b>Match Score:</b> {result.matchScore}%</p>

              <h3>Missing Skills</h3>
              <ul>
                {result.missingSkills?.map((skill: string, i: number) => (
                  <li key={i}>{skill}</li>
                ))}
              </ul>

              <h3>Overall Feedback</h3>
              <p>{result.overallFeedback}</p>
            </>
          )}
        </div>
      )}
    </main>
  );
}
