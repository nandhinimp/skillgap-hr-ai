"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function InterviewPage() {
  const router = useRouter();
  const [missingSkills, setMissingSkills] = useState<string[]>([]);
  const [questions, setQuestions] = useState<Array<{ skill: string; question: string }>>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<any[]>([]);
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

  const generateQuestions = async (skills: string[]) => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ missingSkills: skills }),
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

  const evaluateAnswer = async (index: number) => {
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
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ fontSize: 18, color: "#6b7280" }}>Generating interview questions...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f3f4f6" }}>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 20px" }}>
        <div style={{ background: "white", borderRadius: 16, padding: 40, boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: "#1f2937" }}>Mock Interview</h1>
            <button
              onClick={() => router.push("/results")}
              style={{
                padding: "8px 16px",
                background: "#f3f4f6",
                border: "none",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                color: "#6b7280",
              }}
            >
              ← Back to Results
            </button>
          </div>

          {error && (
            <p style={{ color: "#ef4444", marginBottom: 16, fontSize: 14 }}>
              {error}
            </p>
          )}

          {questions.map((q, i) => (
            <div
              key={i}
              style={{
                marginBottom: 32,
                padding: 24,
                background: "#f9fafb",
                borderRadius: 12,
                border: "1px solid #e5e7eb",
              }}
            >
              <div
                style={{
                  display: "inline-block",
                  padding: "4px 12px",
                  background: "#dbeafe",
                  color: "#1e40af",
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 600,
                  marginBottom: 12,
                }}
              >
                {q.skill}
              </div>
              <p style={{ fontSize: 16, fontWeight: 600, color: "#1f2937", marginBottom: 16 }}>
                {q.question}
              </p>

              <textarea
                rows={6}
                value={answers[i] || ""}
                onChange={(e) => {
                  const next = answers.slice();
                  next[i] = e.target.value;
                  setAnswers(next);
                }}
                placeholder="Answer using STAR framework: Situation, Task, Action, Result"
                style={{
                  width: "100%",
                  padding: 12,
                  border: "2px solid #e5e7eb",
                  borderRadius: 8,
                  fontSize: 14,
                  fontFamily: "inherit",
                  resize: "vertical",
                  marginBottom: 12,
                }}
              />

              <button
                onClick={() => evaluateAnswer(i)}
                disabled={!answers[i]?.trim()}
                style={{
                  padding: "10px 20px",
                  background: answers[i]?.trim() ? "#3b82f6" : "#d1d5db",
                  color: "white",
                  border: "none",
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: answers[i]?.trim() ? "pointer" : "not-allowed",
                }}
              >
                Get Feedback
              </button>

              {feedback[i] && (
                <div style={{ marginTop: 20, padding: 20, background: "white", borderRadius: 8 }}>
                  <h4 style={{ fontSize: 18, fontWeight: 600, color: "#1f2937", marginBottom: 16 }}>
                    Evaluation Results
                  </h4>

                  <div style={{ marginBottom: 20 }}>
                    <h5 style={{ fontSize: 14, fontWeight: 600, color: "#6b7280", marginBottom: 8 }}>
                      STAR Analysis
                    </h5>
                    <div style={{ display: "grid", gap: 8 }}>
                      <div style={{ padding: 12, background: "#f3f4f6", borderRadius: 6 }}>
                        <strong style={{ color: "#374151" }}>Situation:</strong>{" "}
                        <span style={{ color: "#6b7280" }}>{feedback[i].starAnalysis?.situation || "N/A"}</span>
                      </div>
                      <div style={{ padding: 12, background: "#f3f4f6", borderRadius: 6 }}>
                        <strong style={{ color: "#374151" }}>Task:</strong>{" "}
                        <span style={{ color: "#6b7280" }}>{feedback[i].starAnalysis?.task || "N/A"}</span>
                      </div>
                      <div style={{ padding: 12, background: "#f3f4f6", borderRadius: 6 }}>
                        <strong style={{ color: "#374151" }}>Action:</strong>{" "}
                        <span style={{ color: "#6b7280" }}>{feedback[i].starAnalysis?.action || "N/A"}</span>
                      </div>
                      <div style={{ padding: 12, background: "#f3f4f6", borderRadius: 6 }}>
                        <strong style={{ color: "#374151" }}>Result:</strong>{" "}
                        <span style={{ color: "#6b7280" }}>{feedback[i].starAnalysis?.result || "N/A"}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginBottom: 20 }}>
                    <h5 style={{ fontSize: 14, fontWeight: 600, color: "#10b981", marginBottom: 8 }}>
                      ✓ Strengths
                    </h5>
                    <ul style={{ margin: 0, paddingLeft: 20, color: "#6b7280" }}>
                      {feedback[i].feedback?.strengths?.map((s: string, idx: number) => (
                        <li key={idx} style={{ marginBottom: 4 }}>{s}</li>
                      ))}
                    </ul>
                  </div>

                  <div style={{ marginBottom: 20 }}>
                    <h5 style={{ fontSize: 14, fontWeight: 600, color: "#f59e0b", marginBottom: 8 }}>
                      ⚠ Areas to Improve
                    </h5>
                    <ul style={{ margin: 0, paddingLeft: 20, color: "#6b7280" }}>
                      {feedback[i].feedback?.weaknesses?.map((w: string, idx: number) => (
                        <li key={idx} style={{ marginBottom: 4 }}>{w}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h5 style={{ fontSize: 14, fontWeight: 600, color: "#6b7280", marginBottom: 8 }}>
                      Improved Answer
                    </h5>
                    <p style={{ padding: 16, background: "#f0fdf4", borderRadius: 6, color: "#166534", lineHeight: 1.6 }}>
                      {feedback[i].improvedAnswer}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
