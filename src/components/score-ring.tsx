export function ScoreRing({ score, size = "md" }: { score: number; size?: "sm" | "md" | "lg" }) {
  return (
    <span className={`score-ring score-ring-${size}`} style={{ "--score": `${score * 3.6}deg` } as React.CSSProperties}>
      <span><strong>{score}</strong><small>%</small></span>
    </span>
  );
}
