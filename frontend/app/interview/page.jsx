/**
 * Mock Interview Component
 * Generate and practice interview questions for identified skill gaps
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function MockInterview() {
  const router = useRouter();
  const [missingSkills, setMissingSkills] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const stored = sessionStorage.getItem("missingSkills");
    if (stored) {
      const skills = JSON.parse(stored);
      setMissingSkills(skills);
      generateQuestions(skills);
    } else {
      router.push("/analyze");
    }
  }, [router]);

  const generateQuestions = async (skills) => {
    setLoading(true);
    try {
      // Get resume and JD context from session storage
      const analysisResult = JSON.parse(sessionStorage.getItem("analysisResult") || "{}");
      const resumeText = analysisResult.resumeText || "";
      const jdText = analysisResult.jobDescription || "";

      const res = await fetch("http://localhost:5000/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          missingSkills: skills,
          resumeText,
          jdText
        }),
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
  };

  const evaluateAnswer = async (index) => {
    try {
      const res = await fetch("http://localhost:5000/evaluate-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: questions[index].question,
          answer: answers[index] || "",
        }),
      });
      const data = await res.json();
      const next = feedback.slice();
      next[index] = data;
      setFeedback(next);
    } catch (e) {
      console.error(e);
      setError("Failed to evaluate answer");
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8f9fa" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🎤</div>
          <p style={{ fontSize: 18, color: "#0f172a", fontWeight: 600 }}>Preparing your interview questions...</p>
          <p style={{ color: "#64748b", fontSize: 14, marginTop: 8 }}>This may take a moment</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fa", paddingTop: 20 }}>
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 20px" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 40 }}>
          <div>
            <h1 style={{ fontSize: 36, fontWeight: 700, marginBottom: 8, color: "#0f172a" }}>
              🎤 Mock Interview
            </h1>
            <p style={{ color: "#64748b", fontSize: 15, margin: 0 }}>
              Practice answering questions for your skill gaps
            </p>
          </div>
          <button
            onClick={() => router.push("/results")}
            style={{
              padding: "10px 16px",
              background: "#0f172a",
              color: "white",
              border: "none",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = "#1e293b"}
            onMouseLeave={(e) => e.currentTarget.style.background = "#0f172a"}
          >
            ← Back
          </button>
        </div>

        {error && (
          <div style={{ background: "#fee2e2", color: "#991b1b", padding: 12, borderRadius: 8, marginBottom: 20, fontSize: 14 }}>
            ⚠️ {error}
          </div>
        )}

        {questions.map((q, i) => (
          <div
            key={i}
            style={{
              marginBottom: 28,
              background: "white",
              borderRadius: 12,
              padding: 28,
              boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
              border: "1px solid #e2e8f0"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <span
                style={{
                  display: "inline-block",
                  padding: "6px 12px",
                  background: "#dbeafe",
                  color: "#1e40af",
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 600
                }}
              >
                📌 {q.skill}
              </span>
              <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 500 }}>Question {i + 1} of {questions.length}</span>
            </div>

            <p style={{ fontSize: 16, fontWeight: 600, color: "#0f172a", marginBottom: 20, lineHeight: 1.6 }}>
              {q.question}
            </p>

            {!feedback[i] ? (
              <>
                <textarea
                  rows={7}
                  value={answers[i] || ""}
                  onChange={(e) => {
                    const next = answers.slice();
                    next[i] = e.target.value;
                    setAnswers(next);
                  }}
                  placeholder="Use the STAR framework: Situation • Task • Action • Result"
                  style={{
                    width: "100%",
                    padding: 12,
                    border: "1px solid #cbd5e1",
                    borderRadius: 8,
                    fontSize: 14,
                    fontFamily: "inherit",
                    resize: "vertical",
                    marginBottom: 14,
                    color: "#0f172a",
                    transition: "border 0.2s"
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = "#0f172a"}
                  onBlur={(e) => e.currentTarget.style.borderColor = "#cbd5e1"}
                />

                <button
                  onClick={() => evaluateAnswer(i)}
                  disabled={!answers[i]?.trim()}
                  style={{
                    padding: "10px 20px",
                    background: answers[i]?.trim() ? "#0f172a" : "#cbd5e1",
                    color: "white",
                    border: "none",
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: answers[i]?.trim() ? "pointer" : "not-allowed",
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={(e) => answers[i]?.trim() && (e.currentTarget.style.background = "#1e293b")}
                  onMouseLeave={(e) => answers[i]?.trim() && (e.currentTarget.style.background = "#0f172a")}
                >
                  ✓ Submit & Get Feedback
                </button>
              </>
            ) : (
              <div style={{ padding: 24, background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                <h4 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", marginBottom: 20, margin: "0 0 20px 0" }}>
                  📊 Evaluation & Suggestions
                </h4>

                {/* STAR Analysis */}
                <div style={{ marginBottom: 24 }}>
                  <h5 style={{ fontSize: 13, fontWeight: 700, color: "#64748b", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 12px 0" }}>
                    Your STAR Breakdown
                  </h5>
                  <div style={{ display: "grid", gap: 10 }}>
                    {[
                      { label: "Situation", value: feedback[i].starAnalysis?.situation },
                      { label: "Task", value: feedback[i].starAnalysis?.task },
                      { label: "Action", value: feedback[i].starAnalysis?.action },
                      { label: "Result", value: feedback[i].starAnalysis?.result }
                    ].map((item, idx) => (
                      <div key={idx} style={{ padding: 12, background: "white", borderRadius: 6, border: "1px solid #e2e8f0" }}>
                        <div style={{ fontWeight: 600, color: "#0f172a", fontSize: 13, marginBottom: 4 }}>{item.label}</div>
                        <div style={{ color: "#475569", fontSize: 14, lineHeight: 1.5 }}>{item.value || "Not mentioned"}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Strengths */}
                <div style={{ marginBottom: 24 }}>
                  <h5 style={{ fontSize: 13, fontWeight: 700, color: "#059669", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 12px 0" }}>
                    ✓ What You Did Well
                  </h5>
                  <ul style={{ margin: 0, paddingLeft: 0 }}>
                    {feedback[i].feedback?.strengths?.map((s, idx) => (
                      <li key={idx} style={{ marginBottom: 8, padding: "8px 12px", background: "#ecfdf5", borderRadius: 6, color: "#047857", fontSize: 14, listStyle: "none", borderLeft: "3px solid #10b981" }}>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Weaknesses */}
                <div style={{ marginBottom: 24 }}>
                  <h5 style={{ fontSize: 13, fontWeight: 700, color: "#d97706", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 12px 0" }}>
                    ⚠ Areas to Improve
                  </h5>
                  <ul style={{ margin: 0, paddingLeft: 0 }}>
                    {feedback[i].feedback?.weaknesses?.map((w, idx) => (
                      <li key={idx} style={{ marginBottom: 8, padding: "8px 12px", background: "#fffbeb", borderRadius: 6, color: "#92400e", fontSize: 14, listStyle: "none", borderLeft: "3px solid #f59e0b" }}>
                        {w}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Improved Answer */}
                <div>
                  <h5 style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 12px 0" }}>
                    💡 Suggested Improvement
                  </h5>
                  <p style={{ padding: 14, background: "#f0fdf4", borderRadius: 6, color: "#166534", lineHeight: 1.7, fontSize: 14, margin: 0, border: "1px solid #d1fae5" }}>
                    {feedback[i].improvedAnswer}
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
