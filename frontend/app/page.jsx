/**
 * Home/Landing Page
 * Route: /
 * Purpose: Redirect to the analyzer page
 */

"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.push("/analyze");
  }, [router]);

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ fontSize: 18, color: "#6b7280" }}>Redirecting...</p>
    </div>
  );
}
