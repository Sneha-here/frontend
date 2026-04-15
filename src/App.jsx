import { useState, useEffect } from 'react';
import { Play, Loader2, MapPin, Users, Package, Navigation2 } from 'lucide-react';
import './index.css';

const COORDS = {
  'A': {x: 150, y: 150},
  'B': {x: 250, y: 150},
  'C': {x: 350, y: 150},
  'D': {x: 450, y: 150},
  'E': {x: 550, y: 150},
  'F': {x: 650, y: 150},
  'R1': {x: 50, y: 150},
  'R2': {x: 750, y: 150}
};

// SVG Visualizer for the Predefined Network
const NetworkGraph = ({ activeRoute }) => {
  const renderRouteHighlight = () => {
    if (!activeRoute || activeRoute.length < 2) return null;
    return activeRoute.map((node, i) => {
      if (i === 0) return null;
      const p1 = COORDS[activeRoute[i-1]];
      const p2 = COORDS[node];
      if (!p1 || !p2) return null;
      
      const isBTtoE = (p1.x === 250 && p2.x === 550) || (p1.x === 550 && p2.x === 250);
      
      if (Math.abs(p1.x - p2.x) > 100) {
        const midX = (p1.x + p2.x) / 2;
        const cY = isBTtoE ? 270 : 30;
        return <path key={`hl-${i}`} d={`M ${p1.x} 150 Q ${midX} ${cY} ${p2.x} 150`} fill="none" stroke="#f59e0b" strokeWidth="8" opacity="0.75" className="draw-line" pathLength="1" />
      }
      return <line key={`hl-${i}`} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="#f59e0b" strokeWidth="8" opacity="0.75" className="draw-line" pathLength="1" />
    });
  };

  return (
    <div className="graph-container">
      <svg width="100%" height="300" viewBox="0 0 800 300" style={{maxWidth: '800px', overflow: 'visible'}}>
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" />
          </marker>
        </defs>

        {/* Horizontal Edges */}
        <line x1="50" y1="150" x2="150" y2="150" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#arrow)" className="draw-line" pathLength="1" style={{animationDelay: "0.2s"}} />
        <line x1="150" y1="150" x2="250" y2="150" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#arrow)" className="draw-line" pathLength="1" style={{animationDelay: "0.4s"}} />
        <line x1="250" y1="150" x2="350" y2="150" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#arrow)" className="draw-line" pathLength="1" style={{animationDelay: "0.6s"}} />
        <line x1="350" y1="150" x2="450" y2="150" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#arrow)" className="draw-line" pathLength="1" style={{animationDelay: "0.8s"}} />
        <line x1="450" y1="150" x2="550" y2="150" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#arrow)" className="draw-line" pathLength="1" style={{animationDelay: "1.0s"}} />
        <line x1="550" y1="150" x2="650" y2="150" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#arrow)" className="draw-line" pathLength="1" style={{animationDelay: "1.2s"}} />
        <line x1="650" y1="150" x2="750" y2="150" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#arrow)" className="draw-line" pathLength="1" style={{animationDelay: "1.4s"}} />

        {/* Horizontal Edge Weights */}
        {[100, 200, 300, 400, 500, 600, 700].map((x, i) => (
          <text key={x} x={x} y="140" fill="#64748b" fontSize="12" fontWeight="bold" textAnchor="middle" className="fade-node" style={{animationDelay: `${0.3 + i * 0.2}s`}}>2</text>
        ))}

        {/* Curved Edges */}
        <path d="M 50 150 Q 200 30 350 150" fill="none" stroke="#3b82f6" strokeWidth="2" markerEnd="url(#arrow)" className="draw-line" pathLength="1" style={{animationDelay: "1.6s", opacity: 0.6}} />
        <path d="M 750 150 Q 600 30 450 150" fill="none" stroke="#10b981" strokeWidth="2" markerEnd="url(#arrow)" className="draw-line" pathLength="1" style={{animationDelay: "1.8s", opacity: 0.6}} />
        <path d="M 250 150 Q 400 270 550 150" fill="none" stroke="#ef4444" strokeWidth="2" markerEnd="url(#arrow)" className="draw-line" pathLength="1" style={{animationDelay: "2.0s", opacity: 0.6}} />

        {/* Curved Edge Weights */}
        <text x="200" y="80" fill="#3b82f6" fontSize="12" fontWeight="bold" textAnchor="middle" className="fade-node" style={{animationDelay: "2.1s"}}>4</text>
        <text x="600" y="80" fill="#10b981" fontSize="12" fontWeight="bold" textAnchor="middle" className="fade-node" style={{animationDelay: "2.3s"}}>3</text>
        <text x="400" y="235" fill="#ef4444" fontSize="12" fontWeight="bold" textAnchor="middle" className="fade-node" style={{animationDelay: "2.5s"}}>3</text>

        {/* Nodes */}
        {['A', 'B', 'C', 'D', 'E', 'F'].map((node, i) => (
          <g key={node} className="fade-node" style={{animationDelay: `${0.2 + i * 0.2}s`}}>
            <circle cx={150 + i * 100} cy="150" r="16" fill="#ffffff" stroke="#3b82f6" strokeWidth="2" />
            <text x={150 + i * 100} y="155" fill="#0f172a" fontSize="12" fontWeight="600" textAnchor="middle">{node}</text>
          </g>
        ))}

        {/* Restaurants */}
        <g className="fade-node" style={{animationDelay: "0s"}}>
          <rect x="30" y="130" width="40" height="40" rx="8" fill="#dbeafe" stroke="#1e40af" strokeWidth="2" />
          <text x="50" y="155" fill="#1e40af" fontSize="14" fontWeight="bold" textAnchor="middle">R1</text>
        </g>

        <g className="fade-node" style={{animationDelay: "1.6s"}}>
          <rect x="730" y="130" width="40" height="40" rx="8" fill="#dbeafe" stroke="#1e40af" strokeWidth="2" />
          <text x="750" y="155" fill="#1e40af" fontSize="14" fontWeight="bold" textAnchor="middle">R2</text>
        </g>

        {/* Dynamic Route Highlight */}
        {renderRouteHighlight()}
        
        {/* Gown active nodes */}
        {activeRoute && activeRoute.map(node => {
          const c = COORDS[node];
          return c ? <circle key={`g-${node}`} cx={c.x} cy={c.y} r="22" fill="none" stroke="#f59e0b" strokeWidth="4" className="fade-node" /> : null;
        })}
      </svg>
    </div>
  );
};

export default function App() {
  const [data, setData] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeRoute, setActiveRoute] = useState(null);

  useEffect(() => {
    fetch(`/api/data`)
      .then(res => res.json())
      .then(json => setData(json))
      .catch(err => console.error("Could not fetch predefined data", err));
  }, []);

  const runOptimization = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/optimize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await response.json();
      if (json.success) setResults(json.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!data) {
    return (
      <div className="container" style={{display:'flex', height:'100vh', alignItems:'center', justifyContent:'center'}}>
        <Loader2 className="spinner" size={48} />
      </div>
    );
  }

  return (
    <div className="container animate-fade">
      <header>
        <div className="title-group">
          <h1>Delivery Optimization Engine</h1>
          <p>Comparing Heuristic vs DP vs Backtracking on predefined networks</p>
        </div>
        <button className="btn-primary" onClick={runOptimization} disabled={loading}>
          {loading ? <Loader2 size={18} className="spinner" style={{color:'white'}} /> : <Play size={18} />}
          Run Simulation
        </button>
      </header>

      <main className="layout-grid">
        <div className="card">
          <div style={{display:'flex', justifyContent:'space-between'}}>
            <h2 className="card-header"><MapPin /> Network Topology</h2>
            {activeRoute && <span style={{fontSize:'0.85rem', color:'#f59e0b', fontWeight:600}}><Navigation2 size={14} style={{display:'inline', verticalAlign:'-3px'}}/> Tracing Agent Path...</span>}
          </div>
          <NetworkGraph activeRoute={activeRoute} />
          
          <div className="info-grid">
            <div>
              <h3 className="card-header" style={{fontSize:'0.9rem', marginBottom:'0.75rem'}}><Users size={16}/> Agents</h3>
              <div className="data-list">
                {data.agents.map((a, i) => (
                  <div key={i} className="data-item">
                    <span>Agent <strong>{a.id}</strong></span>
                    <span className="badge-agent" style={{border: 'none'}}>At {a.restaurant}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="card-header" style={{fontSize:'0.9rem', marginBottom:'0.75rem'}}><Package size={16}/> Pending Orders</h3>
              <div className="data-list">
                {data.orders.map((o, i) => (
                  <div key={i} className="data-item">
                    <span>Order #{o.id}</span>
                    <span style={{color: 'var(--text-muted)'}}>{o.restaurant} &rarr; {o.customer}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {results && (
          <div className="results-grid animate-fade">
            {[
               { title: "First-Come First-Serve", key: "fcfs", data: results.fcfs },
               { title: "Dynamic Programming", key: "dp", data: results.dp },
               { title: "Backtracking", key: "backtracking", data: results.backtracking }
            ].map((alg) => {
              const minCost = Math.min(results.fcfs.totalCost, results.dp.totalCost, results.backtracking.totalCost);
              const isWinner = alg.data.totalCost === minCost;
              return (
                <div key={alg.key} className={`result-card ${isWinner ? 'winner' : ''}`}>
                  <div className="algo-name">
                    {alg.title}
                    {isWinner && <span className="badge-winner">Optimal</span>}
                  </div>
                  <div className="algo-cost">{alg.data.totalCost}</div>
                  
                  <div className="assignment-header">Order Assignments (Hover to Trace)</div>
                  <div>
                    {alg.data.assignment.map((item, idx) => (
                      <div 
                        key={idx} 
                        className="assignment-item fade-node" 
                        style={{ animationDelay: `${(idx + 1) * 0.4}s`, cursor: 'pointer' }}
                        onMouseEnter={() => setActiveRoute(item.route)}
                        onMouseLeave={() => setActiveRoute(null)}
                      >
                        <div>
                          <strong>Order #{item.orderId || (idx+1)}</strong>
                          <div style={{fontSize:'0.75rem', color:'var(--text-muted)'}}>{item.route?.join(' → ')}</div>
                        </div>
                        <div>
                          <span style={{color: 'var(--text-muted)', marginRight:'0.5rem', fontSize:'0.8rem'}}>Cost: {item.cost}</span>
                          <span className="badge-agent">{item.agentId}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
