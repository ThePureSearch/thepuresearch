"use client";
import { useState, useEffect, useRef } from "react";


const T = {
  fr: { ph: "Décrivez ce que vous cherchez...", sub: "Appuyez sur Entrée pour rechercher", legal: "En tant que Partenaire Amazon, je réalise un bénéfice sur les achats remplissant les conditions requises." },
  en: { ph: "Describe what you are looking for...", sub: "Press Enter to search", legal: "As an Amazon Associate, I earn from qualifying purchases." },
  de: { ph: "Beschreiben Sie was Sie suchen...", sub: "Drücken Sie Enter zum Suchen", legal: "Als Amazon-Partner verdiene ich an qualifizierten Käufen." },
  es: { ph: "Describe lo que buscas...", sub: "Presiona Enter para buscar", legal: "Como Asociado de Amazon, obtengo ingresos por las compras que cumplen los requisitos." },
  it: { ph: "Descrivi cosa cerchi...", sub: "Premi Invio per cercare", legal: "In qualità di Affiliato Amazon, ricevo un guadagno dagli acquisti idonei." },
  pt: { ph: "Descreva o que procura...", sub: "Prima Enter para pesquisar", legal: "Como Associado Amazon, ganho com compras qualificadas." },
};

export default function Home() {
  const [query, setQuery] = useState("");
  const [lang, setLang] = useState("en");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const textareaRef = useRef(null);

  useEffect(function () {
    var l = navigator.language.slice(0, 2);
    if (T[l]) setLang(l);
  }, []);

  var t = T[lang] || T.en;

  function handleSearch() {
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    fetch("/api/search?q=" + encodeURIComponent(query) + "&lang=" + lang)
      .then(function (r) { return r.json(); })
      .then(function (d) { setResults(d.results || []); setLoading(false); })
      .catch(function () { setResults([]); setLoading(false); });
  }

  function handleChange(e) {
    setQuery(e.target.value);
    var ta = textareaRef.current;
    if (ta) {
      ta.style.height = "auto";
      ta.style.height = ta.scrollHeight + "px";
    }
  }

  return (
    <main style={{ minHeight: "100vh", background: "#fff", display: "flex", flexDirection: "column", alignItems: "center", fontFamily: "'Segoe UI Light', 'Segoe UI', Arial, sans-serif" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", maxWidth: "680px", padding: "0 1.5rem", paddingTop: searched ? "2.5rem" : "26vh" }}>

        {/* TITRE AVEC VAGUE DE COULEUR */}
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <h1 style={{
            fontSize: searched ? "1.8rem" : "3rem",
            fontWeight: "200",
            letterSpacing: "0.12em",
            margin: 0,
            fontFamily: "'Segoe UI Light', 'Segoe UI', Arial, sans-serif",
            transition: "font-size 0.4s ease",
            background: "linear-gradient(90deg, #111 0%, #111 30%, #6ab0f5 50%, #111 70%, #111 100%)",
            backgroundSize: "200% auto",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            animation: "shimmer 4s linear infinite",
          }}>
            The Pure Search
          </h1>
          {!searched && (
            <p style={{ marginTop: "1rem", color: "#bbb", fontSize: "0.85rem", fontWeight: "300", letterSpacing: "0.05em" }}>
              {t.sub}
            </p>
          )}
        </div>

        {/* BARRE DE RECHERCHE */}
        <div style={{ width: "100%", position: "relative" }}>
          <textarea
            ref={textareaRef}
            autoFocus
            rows={1}
            style={{
              width: "100%",
              border: "1px solid #ccc",
              borderRadius: "2rem",
              padding: "0.85rem 1.5rem",
              fontSize: "1rem",
              outline: "none",
              background: "#fff",
              color: "#111",
              boxShadow: "0 2px 16px rgba(0,0,0,0.05)",
              boxSizing: "border-box",
              fontFamily: "'Segoe UI Light', 'Segoe UI', Arial, sans-serif",
              resize: "none",
              overflow: "hidden",
              lineHeight: "1.6",
              display: "block",
              transition: "border-color 0.2s ease, box-shadow 0.2s ease",
            }}
            onFocus={function(e) {
              e.target.style.borderColor = "#999";
              e.target.style.boxShadow = "0 4px 28px rgba(0,0,0,0.1)";
            }}
            onBlur={function(e) {
              e.target.style.borderColor = "#ccc";
              e.target.style.boxShadow = "0 2px 16px rgba(0,0,0,0.05)";
            }}
            placeholder={t.ph}
            value={query}
            onChange={handleChange}
            onKeyDown={function (e) {
              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSearch(); }
            }}
          />
        </div>

        {/* LOADING */}
        {loading && (
          <div style={{ marginTop: "3rem", display: "flex", gap: "0.5rem" }}>
            {[0,1,2].map(function(i) {
              return <div key={i} style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#ccc", animation: "pulse 1.2s ease-in-out " + (i * 0.2) + "s infinite" }} />;
            })}
          </div>
        )}

        {/* RESULTATS */}
        {!loading && results.length > 0 && (
          <div style={{ width: "100%", marginTop: "2rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {results.map(function (item, i) {
              return (
                <a key={i} href={item.url} target="_blank" rel="noopener noreferrer"
                  style={{ display: "flex", gap: "1rem", padding: "1rem 1.25rem", borderRadius: "1.25rem", border: "1px solid #eee", background: "white", textDecoration: "none", boxShadow: "0 1px 4px rgba(0,0,0,0.04)", transition: "all 0.2s ease" }}
                  onMouseEnter={function(e) { e.currentTarget.style.boxShadow = "0 6px 24px rgba(0,0,0,0.09)"; e.currentTarget.style.borderColor = "#ddd"; }}
                  onMouseLeave={function(e) { e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.04)"; e.currentTarget.style.borderColor = "#eee"; }}
                >
                  <img src={item.image} alt={item.title} style={{ width: "72px", height: "72px", objectFit: "contain", borderRadius: "0.75rem", flexShrink: 0, background: "#f9f9f9" }} />
                  <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: "0.3rem" }}>
                    <p style={{ color: "#111", fontSize: "0.875rem", fontWeight: "400", margin: 0, lineHeight: "1.4" }}>{item.title}</p>
                    <p style={{ color: "#111", fontWeight: "600", fontSize: "1rem", margin: 0 }}>{item.price}</p>
                    <p style={{ color: "#f5a623", fontSize: "0.75rem", margin: 0 }}>{item.rating}</p>
                  </div>
                </a>
              );
            })}
          </div>
        )}

        {!loading && searched && results.length === 0 && (
          <p style={{ marginTop: "3rem", color: "#bbb", fontSize: "0.875rem" }}>Aucun résultat. Essayez autre chose.</p>
        )}
      </div>

      <footer style={{ marginTop: "auto", padding: "2rem 0", textAlign: "center", fontSize: "0.7rem", color: "#ddd" }}>
      {t.legal}
      </footer>

      <style>{`
        @keyframes shimmer {
          0% { background-position: 100% center; }
          100% { background-position: -100% center; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>
    </main>
  );
}