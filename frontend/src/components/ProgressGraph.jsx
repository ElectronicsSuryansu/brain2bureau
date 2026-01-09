import React, { useState, useRef, useEffect } from 'react';

// Enhanced SVG chart with tooltip and legend support.
// Props:
// - data: [{date: '2026-01-01', value: number}, ...]
// - width, height
// - type: 'line'|'bar'
// - color
// - showGrid
// - tooltipEnabled (bool)
// - legend (string)

export default function ProgressGraph({ data = [], width = 600, height = 160, type = 'line', color = '#3b82f6', showGrid = true, tooltipEnabled = false, legend }) {
  const [hover, setHover] = useState(null);
  const svgRef = useRef(null);

  if (!data || !data.length) return <div style={{padding:16, color:'var(--text-secondary)'}}>No data to display</div>;

  const padding = { top: 18, right: 12, bottom: 28, left: 40 };
  const W = width - padding.left - padding.right;
  const H = height - padding.top - padding.bottom;

  const values = data.map(d => d.value || 0);
  const max = Math.max(...values, 10);
  const min = Math.min(...values, 0);
  const range = max - min || 1;

  const xStep = W / Math.max(1, data.length - 1);

  const points = data.map((d, i) => {
    const x = padding.left + i * xStep;
    const y = padding.top + H - ((d.value - min) / range) * H;
    return { x, y, label: d.date, v: d.value };
  });

  const dPath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  // Tooltip positioning utilities
  const onPointEnter = (pt, evt) => {
    if (!tooltipEnabled) return;
    const bbox = svgRef.current.getBoundingClientRect();
    setHover({ x: pt.x - bbox.left, y: pt.y - bbox.top, label: pt.label, value: pt.v });
  };
  const onLeave = () => setHover(null);

  // Limited effect to re-hide tooltip on resize
  useEffect(() => { const h = () => setHover(null); window.addEventListener('resize', h); return () => window.removeEventListener('resize', h); }, []);

  return (
    <div style={{position:'relative'}}>
      {legend && <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:6}}><div style={{width:12,height:12,background:color,borderRadius:4}} /> <div style={{fontSize:13,fontWeight:700}}>{legend}</div></div>}
      <svg ref={svgRef} width={width} height={height} style={{display:'block'}}> 
        {/* Grid lines */}
        {showGrid && Array.from({length:4}).map((_,i) => {
          const y = padding.top + (H * i) / 3;
          const label = Math.round(max - (range * i) / 3);
          return (
            <g key={i}>
              <line x1={padding.left} x2={padding.left+W} y1={y} y2={y} stroke="rgba(0,0,0,0.04)" />
              <text x={8} y={y+4} fontSize={11} fill="var(--text-secondary)">{label}</text>
            </g>
          );
        })}

        {/* Line area and points */}
        {type === 'line' && (
          <>
            <path d={dPath} fill="none" stroke={color} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
            <path d={`${dPath} L ${padding.left+W} ${padding.top+H} L ${padding.left} ${padding.top+H} Z`} fill={`${color}22`} stroke="none" />
            {points.map((p, i) => (
              <g key={i} onMouseEnter={(e) => onPointEnter(p,e)} onMouseMove={(e)=>onPointEnter(p,e)} onMouseLeave={onLeave} style={{cursor: tooltipEnabled ? 'pointer' : 'default'}}>
                <circle cx={p.x} cy={p.y} r={5} fill={color} opacity={hover && hover.label === p.label ? 1 : 0.95} />
                {/* transparent hit area for easier hover */}
                <circle cx={p.x} cy={p.y} r={10} fill="transparent" />
              </g>
            ))}
          </>
        )}

        {/* Bars */}
        {type === 'bar' && points.map((p, idx) => {
          const barW = Math.max(6, xStep * 0.6);
          const x = p.x - barW/2;
          const y = p.y;
          const h = padding.top + H - y;
          return <rect key={idx} x={x} y={y} width={barW} height={h} fill={color} rx={4} />;
        })}

        {/* X labels */}
        {points.map((p, i) => {
          const show = (i === 0 || i === points.length - 1 || i % Math.ceil(Math.max(1, points.length / 4)) === 0);
          return show ? <text key={i} x={p.x} y={height - 6} fontSize={11} fill="var(--text-secondary)" textAnchor="middle">{p.label}</text> : null;
        })}
      </svg>

      {/* Tooltip */}
      {hover && (
        <div style={{position:'absolute', left:Math.max(6, hover.x - 60), top:Math.max(6, hover.y - 60), background:'var(--card-bg)', border:`1px solid var(--border-color)`, padding:8, borderRadius:8, boxShadow:'0 8px 20px rgba(2,6,23,0.08)', pointerEvents:'none', minWidth:120}}>
          <div style={{fontSize:12, color:'var(--text-secondary)'}}>{hover.label}</div>
          <div style={{fontWeight:800, fontSize:16}}>{hover.value}{typeof hover.value === 'number' ? '%' : ''}</div>
        </div>
      )}
    </div>
  );
}
