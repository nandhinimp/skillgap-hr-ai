"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AnalyzePage() {
  const router = useRouter();
  const [resume, setResume] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!resume || !jobDescription) {
      setError("Please upload resume and enter job description");
      return;
    }

    setLoading(true);
    setError("");

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
      const result = data.analysis || data;
      
      // Store result and navigate to results page
      sessionStorage.setItem("analysisResult", JSON.stringify(result));
      router.push("/results");
    } catch (err) {
      console.error(err);
      setError("Failed to analyze resume");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "60px 20px" }}>
        <div style={{ background: "white", borderRadius: 16, padding: 40, boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
          <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8, color: "#1f2937" }}>
            AI Resume Analyzer
          </h1>
          <p style={{ color: "#6b7280", marginBottom: 32 }}>
            Upload your resume and job description to get instant AI-powered analysis
          </p>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", fontWeight: 600, marginBottom: 8, color: "#374151" }}>
              Upload Resume (PDF)
            </label>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setResume(e.target.files?.[0] || null)}
              style={{
                width: "100%",
                padding: 12,
                border: "2px solid #e5e7eb",
                borderRadius: 8,
                fontSize: 14,
                cursor: "pointer",
              }}
            />
          </div>

          <div style={{ marginBottom: 32 }}>
            <label style={{ display: "block", fontWeight: 600, marginBottom: 8, color: "#374151" }}>
              Job Description
            </label>
            <textarea
              rows={8}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the full job description here..."
              style={{
                width: "100%",
                padding: 12,
                border: "2px solid #e5e7eb",
                borderRadius: 8,
                fontSize: 14,
                fontFamily: "inherit",
                resize: "vertical",
              }}
            />
          </div>

          {error && (
            <p style={{ color: "#ef4444", marginBottom: 16, fontSize: 14 }}>
              {error}
            </p>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading || !resume || !jobDescription}
            style={{
              width: "100%",
              padding: "14px 24px",
              background: loading ? "#9ca3af" : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              border: "none",
              borderRadius: 8,
              fontSize: 16,
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.2s",
            }}
          >
            {loading ? "Analyzing..." : "Analyze Resume"}
          </button>
        </div>
      </div>
    </div>
  );
}
