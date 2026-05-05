"use client";
import { useState, useEffect, useRef } from "react";

const T = {
  fr: { ph: "Décrivez votre besoin...", sub: "Notre IA analyse votre demande et trouve le meilleur produit Amazon", legal: "En tant que Partenaire Amazon, je réalise un bénéfice sur les achats remplissant les conditions requises." },
  en: { ph: "Describe what you need...", sub: "Our AI understands your request and finds the best Amazon product for you", legal: "As an Amazon Associate, I earn from qualifying purchases." },
  de: { ph: "Beschreiben Sie Ihren Bedarf...", sub: "Unsere KI versteht Ihre Anfrage und findet das beste Amazon-Produkt", legal: "Als Amazon-Partner verdiene ich an qualifizierten Käufen." },
  es: { ph: "Describe lo que necesitas...", sub: "Nuestra IA analiza tu solicitud y encuentra el mejor producto en Amazon", legal: "Como Asociado de Amazon, obtengo ingresos por las compras que cumplen los requisitos." },
  it: { ph: "Descrivi cosa ti serve...", sub: "La nostra IA analizza la tua richiesta e trova il miglior prodotto su Amazon", legal: "In qualità di Affiliato Amazon, ricevo un guadagno dagli acquisti idonei." },
  pt: { ph: "Descreva o que precisa...", sub: "A nossa IA analisa o seu pedido e encontra o melhor produto na Amazon", legal: "Como Associado Amazon, ganho com compras qualificadas." },
  ja: { ph: "必要なものを説明してください...", sub: "AIがあなたのリクエストを分析し、最適なAmazon商品を見つけます", legal: "Amazonアソシエイトとして、適格販売から収入を得ています。" },
  nl: { ph: "Beschrijf wat u nodig heeft...", sub: "Onze AI analyseert uw verzoek en vindt het beste Amazon-product", legal: "Als Amazon Associate verdien ik aan in aanmerking komende aankopen." },
  pl: { ph: "Opisz czego potrzebujesz...", sub: "Nasza AI analizuje Twoje zapytanie i znajduje najlepszy produkt na Amazon", legal: "Jako Associate Amazon zarabiam na kwalifikujących się zakupach." },
  sv: { ph: "Beskriv vad du behöver...", sub: "Vår AI analyserar din förfrågan och hittar den bästa Amazon-produkten", legal: "Som Amazon Associate tjänar jag på kvalificerade köp." },
  tr: { ph: "İhtiyacınızı açıklayın...", sub: "Yapay zekamız talebinizi analiz eder ve en iyi Amazon ürününü bulur", legal: "Amazon İş Ortağı olarak uygun alımlardan kazanç sağlıyorum." },
};

const MENU = [
  { label: "About", href: "/about" },
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
];

export default function Home() {
  const [query, setQuery] = useState("");
  const [lang, setLang] = useState("en");
  const [amazon, setAmazon] = useState([]);
  const [ebay, setEbay] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
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
    textareaRef.current?.blur();
    fetch("/api/search?q=" + encodeURIComponent(query) + "&lang=" + lang)
      .then(function (r) { return r.json(); })
      .then(function (d) {
        setAmazon(d.amazon || []);
        setEbay(d.ebay || []);
        setLoading(false);
      })
      .catch(function () { setAmazon([]); setEbay([]); setLoading(false); });
  }

  function handleChange(e) {
    setQuery(e.target.value);
    var ta = textareaRef.current;
    if (ta) {
      ta.style.height = "auto";
      ta.style.height = ta.scrollHeight + "px";
    }
  }

  var hasResults = amazon.length > 0 || ebay.length > 0;

  return (
    <main style={{ minHeight: "100dvh", background: "#fff", display: "flex", flexDirection: "column", alignItems: "center", fontFamily: "'Segoe UI Light', 'Segoe UI', Arial, sans-serif" }}>

      {/* MENU */}
      <div style={{ position: "fixed", top: "1rem", right: "1rem", zIndex: 100 }}>
        <button
          aria-label="Menu"
          onClick={function() { setMenuOpen(!menuOpen); }}
          style={{ background: "none", border: "none", cursor: "pointer", padding: "0.4rem", display: "flex", flexDirection: "column", gap: "5px" }}
        >
          <span style={{ display: "block", width: "22px", height: "1.5px", background: "#aaa" }} />
          <span style={{ display: "block", width: "22px", height: "1.5px", background: "#aaa" }} />
          <span style={{ display: "block", width: "22px", height: "1.5px", background: "#aaa" }} />
        </button>
        {menuOpen && (
          <div style={{ position: "absolute", right: 0, top: "2.5rem", background: "white", border: "1px solid #eee", borderRadius: "1rem", boxShadow: "0 8px 32px rgba(0,0,0,0.08)", padding: "0.5rem 0", minWidth: "140px" }}>
            {MENU.map(function(item) {
              return (
                <a key={item.href} href={item.href}
                  style={{ display: "block", padding: "0.65rem 1.25rem", color: "#444", textDecoration: "none", fontSize: "0.9rem", fontWeight: "300" }}
                >
                  {item.label}
                </a>
              );
            })}
          </div>
        )}
      </div>

      {/* CONTENU PRINCIPAL */}
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
        maxWidth: "680px",
        padding: "0 1.25rem",
        paddingTop: searched ? "2rem" : "22vh",
        paddingBottom: "2rem",
        boxSizing: "border-box",
      }}>

        {/* TITRE */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h1 style={{
            fontSize: searched ? "1.6rem" : "clamp(1.8rem, 8vw, 3rem)",
            fontWeight: "200",
            letterSpacing: "0.1em",
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
            <p style={{
              marginTop: "0.75rem",
              color: "#bbb",
              fontSize: "clamp(0.75rem, 3vw, 0.9rem)",
              fontWeight: "300",
              letterSpacing: "0.03em",
              padding: "0 0.5rem",
            }}>
              {t.sub}
            </p>
          )}
        </div>

        {/* BARRE DE RECHERCHE */}
        <div style={{ width: "100%", position: "relative" }}>
          <textarea
            ref={textareaRef}
            autoFocus
            rows={2}
            style={{
              width: "100%",
              border: "1px solid #ccc",
              borderRadius: "1.5rem",
              padding: "0.85rem 1.25rem",
              fontSize: "1rem",
              outline: "none",
              background: "#fff",
              color: "#111",
              boxShadow: "0 2px 16px rgba(0,0,0,0.05)",
              boxSizing: "border-box",
              fontFamily: "'Segoe UI Light', 'Segoe UI', Arial, sans-serif",
              resize: "none",
              overflow: "hidden",
              lineHeight: "1.5",
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
          <div style={{ marginTop: "2rem", display: "flex", gap: "0.5rem" }}>
            {[0,1,2].map(function(i) {
              return <div key={i} style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#ccc", animation: "pulse 1.2s ease-in-out " + (i * 0.2) + "s infinite" }} />;
            })}
          </div>
        )}
        
        {/* RESULTATS AMAZON */}
        {!loading && amazon.length > 0 && (
          <div style={{ width: "100%", marginTop: "1.5rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <p style={{ fontSize: "0.7rem", color: "#bbb", letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 0.25rem 0.5rem" }}>Amazon</p>
            {amazon.map(function (item, i) {
              return (
                <a key={i} href={item.url} target="_blank" rel="noopener noreferrer"
                  style={{ display: "flex", gap: "0.75rem", padding: "0.875rem 1rem", borderRadius: "1.25rem", border: i === 0 ? "1px solid #e8f0fe" : "1px solid #eee", background: i === 0 ? "#fafcff" : "white", textDecoration: "none", boxShadow: "0 1px 4px rgba(0,0,0,0.04)", transition: "all 0.2s ease", position: "relative" }}
                  onMouseEnter={function(e) { e.currentTarget.style.boxShadow = "0 6px 24px rgba(0,0,0,0.09)"; }}
                  onMouseLeave={function(e) { e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.04)"; }}
                >
                  {i === 0 && <span style={{ position: "absolute", top: "0.2rem", right: "0.75rem", fontSize: "0.65rem", color: "#6ab0f5", fontWeight: "400" }}>✦ top</span>}
                  {item.image ? <img src={item.image} alt={item.title} style={{ width: "64px", height: "64px", objectFit: "contain", borderRadius: "0.75rem", flexShrink: 0, background: "#f9f9f9" }} /> : <div style={{ width: "64px", height: "64px", borderRadius: "0.75rem", flexShrink: 0, background: "#f9f9f9" }} />}
                  <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: "0.25rem", paddingRight: "2rem" }}>
                    <p style={{ color: "#111", fontSize: "0.85rem", fontWeight: "400", margin: 0, lineHeight: "1.4" }}>{item.title}</p>
                    <p style={{ color: "#111", fontWeight: "600", fontSize: "0.95rem", margin: 0 }}>{item.price}</p>
                    {item.rating && <p style={{ color: "#f5a623", fontSize: "0.75rem", margin: 0 }}>{item.rating}{item.reviewCount ? <span style={{ color: "#bbb", marginLeft: "0.3rem" }}>({item.reviewCount})</span> : null}</p>}
                  </div>
                </a>
              );
            })}
          </div>
        )}

        {/* RESULTATS EBAY */}
        {!loading && ebay.length > 0 && (
          <div style={{ width: "100%", marginTop: "1.25rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <p style={{ fontSize: "0.7rem", color: "#bbb", letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 0.25rem 0.5rem" }}>eBay</p>
            {ebay.map(function (item, i) {
              return (
                <a key={i} href={item.url} target="_blank" rel="noopener noreferrer"
                  style={{ display: "flex", gap: "0.75rem", padding: "0.875rem 1rem", borderRadius: "1.25rem", border: i === 0 ? "1px solid #e8f0fe" : "1px solid #eee", background: i === 0 ? "#fafcff" : "white", textDecoration: "none", boxShadow: "0 1px 4px rgba(0,0,0,0.04)", transition: "all 0.2s ease", position: "relative" }}
                  onMouseEnter={function(e) { e.currentTarget.style.boxShadow = "0 6px 24px rgba(0,0,0,0.09)"; }}
                  onMouseLeave={function(e) { e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.04)"; }}
                >
                  {i === 0 && <span style={{ position: "absolute", top: "0.2rem", right: "0.75rem", fontSize: "0.65rem", color: "#6ab0f5", fontWeight: "400" }}>✦ top</span>}
                  {item.image ? <img src={item.image} alt={item.title} style={{ width: "64px", height: "64px", objectFit: "contain", borderRadius: "0.75rem", flexShrink: 0, background: "#f9f9f9" }} /> : <div style={{ width: "64px", height: "64px", borderRadius: "0.75rem", flexShrink: 0, background: "#f9f9f9" }} />}
                  <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: "0.25rem", paddingRight: "2rem" }}>
                    <p style={{ color: "#111", fontSize: "0.85rem", fontWeight: "400", margin: 0, lineHeight: "1.4" }}>{item.title}</p>
                    <p style={{ color: "#111", fontWeight: "600", fontSize: "0.95rem", margin: 0 }}>{item.price}</p>
                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                      {item.rating && <p style={{ color: "#f5a623", fontSize: "0.75rem", margin: 0 }}>{item.rating}</p>}
                      {item.condition && <span style={{ fontSize: "0.65rem", color: "#bbb", background: "#f5f5f5", padding: "0.1rem 0.4rem", borderRadius: "0.5rem" }}>{item.condition}</span>}
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        )}

        {!loading && searched && !hasResults && (
          <p style={{ marginTop: "2rem", color: "#bbb", fontSize: "0.875rem" }}>Aucun résultat. Essayez autre chose.</p>
        )}
      </div>

      <footer style={{ marginTop: "auto", padding: "1.5rem", textAlign: "center", fontSize: "0.65rem", color: "#ddd", width: "100%", position: "fixed", bottom: 0, left: 0, right: 0, background: "white" }}>
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
        * { -webkit-tap-highlight-color: transparent; }
      `}</style>
    </main>
  );
}