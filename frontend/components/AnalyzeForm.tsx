"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./AnalyzeForm.module.css";

export default function AnalyzeForm() {
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
      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Backend error");
      }

      const data = await response.json();
      sessionStorage.setItem("analysisResult", JSON.stringify(data.analysis));
      router.push("/results");
    } catch (err) {
      console.error(err);
      setError("Failed to analyze resume");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.card}>
      <h1 className={styles.title}>AI Resume Analyzer</h1>
      <p className={styles.subtitle}>
        Upload your resume and job description to get instant AI-powered analysis
      </p>

      <div className={styles.formGroup}>
        <label className={styles.label}>Upload Resume (PDF)</label>
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setResume(e.target.files?.[0] || null)}
          className={styles.input}
        />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Job Description</label>
        <textarea
          rows={8}
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste the full job description here..."
          className={styles.textarea}
        />
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={loading || !resume || !jobDescription}
        className={styles.button}
      >
        {loading ? "Analyzing..." : "Analyze Resume"}
      </button>
    </div>
  );
}
