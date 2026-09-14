import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { Dice5, History, Trash2, RotateCcw, Copy, Check, Sparkles } from "lucide-react";
import "./styles.css";

const DICE = [4, 6, 8, 10, 12, 20, 100];

function randomInt(max) {
  return Math.floor(Math.random() * max) + 1;
}

function rollDice(count, sides) {
  return Array.from({ length: count }, () => randomInt(sides));
}

function formatExpression(count, sides, modifier) {
  const mod = Number(modifier) || 0;
  return `${count}d${sides}${mod > 0 ? `+${mod}` : mod < 0 ? mod : ""}`;
}

function DiceFace({ value, sides, highlight }) {
  return (
    <div className={`die ${highlight ? "highlight" : ""}`} title={`d${sides}`}>
      <span>{value}</span>
    </div>
  );
}

function App() {
  const [count, setCount] = useState(1);
  const [sides, setSides] = useState(20);
  const [modifier, setModifier] = useState(0);
  const [results, setResults] = useState([]);
  const [history, setHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("dice-history") || "[]");
    } catch {
      return [];
    }
  });
  const [rolling, setRolling] = useState(false);
  const [copied, setCopied] = useState(false);

  const total = useMemo(
    () => results.reduce((sum, value) => sum + value, 0) + Number(modifier || 0),
    [results, modifier]
  );

  const expression = formatExpression(count, sides, modifier);

  useEffect(() => {
    localStorage.setItem("dice-history", JSON.stringify(history.slice(0, 30)));
  }, [history]);

  function doRoll() {
    if (rolling) return;
    setRolling(true);

    window.setTimeout(() => {
      const rolled = rollDice(count, sides);
      const mod = Number(modifier) || 0;
      const entry = {
        id: crypto.randomUUID(),
        expression: formatExpression(count, sides, mod),
        rolls: rolled,
        modifier: mod,
        total: rolled.reduce((a, b) => a + b, 0) + mod,
        createdAt: new Date().toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit"
        })
      };

      setResults(rolled);
      setHistory(prev => [entry, ...prev].slice(0, 30));
      setRolling(false);
    }, 350);
  }

  function rerollHistory(entry) {
    setCount(entry.rolls.length);
    const match = entry.expression.match(/d(\d+)/);
    if (match) setSides(Number(match[1]));
    setModifier(entry.modifier);
    window.setTimeout(doRoll, 0);
  }

  async function copyResult() {
    if (!results.length) return;
    await navigator.clipboard?.writeText(`${expression} = ${total}`);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  }

  function clearHistory() {
    setHistory([]);
  }

  return (
    <main className="app-shell">
      <section className="hero">
        <div>
          <div className="eyebrow"><Dice5 size={16}/> DICE ENGINE v0.1</div>
          <h1>Dice Roller</h1>
          <p>Um pequeno laboratório para transformar números aleatórios em decisões questionáveis.</p>
        </div>
        <div className="hero-mark"><Sparkles size={28}/></div>
      </section>

      <section className="grid">
        <div className="panel roller-panel">
          <div className="panel-title">
            <div>
              <span className="kicker">ROLL</span>
              <h2>Monte sua rolagem</h2>
            </div>
            <code>{expression}</code>
          </div>

          <div className="controls">
            <label>
              <span>Quantidade</span>
              <div className="number-control">
                <button onClick={() => setCount(v => Math.max(1, v - 1))}>−</button>
                <input type="number" min="1" max="50" value={count}
                  onChange={e => setCount(Math.min(50, Math.max(1, Number(e.target.value) || 1)))} />
                <button onClick={() => setCount(v => Math.min(50, v + 1))}>+</button>
              </div>
            </label>

            <label>
              <span>Dado</span>
              <select value={sides} onChange={e => setSides(Number(e.target.value))}>
                {DICE.map(d => <option key={d} value={d}>d{d}</option>)}
              </select>
            </label>

            <label>
              <span>Modificador</span>
              <input className="modifier-input" type="number" value={modifier}
                onChange={e => setModifier(Number(e.target.value) || 0)} />
            </label>
          </div>

          <div className="quick-dice">
            {DICE.map(d => (
              <button key={d} className={sides === d ? "active" : ""} onClick={() => setSides(d)}>
                d{d}
              </button>
            ))}
          </div>

          <button className={`roll-button ${rolling ? "rolling" : ""}`} onClick={doRoll}>
            <Dice5 size={24}/>
            {rolling ? "Rolando..." : "ROLAR"}
          </button>

          <div className="result-card">
            <div className="result-label">RESULTADO</div>
            {results.length ? (
              <>
                <div className="dice-results">
                  {results.map((value, i) => (
                    <DiceFace key={i} value={value} sides={sides}
                      highlight={value === sides || value === 1} />
                  ))}
                </div>
                <div className="math-line">
                  <span>{results.join(" + ")}</span>
                  {Number(modifier) !== 0 && <span> {Number(modifier) > 0 ? "+" : "−"} {Math.abs(Number(modifier))}</span>}
                </div>
                <div className="total">{total}</div>
                <button className="copy-button" onClick={copyResult}>
                  {copied ? <Check size={15}/> : <Copy size={15}/>}
                  {copied ? "Copiado" : "Copiar resultado"}
                </button>
              </>
            ) : (
              <div className="empty-result">
                <Dice5 size={42}/>
                <span>O destino aguarda sua rolagem.</span>
              </div>
            )}
          </div>
        </div>

        <aside className="panel history-panel">
          <div className="panel-title">
            <div>
              <span className="kicker">LOG</span>
              <h2>Histórico</h2>
            </div>
            <button className="icon-button" title="Limpar histórico" onClick={clearHistory}>
              <Trash2 size={17}/>
            </button>
          </div>

          {history.length ? (
            <div className="history-list">
              {history.map(entry => (
                <div className="history-item" key={entry.id}>
                  <div className="history-main">
                    <strong>{entry.total}</strong>
                    <div>
                      <code>{entry.expression}</code>
                      <small>{entry.rolls.join(" · ")} {entry.modifier ? `${entry.modifier > 0 ? "+" : ""}${entry.modifier}` : ""}</small>
                    </div>
                  </div>
                  <button className="icon-button" title="Rolar novamente" onClick={() => rerollHistory(entry)}>
                    <RotateCcw size={15}/>
                  </button>
                  <time>{entry.createdAt}</time>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-history">
              <History size={30}/>
              <p>Nenhuma rolagem ainda.</p>
            </div>
          )}
        </aside>
      </section>

      <footer>
        <span>Local-first · histórico salvo no navegador</span>
        <span>🎲 Sem backend. Sem conta. Só dados.</span>
      </footer>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
