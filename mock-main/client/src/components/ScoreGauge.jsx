/**
 * components/ScoreGauge.jsx — Circular SVG score display
 *
 * Props:
 *  - score {number}  : Score out of 10
 *  - size  {number}  : SVG diameter in px (default 140)
 *
 * Uses SVG stroke-dashoffset animation to draw the arc based on the score.
 * Color changes from red → amber → green as score climbs.
 */

import React from "react";

function ScoreGauge({ score = 0, size = 140 }) {
  const radius = 54;                         // Circle radius (keeps consistent proportions)
  const circumference = 2 * Math.PI * radius; // Full circle stroke length
  const pct = Math.min(Math.max(score / 10, 0), 1); // Clamp 0–1
  const offset = circumference * (1 - pct);  // Remaining stroke = unfilled portion

  // Pick color based on score bucket
  const color =
    score >= 7 ? "#10b981"   // green  ≥ 7
    : score >= 5 ? "#f59e0b"  // amber  ≥ 5
    : "#ef4444";               // red    < 5

  return (
    <div className="score-gauge-container">
      <div className="score-circle" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox="0 0 120 120">
          {/* Background track */}
          <circle
            cx="60" cy="60"
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="10"
          />
          {/* Animated score arc */}
          <circle
            cx="60" cy="60"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{
              transition: "stroke-dashoffset 1s ease, stroke 0.5s ease",
              filter: `drop-shadow(0 0 8px ${color}88)`,
            }}
          />
        </svg>

        {/* Centered numeric value */}
        <div className="score-circle-value">
          <span className="number">{score.toFixed(1)}</span>
          <span className="label">/ 10</span>
        </div>
      </div>
    </div>
  );
}

export default ScoreGauge;
