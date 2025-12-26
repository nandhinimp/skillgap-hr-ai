"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./ResultsContent.module.css";

export default function ResultsContent() {
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
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h1 className={styles.title}>Analysis Results</h1>
        <button
          onClick={() => router.push("/analyze")}
          className={styles.backButton}
        >
          ← New Analysis
        </button>
      </div>

      <div className={styles.scoreCard}>
        <div className={styles.scoreValue}>{result.matchScore}%</div>
        <div className={styles.scoreLabel}>Match Score</div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Missing Skills</h3>
        {result.missingSkills && result.missingSkills.length > 0 ? (
          <div className={styles.skillsTags}>
            {result.missingSkills.map((skill: string, index: number) => (
              <span key={index} className={styles.skillTag}>
                {skill}
              </span>
            ))}
          </div>
        ) : (
          <p className={styles.noSkills}>🎉 No missing skills detected!</p>
        )}
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Overall Feedback</h3>
        <p className={styles.feedback}>{result.overallFeedback}</p>
      </div>

      {result.missingSkills?.length > 0 && (
        <button onClick={handlePractice} className={styles.practiceButton}>
          Practice Interview for Missing Skills →
        </button>
      )}
    </div>
  );
}
