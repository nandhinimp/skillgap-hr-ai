"use client";

import { useState } from "react";

export default function Home() {
  const [resume, setResume] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [questions, setQuestions] = useState<Array<{ skill: string; question: string }>>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<any[]>([]);

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
        <div style={{ marginTop: "20px" }}>
          <h2>Analysis Result</h2>

          {/* Match Score */}
          <p><strong>Match Score:</strong> {result.matchScore}%</p>

          {/* Missing Skills */}
          <div style={{ marginTop: "10px" }}>
            <strong>Missing Skills:</strong>
            {result.missingSkills && result.missingSkills.length > 0 ? (
              <ul>
                {result.missingSkills.map((skill: string, index: number) => (
                  <li key={index}>{skill}</li>
                ))}
              </ul>
            ) : (
              <p>None 🎉</p>
            )}
          </div>

          {/* Overall Feedback */}
          <div style={{ marginTop: "10px" }}>
            <strong>Overall Feedback:</strong>
            <p>{result.overallFeedback}</p>
          </div>

          {/* Practice CTA */}
          {result.missingSkills?.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <button
                onClick={async () => {
                  try {
                    setLoading(true);
                    const res = await fetch("http://localhost:5000/interview", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ missingSkills: result.missingSkills }),
                    });
                    const data = await res.json();
                    const qs = data.questions || [];
                    setQuestions(qs);
                    setAnswers(new Array(qs.length).fill(""));
                    setFeedback([]);
                  } catch (e) {
                    console.error(e);
                    setError("Failed to generate interview questions");
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
              >
                {loading ? "Preparing questions..." : "Practice for this Role"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Questions + Answers */}
      {questions.length > 0 && (
        <div style={{ marginTop: 32 }}>
          <h2>Mock Interview</h2>
          {questions.map((q, i) => (
            <div key={i} style={{ marginBottom: 20 }}>
              <p style={{ margin: 0 }}><strong>{q.skill}</strong></p>
              <p style={{ marginTop: 4 }}>{q.question}</p>
              <textarea
                rows={4}
                style={{ width: "100%" }}
                value={answers[i] || ""}
                onChange={(e) => {
                  const next = answers.slice();
                  next[i] = e.target.value;
                  setAnswers(next);
                }}
                placeholder="Answer using STAR: Situation, Task, Action, Result"
              />
              <div style={{ marginTop: 8 }}>
                <button
                  onClick={async () => {
                    try {
                      const res = await fetch("http://localhost:5000/evaluate-answer", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ question: q.question, answer: answers[i] || "" }),
                      });
                      const data = await res.json();
                      const next = feedback.slice();
                      next[i] = data;
                      setFeedback(next);
                    } catch (e) {
                      console.error(e);
                      setError("Failed to evaluate answer");
                    }
                  }}
                >
                  Get Feedback
                </button>
              </div>
              {feedback[i] && (
                <pre style={{ whiteSpace: "pre-wrap", background: "#f8f8f8", padding: 8 }}>
                  {JSON.stringify(feedback[i], null, 2)}
                </pre>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
