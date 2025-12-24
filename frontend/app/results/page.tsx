"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ResultsPage() {
  const router = useRouter();
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("analysisResult");
    if (stored) {
      setResult(JSON.parse(stored));
    } else {
      router.push("/analyze");
    }
  }, [router]);

  if (!result) return null;

  const handlePractice = () => {
    sessionStorage.setItem("missingSkills", JSON.stringify(result.missingSkills));
    router.push("/interview");
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f3f4f6" }}>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 20px" }}>
        <div style={{ background: "white", borderRadius: 16, padding: 40, boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: "#1f2937" }}>Analysis Results</h1>
            <button
              onClick={() => router.push("/analyze")}
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
              ← New Analysis
            </button>
          </div>

          {/* Match Score Card */}
          <div
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              borderRadius: 12,
              padding: 32,
              marginBottom: 24,
              color: "white",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 48, fontWeight: 700, marginBottom: 8 }}>
              {result.matchScore}%
            </div>
            <div style={{ fontSize: 18, opacity: 0.9 }}>Match Score</div>
          </div>

          {/* Missing Skills */}
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 20, fontWeight: 600, color: "#1f2937", marginBottom: 16 }}>
              Missing Skills
            </h3>
            {result.missingSkills && result.missingSkills.length > 0 ? (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {result.missingSkills.map((skill: string, index: number) => (
                  <span
                    key={index}
                    style={{
                      padding: "8px 16px",
                      background: "#fef3c7",
                      color: "#92400e",
                      borderRadius: 20,
                      fontSize: 14,
                      fontWeight: 500,
                    }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p style={{ color: "#10b981", fontSize: 16, fontWeight: 500 }}>
                🎉 No missing skills detected!
              </p>
            )}
          </div>

          {/* Overall Feedback */}
          <div style={{ marginBottom: 32 }}>
            <h3 style={{ fontSize: 20, fontWeight: 600, color: "#1f2937", marginBottom: 16 }}>
              Overall Feedback
            </h3>
            <p style={{ color: "#4b5563", lineHeight: 1.7, fontSize: 15 }}>
              {result.overallFeedback}
            </p>
          </div>

          {/* Practice CTA */}
          {result.missingSkills?.length > 0 && (
            <button
              onClick={handlePractice}
              style={{
                width: "100%",
                padding: "16px 24px",
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                color: "white",
                border: "none",
                borderRadius: 8,
                fontSize: 16,
                fontWeight: 600,
                cursor: "pointer",
                transition: "transform 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              Practice Interview for Missing Skills →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
