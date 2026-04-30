export default function About() {
  return (
    <main style={{ maxWidth: "680px", margin: "0 auto", padding: "4rem 1.5rem", fontFamily: "'Segoe UI Light', 'Segoe UI', Arial, sans-serif", color: "#333", lineHeight: "1.8" }}>
      <a href="/" style={{ color: "#bbb", fontSize: "0.85rem", textDecoration: "none" }}>← The Pure Search</a>
      <h1 style={{ fontWeight: "200", fontSize: "2rem", marginTop: "2rem", color: "#111" }}>About</h1>

      <p style={{ fontSize: "1.1rem", color: "#555", marginTop: "1.5rem" }}>
        The Pure Search is the simplest way to find the right product on Amazon.
      </p>

      <p>
        No ads. No clutter. No infinite scroll. Just describe what you are looking for in plain language and we show you the best matching products from Amazon — instantly.
      </p>

      <p>
        Available in every country where Amazon operates, in your language, automatically.
      </p>

      <h2 style={{ fontWeight: "300", fontSize: "1.1rem", marginTop: "2rem" }}>How it works</h2>
      <p>Type what you need in your own words. Hit Enter. We search Amazon and show you the most relevant results. Click a product to go directly to Amazon and complete your purchase.</p>

      <h2 style={{ fontWeight: "300", fontSize: "1.1rem", marginTop: "2rem" }}>Affiliate</h2>
      <p>The Pure Search participates in the Amazon Associates Program. We earn a small commission on qualifying purchases at no extra cost to you.</p>
    </main>
  );
}