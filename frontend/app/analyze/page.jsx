"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ResumeAnalyzer() {
  const router = useRouter();
  const [resume, setResume] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [jobDescriptionFile, setJobDescriptionFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [jdMode, setJdMode] = useState("text");

  const handleSubmit = async () => {
    if (!resume) {
      setError("Please upload resume (PDF)");
      return;
    }

    const hasJD = jdMode === "text" ? jobDescription.trim() : jobDescriptionFile;
    if (!hasJD) {
      setError("Please provide job description (text or PDF)");
      return;
    }

    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("resume", resume);
    
    if (jdMode === "text") {
      formData.append("jobDescription", jobDescription);
    } else if (jobDescriptionFile) {
      formData.append("jobDescriptionFile", jobDescriptionFile);
    }

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
    <div style={{ minHeight: "100vh", background: "#f8f9fa", paddingTop: 20, paddingBottom: 40 }}>
      <div style={{ maxWidth: 700, margin: "0 auto", padding: "0 20px" }}>
        {/* Header */}
        <div style={{ marginBottom: 40, textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📊</div>
          <h1 style={{ fontSize: 36, fontWeight: 700, marginBottom: 8, color: "#0f172a", letterSpacing: "-0.5px" }}>
            Resume Match Analyzer
          </h1>
          <p style={{ color: "#64748b", fontSize: 16, marginBottom: 0, maxWidth: 500, margin: "0 auto" }}>
            Compare your skills with job requirements and get actionable feedback
          </p>
        </div>

        {/* Main Card */}
        <div style={{ 
          background: "white", 
          borderRadius: 12, 
          padding: 32, 
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
          border: "1px solid #e2e8f0"
        }}>

          <div style={{ marginBottom: 28 }}>
            <label style={{ display: "block", fontWeight: 600, marginBottom: 10, color: "#0f172a", fontSize: 15 }}>
              📄 Your Resume
            </label>
            <div style={{
              position: "relative",
              padding: "24px",
              border: "2px dashed #cbd5e1",
              borderRadius: 10,
              background: "#f8fafc",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#0f172a";
              e.currentTarget.style.background = "#f1f5f9";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#cbd5e1";
              e.currentTarget.style.background = "#f8fafc";
            }}>
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => setResume(e.target.files?.[0] || null)}
                style={{
                  position: "absolute",
                  width: "100%",
                  height: "100%",
                  opacity: 0,
                  cursor: "pointer"
                }}
              />
              <div style={{ textAlign: "center", pointerEvents: "none" }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>📥</div>
                <p style={{ margin: 0, color: "#0f172a", fontWeight: 500, fontSize: 15 }}>
                  {resume ? resume.name : "Click or drag to upload PDF"}
                </p>
                <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: 13 }}>
                  PDF format only
                </p>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: 28 }}>
            <label style={{ display: "block", fontWeight: 600, marginBottom: 12, color: "#0f172a", fontSize: 15 }}>
              📋 Job Description
            </label>

            {/* Mode toggle */}
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              <button
                onClick={() => setJdMode("text")}
                style={{
                  flex: 1,
                  padding: "10px 16px",
                  border: "1px solid " + (jdMode === "text" ? "#0f172a" : "#cbd5e1"),
                  background: jdMode === "text" ? "#0f172a" : "white",
                  color: jdMode === "text" ? "white" : "#0f172a",
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
              >
                ✏️ Paste Text
              </button>
              <button
                onClick={() => setJdMode("file")}
                style={{
                  flex: 1,
                  padding: "10px 16px",
                  border: "1px solid " + (jdMode === "file" ? "#0f172a" : "#cbd5e1"),
                  background: jdMode === "file" ? "#0f172a" : "white",
                  color: jdMode === "file" ? "white" : "#0f172a",
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
              >
                📤 Upload PDF
              </button>
            </div>

            {/* Text input */}
            {jdMode === "text" && (
              <textarea
                rows={7}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the full job description here..."
                style={{
                  width: "100%",
                  padding: 12,
                  border: "1px solid #cbd5e1",
                  borderRadius: 8,
                  fontSize: 14,
                  fontFamily: "inherit",
                  resize: "vertical",
                  color: "#0f172a",
                  transition: "border 0.2s"
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = "#0f172a"}
                onBlur={(e) => e.currentTarget.style.borderColor = "#cbd5e1"}
              />
            )}

            {/* File input */}
            {jdMode === "file" && (
              <div style={{
                position: "relative",
                padding: "20px",
                border: "2px dashed #cbd5e1",
                borderRadius: 10,
                background: "#f8fafc",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#0f172a";
                e.currentTarget.style.background = "#f1f5f9";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#cbd5e1";
                e.currentTarget.style.background = "#f8fafc";
              }}>
                <input
                  type="file"
                  accept=".pdf,.txt"
                  onChange={(e) => setJobDescriptionFile(e.target.files?.[0] || null)}
                  style={{
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                    opacity: 0,
                    cursor: "pointer"
                  }}
                />
                <div style={{ textAlign: "center", pointerEvents: "none" }}>
                  <p style={{ margin: 0, color: "#0f172a", fontWeight: 500, fontSize: 15 }}>
                    {jobDescriptionFile ? jobDescriptionFile.name : "📎 Click or drag PDF/TXT"}
                  </p>
                </div>
              </div>
            )}
          </div>

          {error && (
            <div style={{ background: "#fee2e2", color: "#991b1b", padding: 12, borderRadius: 8, marginBottom: 20, fontSize: 14 }}>
              ⚠️ {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading || !resume || (jdMode === "text" ? !jobDescription.trim() : !jobDescriptionFile)}
            style={{
              width: "100%",
              padding: "14px 24px",
              background: loading ? "#cbd5e1" : "#0f172a",
              color: "white",
              border: "none",
              borderRadius: 8,
              fontSize: 15,
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.2s",
              position: "relative",
              overflow: "hidden"
            }}
            onMouseEnter={(e) => !loading && (e.currentTarget.style.background = "#1e293b")}
            onMouseLeave={(e) => !loading && (e.currentTarget.style.background = "#0f172a")}
          >
            {loading ? (
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <span style={{ 
                  display: "inline-block", 
                  width: 16, 
                  height: 16, 
                  border: "2px solid #fff",
                  borderTopColor: "transparent",
                  borderRadius: "50%",
                  animation: "spin 0.8s linear infinite"
                }}></span>
                Analyzing...
              </span>
            ) : (
              " Analyze Resume"
            )}
          </button>
          <style jsx>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    </div>
  );
}
