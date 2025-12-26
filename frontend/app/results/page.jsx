/**
 * Analysis Results Component
 * Displays resume analysis results with match score, skill gaps, and feedback
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AnalysisResults() {
  const router = useRouter();
  const [result, setResult] = useState(null);
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    const stored = sessionStorage.getItem("analysisResult");
    if (stored) {
      const data = JSON.parse(stored);
      setResult(data);
      
      // Animate score counting
      let start = 0;
      const end = data.matchScore || 0;
      const duration = 1500;
      const increment = end / (duration / 16);
      
      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setDisplayScore(end);
          clearInterval(timer);
        } else {
          setDisplayScore(Math.floor(start));
        }
      }, 16);
      
      return () => clearInterval(timer);
    } else {
      router.push("/analyze");
    }
  }, [router]);

  if (!result) return null;

  const handlePractice = () => {
    sessionStorage.setItem("missingSkills", JSON.stringify(result.missingSkills));
    router.push("/interview");
  };

  // Extract detailed data from _raw if available
  const raw = result._raw || {};
  const redFlags = raw.redFlags || [];
  const strengths = raw.strengths || [];
  const criticalGaps = raw.criticalSkillGaps || [];
  const selectionLikelihood = raw.selectionLikelihood || {};
  const experienceAnalysis = raw.experienceAnalysis || {};

  const getScoreColor = (score) => {
    if (score >= 85) return "#10b981";
    if (score >= 75) return "#3b82f6";
    if (score >= 65) return "#f59e0b";
    return "#ef4444";
  };

  const getScoreLabel = (score) => {
    if (score >= 95) return "Exceptional - Top 5%";
    if (score >= 85) return "Excellent Fit";
    if (score >= 75) return "Good Fit";
    if (score >= 65) return "Borderline";
    if (score >= 50) return "Moderate Gaps";
    return "Significant Gaps";
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fa", paddingTop: 20 }}>
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 20px" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 40 }}>
          <div>
            <h1 style={{ fontSize: 36, fontWeight: 700, marginBottom: 8, color: "#0f172a" }}>
              Analysis Results
            </h1>
            <p style={{ color: "#64748b", fontSize: 15, margin: 0 }}>
              Here's how your resume matches the job requirements
            </p>
          </div>
          <button
            onClick={() => router.push("/analyze")}
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
            ↻ New Analysis
          </button>
        </div>

        {/* Match Score Card */}
        <div
          style={{
            background: "white",
            borderRadius: 12,
            padding: 32,
            marginBottom: 28,
            textAlign: "center",
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            border: `2px solid ${getScoreColor(displayScore)}20`
          }}
        >
          <p style={{ color: "#64748b", fontSize: 13, fontWeight: 600, margin: "0 0 12px 0", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Match Percentage
          </p>
          <div style={{ fontSize: 64, fontWeight: 700, color: getScoreColor(displayScore), marginBottom: 8, fontVariantNumeric: "tabular-nums" }}>
            {displayScore}%
          </div>
          <div style={{ 
            fontSize: 16, 
            fontWeight: 600, 
            color: getScoreColor(displayScore),
            marginBottom: 16
          }}>
            {getScoreLabel(displayScore)}
          </div>
          {selectionLikelihood.status && (
            <div style={{
              display: "inline-block",
              padding: "8px 16px",
              background: `${getScoreColor(displayScore)}15`,
              border: `1px solid ${getScoreColor(displayScore)}30`,
              borderRadius: 6,
              fontSize: 14,
              fontWeight: 600,
              color: getScoreColor(displayScore)
            }}>
              {selectionLikelihood.status}
            </div>
          )}
          <div style={{ 
            height: 6, 
            background: "#e2e8f0", 
            borderRadius: 3, 
            overflow: "hidden",
            marginTop: 20
          }}>
            <div style={{ 
              height: "100%", 
              background: getScoreColor(displayScore),
              width: displayScore + "%",
              transition: "width 1s ease-out"
            }} />
          </div>
        </div>

        {/* Red Flags - Show if any exist */}
        {redFlags.length > 0 && (
          <div style={{ background: "white", borderRadius: 12, padding: 28, marginBottom: 28, boxShadow: "0 1px 3px rgba(0,0,0,0.08)", border: "2px solid #fee2e2" }}>
            <h3 style={{ fontSize: 18, fontWeight: 600, color: "#dc2626", marginBottom: 16, margin: "0 0 16px 0" }}>
              🚩 Critical Issues Identified
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {redFlags.slice(0, 5).map((flag, index) => (
                <div 
                  key={index}
                  style={{
                    padding: 16,
                    background: "#fef2f2",
                    borderRadius: 8,
                    border: "1px solid #fecaca"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                    <strong style={{ color: "#dc2626", fontSize: 14, fontWeight: 600 }}>
                      {flag.flag || "Issue detected"}
                    </strong>
                    {flag.severity && (
                      <span style={{
                        padding: "2px 8px",
                        fontSize: 11,
                        fontWeight: 600,
                        borderRadius: 4,
                        background: flag.severity === "Critical" ? "#dc2626" : flag.severity === "High" ? "#ea580c" : "#f59e0b",
                        color: "white"
                      }}>
                        {flag.severity}
                      </span>
                    )}
                  </div>
                  <p style={{ color: "#7f1d1d", fontSize: 13, margin: 0, lineHeight: 1.6 }}>
                    {flag.evidence || flag.impact}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Critical Skill Gaps - If array of objects */}
        {Array.isArray(criticalGaps) && criticalGaps.length > 0 && criticalGaps[0]?.skill && (
          <div style={{ background: "white", borderRadius: 12, padding: 28, marginBottom: 28, boxShadow: "0 1px 3px rgba(0,0,0,0.08)", border: "2px solid #fed7aa" }}>
            <h3 style={{ fontSize: 18, fontWeight: 600, color: "#c2410c", marginBottom: 16, margin: "0 0 16px 0" }}>
              ⚠️ Critical Skill Gaps
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {criticalGaps.map((gap, index) => (
                <div 
                  key={index}
                  style={{
                    padding: 16,
                    background: "#fff7ed",
                    borderRadius: 8,
                    border: "1px solid #fed7aa"
                  }}
                >
                  <strong style={{ color: "#c2410c", fontSize: 14, fontWeight: 600, display: "block", marginBottom: 6 }}>
                    {gap.skill}
                  </strong>
                  <p style={{ color: "#7c2d12", fontSize: 13, margin: "0 0 8px 0", lineHeight: 1.6 }}>
                    <strong>Impact:</strong> {gap.impact || gap.requiredFor}
                  </p>
                  {gap.learningCurve && (
                    <p style={{ color: "#92400e", fontSize: 12, margin: 0 }}>
                      ⏱️ Learning time: {gap.learningCurve}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Strengths - Show if any exist */}
        {strengths.length > 0 && (
          <div style={{ background: "white", borderRadius: 12, padding: 28, marginBottom: 28, boxShadow: "0 1px 3px rgba(0,0,0,0.08)", border: "2px solid #d1fae5" }}>
            <h3 style={{ fontSize: 18, fontWeight: 600, color: "#059669", marginBottom: 16, margin: "0 0 16px 0" }}>
              ✨ Key Strengths
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {strengths.slice(0, 4).map((strength, index) => (
                <div 
                  key={index}
                  style={{
                    padding: 16,
                    background: "#f0fdf4",
                    borderRadius: 8,
                    border: "1px solid #bbf7d0"
                  }}
                >
                  <strong style={{ color: "#047857", fontSize: 14, fontWeight: 600, display: "block", marginBottom: 6 }}>
                    {strength.strength}
                  </strong>
                  <p style={{ color: "#065f46", fontSize: 13, margin: 0, lineHeight: 1.6 }}>
                    {strength.evidence}
                  </p>
                  {strength.value && (
                    <p style={{ color: "#047857", fontSize: 12, margin: "8px 0 0 0", fontStyle: "italic" }}>
                      💡 {strength.value}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Experience Analysis */}
        {experienceAnalysis.candidateLevel && (
          <div style={{ background: "white", borderRadius: 12, padding: 28, marginBottom: 28, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
            <h3 style={{ fontSize: 18, fontWeight: 600, color: "#0f172a", marginBottom: 16, margin: "0 0 16px 0" }}>
              📊 Experience Analysis
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
              <div style={{ padding: 16, background: "#f8fafc", borderRadius: 8 }}>
                <p style={{ color: "#64748b", fontSize: 12, margin: "0 0 4px 0", fontWeight: 600 }}>Your Level</p>
                <p style={{ color: "#0f172a", fontSize: 16, fontWeight: 600, margin: 0 }}>{experienceAnalysis.candidateLevel}</p>
              </div>
              <div style={{ padding: 16, background: "#f8fafc", borderRadius: 8 }}>
                <p style={{ color: "#64748b", fontSize: 12, margin: "0 0 4px 0", fontWeight: 600 }}>Required Level</p>
                <p style={{ color: "#0f172a", fontSize: 16, fontWeight: 600, margin: 0 }}>{experienceAnalysis.requiredLevel}</p>
              </div>
              <div style={{ padding: 16, background: "#f8fafc", borderRadius: 8 }}>
                <p style={{ color: "#64748b", fontSize: 12, margin: "0 0 4px 0", fontWeight: 600 }}>Match</p>
                <p style={{ 
                  color: experienceAnalysis.levelMatch === "Perfect" ? "#059669" : experienceAnalysis.levelMatch === "Close" ? "#f59e0b" : "#dc2626", 
                  fontSize: 16, 
                  fontWeight: 600, 
                  margin: 0 
                }}>
                  {experienceAnalysis.levelMatch}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Missing Skills */}
        <div style={{ background: "white", borderRadius: 12, padding: 28, marginBottom: 28, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
          <h3 style={{ fontSize: 18, fontWeight: 600, color: "#0f172a", marginBottom: 16, margin: "0 0 16px 0" }}>
            🎯 Skill Gaps to Address
          </h3>
          {result.missingSkills && result.missingSkills.length > 0 ? (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {result.missingSkills.map((skill, index) => (
                <span
                  key={index}
                  style={{
                    padding: "8px 14px",
                    background: "#fef08a",
                    color: "#92400e",
                    borderRadius: 6,
                    fontSize: 14,
                    fontWeight: 500,
                    border: "1px solid #fcd34d",
                    animation: `fadeIn 0.3s ease-in ${index * 0.05}s both`
                  }}
                >
                  {skill}
                </span>
              ))}
              <style jsx>{`
                @keyframes fadeIn {
                  from {
                    opacity: 0;
                    transform: translateY(10px);
                  }
                  to {
                    opacity: 1;
                    transform: translateY(0);
                  }
                }
              `}</style>
            </div>
          ) : (
            <div style={{ 
              padding: 20, 
              background: "#ecfdf5", 
              borderRadius: 8, 
              border: "1px solid #d1fae5",
              textAlign: "center"
            }}>
              <p style={{ color: "#047857", fontSize: 15, fontWeight: 500, margin: 0 }}>
                ✓ Perfect match! No skill gaps detected.
              </p>
            </div>
          )}
        </div>

        {/* Overall Feedback */}
        <div style={{ background: "white", borderRadius: 12, padding: 28, marginBottom: 28, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
          <h3 style={{ fontSize: 18, fontWeight: 600, color: "#0f172a", marginBottom: 16, margin: "0 0 16px 0" }}>
            💡 Feedback & Insights
          </h3>
          <p style={{ color: "#475569", lineHeight: 1.8, fontSize: 14, margin: 0 }}>
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
              background: "#0f172a",
              color: "white",
              border: "none",
              borderRadius: 8,
              fontSize: 15,
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = "#1e293b"}
            onMouseLeave={(e) => e.currentTarget.style.background = "#0f172a"}
          >
            📚 Practice Interview for Missing Skills →
          </button>
        )}
      </div>
    </div>
  );
}
