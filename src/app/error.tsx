"use client";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <div className="empty-state full-page"><span>Ops</span><h1>O radar perdeu o sinal.</h1><p>Tente novamente. Seus dados e candidaturas continuam seguros.</p><button className="primary-button" onClick={reset}>Tentar novamente</button></div>;
}
