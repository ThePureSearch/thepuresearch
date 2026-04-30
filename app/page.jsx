"use client";
import { useState, useEffect } from "react";

const T = {
  fr: { ph: "Decrivez ce que vous cherchez...", sub: "Decrivez ce que vous cherchez", btn: "Rechercher" },
  en: { ph: "Describe what you are looking for...", sub: "Describe what you are looking for", btn: "Search" },
  de: { ph: "Beschreiben Sie was Sie suchen...", sub: "Beschreiben Sie was Sie suchen", btn: "Suchen" },
  es: { ph: "Describe lo que buscas...", sub: "Describe lo que buscas", btn: "Buscar" },
  it: { ph: "Descrivi cosa cerchi...", sub: "Descrivi cosa cerchi", btn: "Cerca" },
};

export default function Home() {
  const [query, setQuery] = useState("");
  const [lang, setLang] = useState("en");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(function() {
    var l = navigator.language.slice(0, 2);
    if (T[l]) setLang(l);
  }, []);

  var t = T[lang] || T.en;

  function handleSearch() {
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    fetch("/api/search?q=" + encodeURIComponent(query) + "&lang=" + lang)
      .then(function(r) { return r.json(); })
      .then(function(d) { setResults(d.results || []); setLoading(false); })
      .catch(function() { setResults([]); setLoading(false); });
  }

  return (
    <main style={{minHeight:"100vh",background:"white",display:"flex",flexDirection:"column",alignItems:"center",padding:"0 1rem"}}>
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",width:"100%",maxWidth:"640px",paddingTop: searched ? "2rem" : "30vh"}}>
        <h1 style={{fontSize:"1.5rem",fontWeight:"300",letterSpacing:"0.2em",color:"#9ca3af",marginBottom:"0.5rem"}}>thepuresearch</h1>
        {!searched && <p style={{color:"#6b7280",fontSize:"0.875rem",marginBottom:"1.5rem",textAlign:"center"}}>{t.sub}</p>}
        <div style={{width:"100%",display:"flex",gap:"0.5rem"}}>
          <textarea
            style={{width:"100%",border:"1px solid #e5e7eb",borderRadius:"1rem",padding:"0.75rem 1.25rem",fontSize:"1rem",resize:"none",outline:"none",boxShadow:"0 1px 2px rgba(0,0,0,0.05)"}}
            placeholder={t.ph}
            value={query}
            rows={1}
            onChange={function(e) {
              setQuery(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = e.target.scrollHeight + "px";
            }}
            onKeyDown={function(e) {
              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSearch(); }
            }}
          />
          <button
            onClick={handleSearch}
            style={{background:"#111827",color:"white",padding:"0.75rem 1.25rem",borderRadius:"1rem",border:"none",cursor:"pointer",whiteSpace:"nowrap",fontSize:"0.875rem"}}
          >{t.btn}</button>
        </div>

        {loading && <p style={{marginTop:"3rem",color:"#9ca3af",fontSize:"0.875rem"}}>...</p>}

        {!loading && results.length > 0 && (
          <div style={{width:"100%",marginTop:"2rem",display:"flex",flexDirection:"column",gap:"1rem"}}>
            {results.map(function(item, i) {
              return (
                <a key={i} href={item.url} target="_blank" rel="noopener noreferrer"
                  style={{display:"flex",gap:"1rem",padding:"1rem",borderRadius:"1rem",border:"1px solid #f3f4f6",textDecoration:"none"}}>
                  <img src={item.image} alt={item.title} style={{width:"80px",height:"80px",objectFit:"contain",borderRadius:"0.5rem",flexShrink:0}} />
                  <div style={{display:"flex",flexDirection:"column",justifyContent:"center",gap:"0.25rem"}}>
                    <p style={{color:"#1f2937",fontSize:"0.875rem",fontWeight:"500",margin:0}}>{item.title}</p>
                    <p style={{color:"#111827",fontWeight:"600",fontSize:"1rem",margin:0}}>{item.price}</p>
                    <p style={{color:"#eab308",fontSize:"0.75rem",margin:0}}>{item.rating}</p>
                  </div>
                </a>
              );
            })}
          </div>
        )}

        {!loading && searched && results.length === 0 && (
          <p style={{marginTop:"3rem",color:"#9ca3af",fontSize:"0.875rem"}}>Aucun resultat. Essayez autre chose.</p>
        )}
      </div>
      <footer style={{marginTop:"auto",padding:"1.5rem 0",textAlign:"center",fontSize:"0.75rem",color:"#d1d5db",maxWidth:"640px"}}>
        En tant que Partenaire Amazon, je realise un benefice sur les achats remplissant les conditions requises.
      </footer>
    </main>
  );
}
