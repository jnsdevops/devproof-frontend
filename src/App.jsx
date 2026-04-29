import { useState, useRef, useCallback, useEffect } from 'react'

const API_URL = '/api'

// ── Theme ─────────────────────────────────────────────────────────────────────
const THEMES = {
  light: {
    '--bg':        '#FFFFFF',
    '--bg1':       '#FAFAFA',
    '--bg2':       '#F4F5F7',
    '--bg3':       '#EBECF0',
    '--surface':   '#FFFFFF',
    '--border':    '#DCDFE6',
    '--border2':   '#C9CDD6',
    '--text':      '#1F2329',
    '--text2':     '#525966',
    '--text3':     '#8F96A3',
    '--primary':   '#1F75CB',
    '--primary-bg':'#E8F0FB',
    '--primary-hover': '#1A65B5',
    '--success':   '#108548',
    '--success-bg':'#ECFDF0',
    '--warning':   '#C17D10',
    '--warning-bg':'#FFF9EC',
    '--danger':    '#DD2B0E',
    '--danger-bg': '#FFF4F2',
    '--purple':    '#6B4FBB',
    '--code-bg':   '#1E2432',
    '--shadow':    '0 1px 4px rgba(0,0,0,.08), 0 0 1px rgba(0,0,0,.06)',
    '--shadow-md': '0 4px 16px rgba(0,0,0,.10)',
  },
  dark: {
    '--bg':        '#1C2130',
    '--bg1':       '#16202A',
    '--bg2':       '#1F2B3A',
    '--bg3':       '#243042',
    '--surface':   '#1F2B3A',
    '--border':    '#2D3A4A',
    '--border2':   '#3A4A5C',
    '--text':      '#E8F0FF',
    '--text2':     '#9CADC0',
    '--text3':     '#5E7087',
    '--primary':   '#5B9CF6',
    '--primary-bg':'rgba(91,156,246,0.12)',
    '--primary-hover':'#4A8DE8',
    '--success':   '#52C77F',
    '--success-bg':'rgba(82,199,127,0.1)',
    '--warning':   '#F5A623',
    '--warning-bg':'rgba(245,166,35,0.1)',
    '--danger':    '#FF6B6B',
    '--danger-bg': 'rgba(255,107,107,0.1)',
    '--purple':    '#9B7FE8',
    '--code-bg':   '#0D1117',
    '--shadow':    '0 1px 4px rgba(0,0,0,.3)',
    '--shadow-md': '0 4px 16px rgba(0,0,0,.4)',
  }
}

function applyTheme(mode) {
  const vars = THEMES[mode]
  const root = document.documentElement
  Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v))
}

// ── Global CSS ─────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@300;400;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --r: 6px;
  --r2: 8px;
  --r3: 12px;
  --font: 'Nunito Sans', -apple-system, BlinkMacSystemFont, sans-serif;
  --mono: 'JetBrains Mono', monospace;
  --transition: all .18s ease;
}

body {
  font-family: var(--font);
  background: var(--bg1);
  color: var(--text);
  -webkit-font-smoothing: antialiased;
  font-size: 14px;
  line-height: 1.5;
}

input, textarea, select, button { font-family: var(--font); }

::selection { background: var(--primary-bg); color: var(--primary); }

::-webkit-scrollbar { width: 5px; height: 5px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 3px; }

@keyframes spin { to { transform: rotate(360deg); } }
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:.4; } }

.fade-up { animation: fadeUp .3s cubic-bezier(.16,1,.3,1) forwards; }

/* Focus styles */
input:focus, textarea:focus, select:focus {
  outline: none;
  border-color: var(--primary) !important;
  box-shadow: 0 0 0 3px var(--primary-bg);
}

/* Hover on interactive elements */
button:hover { transition: var(--transition); }
`

// ── Nubian Sun Logo ────────────────────────────────────────────────────────────
// Inspired by Meroitic art: sun disk + Ankh cross + pyramid geometry
function NubianLogo({ size = 32, primary = '#1F75CB' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Outer sun ring with rays — Meroe sun disk */}
      <circle cx="20" cy="20" r="18" stroke={primary} strokeWidth="1.5" fill="none" opacity=".25"/>
      <circle cx="20" cy="20" r="14" stroke={primary} strokeWidth="1" fill="none" opacity=".15"/>

      {/* Sun rays — 8 rays like Meroitic sun */}
      {[0,45,90,135,180,225,270,315].map((angle, i) => {
        const rad = (angle * Math.PI) / 180
        const x1 = 20 + 14.5 * Math.cos(rad)
        const y1 = 20 + 14.5 * Math.sin(rad)
        const x2 = 20 + 18 * Math.cos(rad)
        const y2 = 20 + 18 * Math.sin(rad)
        return <line key={i} x1={x1.toFixed(2)} y1={y1.toFixed(2)} x2={x2.toFixed(2)} y2={y2.toFixed(2)} stroke={primary} strokeWidth="1.5" strokeLinecap="round" opacity=".6"/>
      })}

      {/* Pyramid / Triangle — Nubian pyramid form */}
      <path d="M20 8 L28 26 L12 26 Z" fill={primary} opacity=".15" stroke={primary} strokeWidth="1.2" strokeLinejoin="round"/>

      {/* Ankh cross — inside pyramid */}
      {/* Vertical line */}
      <line x1="20" y1="17" x2="20" y2="25" stroke={primary} strokeWidth="1.8" strokeLinecap="round"/>
      {/* Horizontal bar */}
      <line x1="16.5" y1="21" x2="23.5" y2="21" stroke={primary} strokeWidth="1.8" strokeLinecap="round"/>
      {/* Oval top of Ankh */}
      <ellipse cx="20" cy="15.5" rx="2.8" ry="2" stroke={primary} strokeWidth="1.5" fill="none"/>

      {/* Center dot — the eye / awareness */}
      <circle cx="20" cy="20" r="1.5" fill={primary} opacity=".8"/>
    </svg>
  )
}

// ── Architecture SVG ───────────────────────────────────────────────────────────
function ArchSVG({ arch }) {
  if (!arch?.components?.length) return (
    <div style={{ padding: 32, textAlign: 'center', color: 'var(--text3)', fontSize: 13 }}>
      No architecture data available
    </div>
  )
  const comps = arch.components || [], edges = arch.edges || []
  const CW=180, RH=110, PX=40, PY=50, NW=148, NH=56
  const maxCol = Math.max(...comps.map(c => c.col||0))
  const maxRow = Math.max(...comps.map(c => c.row||0))
  const W = (maxCol+1)*CW + PX*2
  const H = (maxRow+1)*RH + PY*2 + 50
  const pos = {}
  comps.forEach(n => { pos[n.id] = { x: PX+(n.col||0)*CW+CW/2, y: PY+40+(n.row||0)*RH+RH/2 }})
  const ST = {
    client:  {bg:'#E8F0FB',b:'#1F75CB',a:'#1F75CB'},
    cicd:    {bg:'#FFF9EC',b:'#C17D10',a:'#C17D10'},
    cluster: {bg:'#E8F0FB',b:'#1F75CB',a:'#1F75CB'},
    node:    {bg:'#ECFDF0',b:'#108548',a:'#108548'},
    service: {bg:'#FFF4F2',b:'#DD2B0E',a:'#DD2B0E'},
    security:{bg:'#FFF4F2',b:'#DD2B0E',a:'#DD2B0E'},
    monitor: {bg:'#F4F0FF',b:'#6B4FBB',a:'#6B4FBB'},
    default: {bg:'var(--bg2)',b:'var(--border2)',a:'var(--text2)'},
  }
  const EC = { dashed:'#9CADC0', solid:'#1F75CB', bold:'#108548' }
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{maxWidth:'100%',display:'block',margin:'auto'}}>
      <defs>
        {[['d','#9CADC0'],['s','#1F75CB'],['b','#108548']].map(([id,fill])=>(
          <marker key={id} id={`ar-${id}`} markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill={fill}/>
          </marker>
        ))}
      </defs>
      <rect width={W} height={H} fill="#FAFAFA" rx="8"/>
      <text x={W/2} y="22" textAnchor="middle" fontFamily="Nunito Sans,sans-serif" fontSize="11" fill="#8F96A3" fontWeight="600">
        {arch.title || 'Architecture'}
      </text>
      {edges.map((ed,i)=>{
        const f=pos[ed.from],t=pos[ed.to]
        if(!f||!t) return null
        const dx=t.x-f.x,dy=t.y-f.y,dist=Math.sqrt(dx*dx+dy*dy)||1
        const off=NW/2+8,rx=dx/dist,ry=dy/dist
        const mk=ed.style==='bold'?'url(#ar-b)':ed.style==='dashed'?'url(#ar-d)':'url(#ar-s)'
        const clr=EC[ed.style||'solid']
        const mx=(f.x+t.x)/2,my=(f.y+t.y)/2
        return (
          <g key={i}>
            <line
              x1={(f.x+rx*off).toFixed(1)} y1={(f.y+ry*off).toFixed(1)}
              x2={(t.x-rx*off).toFixed(1)} y2={(t.y-ry*off).toFixed(1)}
              stroke={clr} strokeWidth={ed.style==='bold'?2:1.5}
              strokeDasharray={ed.style==='dashed'?'5,3':'none'}
              markerEnd={mk} opacity=".8"/>
            {ed.label&&<>
              <rect x={mx-22} y={my-7} width="44" height="13" rx="3" fill="white" opacity=".9"/>
              <text x={mx} y={my+3} textAnchor="middle" fontFamily="JetBrains Mono,monospace" fontSize="8" fill={clr}>{ed.label}</text>
            </>}
          </g>
        )
      })}
      {comps.map(n=>{
        const p=pos[n.id]; if(!p) return null
        const st=ST[n.type]||ST.default
        const x=p.x-NW/2,y=p.y-NH/2
        return (
          <g key={n.id}>
            <rect x={x} y={y} width={NW} height={NH} rx="6" fill={st.bg} stroke={st.b} strokeWidth="1.5"/>
            <text x={p.x} y={n.sublabel?p.y+2:p.y+6} textAnchor="middle" fontFamily="Nunito Sans,sans-serif" fontSize="12" fontWeight="700" fill={st.a}>{n.label||n.id}</text>
            {n.sublabel&&<text x={p.x} y={p.y+16} textAnchor="middle" fontFamily="JetBrains Mono,monospace" fontSize="8" fill={st.a} opacity=".6">{n.sublabel}</text>}
          </g>
        )
      })}
    </svg>
  )
}

// ── Markdown renderer ──────────────────────────────────────────────────────────
function renderMd(text) {
  if (!text) return ''
  return text
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/^### (.+)$/gm,'<h3 style="font-size:15px;font-weight:700;margin:18px 0 6px;color:var(--text)">$1</h3>')
    .replace(/^## (.+)$/gm,'<h2 style="font-size:17px;font-weight:700;margin:22px 0 8px;color:var(--text);border-bottom:1px solid var(--border);padding-bottom:8px">$1</h2>')
    .replace(/^# (.+)$/gm,'<h1 style="font-size:22px;font-weight:800;margin:0 0 16px;color:var(--text)">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g,'<strong style="font-weight:700;color:var(--text)">$1</strong>')
    .replace(/`([^`]+)`/g,'<code style="background:var(--bg2);padding:2px 6px;border-radius:4px;font-family:var(--mono);font-size:12px;color:var(--primary)">$1</code>')
    .replace(/```[\w]*\n([\s\S]*?)```/g,'<pre style="background:var(--code-bg);color:#7DD3FC;padding:14px;border-radius:var(--r2);overflow:auto;font-size:12px;margin:10px 0;font-family:var(--mono);line-height:1.6"><code>$1</code></pre>')
    .replace(/^\| (.+) \|$/gm,(m,c)=>{
      const cells=c.split(' | ').map(x=>`<td style="padding:8px 12px;border:1px solid var(--border);font-size:13px">${x}</td>`).join('')
      return `<tr>${cells}</tr>`
    })
    .replace(/(<tr>.*<\/tr>\n?)+/gs,m=>`<table style="border-collapse:collapse;width:100%;margin:12px 0;font-size:13px">${m}</table>`)
    .replace(/^---$/gm,'<hr style="border:none;border-top:1px solid var(--border);margin:20px 0">')
    .replace(/^\> (.+)$/gm,'<blockquote style="border-left:3px solid var(--primary);padding:8px 14px;margin:10px 0;background:var(--primary-bg);color:var(--text2);border-radius:0 var(--r) var(--r) 0;font-style:italic">$1</blockquote>')
    .replace(/^[•\-] (.+)$/gm,'<li style="margin:4px 0;padding-left:4px;color:var(--text2);font-size:13.5px">$1</li>')
    .replace(/(<li.*<\/li>\n?)+/gs,m=>`<ul style="margin:8px 0;padding-left:20px">${m}</ul>`)
    .replace(/\n\n/g,'</p><p style="margin:8px 0;color:var(--text2);line-height:1.7;font-size:13.5px">')
}

// ── Lightbox ───────────────────────────────────────────────────────────────────
function Lightbox({ src, onClose }) {
  useEffect(() => {
    const h = e => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])
  return (
    <div onClick={onClose} style={{
      position:'fixed',inset:0,background:'rgba(0,0,0,.8)',zIndex:1000,
      display:'flex',alignItems:'center',justifyContent:'center',cursor:'zoom-out',
      backdropFilter:'blur(4px)'
    }}>
      <img src={src} style={{maxWidth:'92vw',maxHeight:'90vh',borderRadius:8,boxShadow:'0 24px 60px rgba(0,0,0,.5)'}}
        onClick={e=>e.stopPropagation()}/>
      <button onClick={onClose} style={{
        position:'absolute',top:16,right:20,background:'rgba(255,255,255,.15)',
        border:'none',color:'#fff',width:32,height:32,borderRadius:'50%',
        fontSize:16,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'
      }}>✕</button>
    </div>
  )
}

// ── Annotation Editor (Canvas) ───────────────────────────────────────────────
function AnnotationEditor({ imgSrc, callouts, stepNum, onSave, onClose }) {
  const canvasRef = useRef()
  const [boxes, setBoxes] = useState(
    callouts.map((c, i) => ({
      id: c.id || i + 1,
      x0: c.x0_pct || 10, y0: c.y0_pct || 20,
      x1: c.x1_pct || 45, y1: c.y1_pct || 35,
      color: c.color || 'cyan',
      label: c.label || '',
      explanation: c.explanation || '',
    }))
  )
  const [selected, setSelected] = useState(null)
  const [drawing, setDrawing] = useState(false)
  const [dragStart, setDragStart] = useState(null)
  const [imgLoaded, setImgLoaded] = useState(false)
  const imgRef = useRef()

  const COLORS = {
    cyan: '#00C8FF', green: '#00D68F',
    amber: '#FF9500', red: '#FF4560', pink: '#EC4899'
  }

  function getRelativePos(e) {
    const rect = canvasRef.current.getBoundingClientRect()
    return {
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    }
  }

  function onMouseDown(e) {
    const pos = getRelativePos(e)
    // Check if clicking on existing box
    const hit = boxes.findIndex(b =>
      pos.x >= b.x0 && pos.x <= b.x1 &&
      pos.y >= b.y0 && pos.y <= b.y1
    )
    if (hit >= 0) { setSelected(hit); return }
    // Start drawing new box
    setDrawing(true)
    setDragStart(pos)
    setSelected(null)
  }

  function onMouseMove(e) {
    if (!drawing || !dragStart) return
    const pos = getRelativePos(e)
    const newBox = {
      id: boxes.length + 1,
      x0: Math.min(dragStart.x, pos.x),
      y0: Math.min(dragStart.y, pos.y),
      x1: Math.max(dragStart.x, pos.x),
      y1: Math.max(dragStart.y, pos.y),
      color: 'cyan', label: '', explanation: '',
    }
    setBoxes(prev => {
      const updated = [...prev]
      if (drawing && updated[updated.length - 1]?.drawing) {
        updated[updated.length - 1] = { ...newBox, drawing: true }
      } else {
        updated.push({ ...newBox, drawing: true })
      }
      return updated
    })
  }

  function onMouseUp(e) {
    if (!drawing) return
    setDrawing(false)
    setDragStart(null)
    setBoxes(prev => prev.map(b => ({ ...b, drawing: false })))
    setSelected(boxes.length > 0 ? boxes.length - 1 : null)
  }

  function deleteBox(idx) {
    setBoxes(prev => prev.filter((_, i) => i !== idx).map((b, i) => ({ ...b, id: i + 1 })))
    setSelected(null)
  }

  function updateBox(idx, field, value) {
    setBoxes(prev => prev.map((b, i) => i === idx ? { ...b, [field]: value } : b))
  }

  function handleSave() {
    const saved = boxes.filter(b => !b.drawing).map(b => ({
      id: b.id,
      x0_pct: Math.round(b.x0 * 10) / 10,
      y0_pct: Math.round(b.y0 * 10) / 10,
      x1_pct: Math.round(b.x1 * 10) / 10,
      y1_pct: Math.round(b.y1 * 10) / 10,
      color: b.color,
      label: b.label,
      explanation: b.explanation,
    }))
    onSave(saved)
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,.92)',
      zIndex: 1000, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 12, padding: 16,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', maxWidth: 900 }}>
        <div style={{ color: '#fff', fontSize: 14, fontWeight: 700 }}>
          ✏️ Edit Annotations — Step {stepNum}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={handleSave} style={{
            padding: '7px 16px', background: '#00C8FF', color: '#070B12',
            border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 700, cursor: 'pointer'
          }}>✓ Save</button>
          <button onClick={onClose} style={{
            padding: '7px 16px', background: 'rgba(255,255,255,.15)',
            color: '#fff', border: 'none', borderRadius: 6, fontSize: 13, cursor: 'pointer'
          }}>Cancel</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, width: '100%', maxWidth: 900 }}>
        {/* Canvas */}
        <div style={{ flex: 1, position: 'relative', cursor: drawing ? 'crosshair' : 'default' }}>
          <img ref={imgRef} src={imgSrc} onLoad={() => setImgLoaded(true)}
            style={{ width: '100%', display: 'block', borderRadius: 8, userSelect: 'none' }}/>
          {imgLoaded && (
            <div ref={canvasRef}
              onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp}
              style={{ position: 'absolute', inset: 0, cursor: drawing ? 'crosshair' : 'default' }}>
              {boxes.map((b, idx) => (
                <div key={idx} onClick={() => setSelected(idx)} style={{
                  position: 'absolute',
                  left: `${b.x0}%`, top: `${b.y0}%`,
                  width: `${b.x1 - b.x0}%`, height: `${b.y1 - b.y0}%`,
                  border: `2px solid ${COLORS[b.color] || '#00C8FF'}`,
                  background: `${COLORS[b.color] || '#00C8FF'}22`,
                  boxShadow: selected === idx ? `0 0 0 2px white` : 'none',
                  cursor: 'pointer', borderRadius: 3,
                }}>
                  <div style={{
                    position: 'absolute', top: -22, left: 0,
                    background: COLORS[b.color] || '#00C8FF',
                    color: '#000', fontSize: 10, fontWeight: 800,
                    padding: '2px 6px', borderRadius: 3, whiteSpace: 'nowrap'
                  }}>{b.id} {b.label}</div>
                </div>
              ))}
            </div>
          )}
          <div style={{ marginTop: 8, fontSize: 11, color: 'rgba(255,255,255,.5)', textAlign: 'center' }}>
            Click and drag to draw a new annotation box • Click a box to select and edit it
          </div>
        </div>

        {/* Controls panel */}
        <div style={{ width: 220, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,.7)' }}>
            ANNOTATIONS ({boxes.filter(b=>!b.drawing).length})
          </div>

          {boxes.filter(b => !b.drawing).map((b, idx) => (
            <div key={idx} onClick={() => setSelected(idx)} style={{
              padding: 10, borderRadius: 8, cursor: 'pointer',
              border: `1px solid ${selected === idx ? COLORS[b.color] : 'rgba(255,255,255,.1)'}`,
              background: selected === idx ? 'rgba(255,255,255,.08)' : 'rgba(255,255,255,.04)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: COLORS[b.color] }}>#{b.id}</span>
                <button onClick={e => { e.stopPropagation(); deleteBox(idx) }} style={{
                  background: 'rgba(255,69,96,.3)', border: 'none', color: '#FF4560',
                  width: 18, height: 18, borderRadius: '50%', fontSize: 10, cursor: 'pointer'
                }}>✕</button>
              </div>
              {selected === idx && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <input value={b.label} onChange={e => updateBox(idx, 'label', e.target.value)}
                    placeholder="Label (2-3 words)" style={{
                      padding: '4px 8px', fontSize: 11, borderRadius: 4,
                      border: '1px solid rgba(255,255,255,.2)', background: 'rgba(255,255,255,.05)',
                      color: '#fff', outline: 'none'
                    }}/>
                  <input value={b.explanation} onChange={e => updateBox(idx, 'explanation', e.target.value)}
                    placeholder="Why this matters" style={{
                      padding: '4px 8px', fontSize: 11, borderRadius: 4,
                      border: '1px solid rgba(255,255,255,.2)', background: 'rgba(255,255,255,.05)',
                      color: '#fff', outline: 'none'
                    }}/>
                  <select value={b.color} onChange={e => updateBox(idx, 'color', e.target.value)} style={{
                    padding: '4px 8px', fontSize: 11, borderRadius: 4,
                    border: '1px solid rgba(255,255,255,.2)', background: '#1a1a2e',
                    color: '#fff', outline: 'none', cursor: 'pointer'
                  }}>
                    <option value="cyan">Cyan — commands</option>
                    <option value="green">Green — success</option>
                    <option value="amber">Amber — config</option>
                    <option value="red">Red — errors</option>
                    <option value="pink">Pink — buttons</option>
                  </select>
                </div>
              )}
            </div>
          ))}

          <div style={{ fontSize: 10, color: 'rgba(255,255,255,.35)', marginTop: 8 }}>
            Max 2 annotations per image recommended
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Markdown Editor ────────────────────────────────────────────────────────────
function MarkdownEditor({ value, onChange, label, icon }) {
  const [tab, setTab] = useState('edit')
  return (
    <div style={{border:'1px solid var(--border)',borderRadius:'var(--r2)',overflow:'hidden',background:'var(--surface)'}}>
      <div style={{
        display:'flex',alignItems:'center',justifyContent:'space-between',
        padding:'8px 14px',background:'var(--bg2)',borderBottom:'1px solid var(--border)'
      }}>
        <span style={{fontSize:13,fontWeight:600,color:'var(--text2)',display:'flex',alignItems:'center',gap:6}}>
          {icon} {label}
        </span>
        <div style={{display:'flex',gap:2}}>
          {['edit','preview','split'].map(t=>(
            <button key={t} onClick={()=>setTab(t)} style={{
              padding:'4px 10px',fontSize:12,fontWeight:600,borderRadius:'var(--r)',cursor:'pointer',
              border:`1px solid ${tab===t?'var(--primary)':'transparent'}`,
              background:tab===t?'var(--primary-bg)':'transparent',
              color:tab===t?'var(--primary)':'var(--text3)',transition:'var(--transition)'
            }}>{t.charAt(0).toUpperCase()+t.slice(1)}</button>
          ))}
        </div>
      </div>
      <div style={{display:'flex',minHeight:320}}>
        {(tab==='edit'||tab==='split')&&(
          <textarea value={value} onChange={e=>onChange(e.target.value)} style={{
            flex:1,padding:'14px',fontFamily:'var(--mono)',fontSize:12.5,
            color:'var(--text)',background:'var(--surface)',border:'none',outline:'none',
            resize:'vertical',minHeight:320,lineHeight:1.65,
            borderRight:tab==='split'?'1px solid var(--border)':'none'
          }}/>
        )}
        {(tab==='preview'||tab==='split')&&(
          <div style={{
            flex:1,padding:'16px 20px',fontSize:13.5,lineHeight:1.7,
            overflowY:'auto',background:'var(--surface)',color:'var(--text2)'
          }} dangerouslySetInnerHTML={{__html:renderMd(value)}}/>
        )}
      </div>
    </div>
  )
}

// ── Pipeline steps ─────────────────────────────────────────────────────────────
const STEPS = [
  'Analyzing screenshots with AI vision',
  'Detecting sensitive data',
  'Reordering by pipeline logic',
  'Planning annotations',
  'Generating documentation',
  'Building architecture diagram',
  'Finalizing output',
]

// ── Languages ──────────────────────────────────────────────────────────────────
const LANGS = [
  {code:'en',label:'English'},
  {code:'fr',label:'Français'},
  {code:'es',label:'Español'},
  {code:'pt',label:'Português'},
  {code:'de',label:'Deutsch'},
]

// ── Main App ───────────────────────────────────────────────────────────────────
export default function App() {
  const [theme, setTheme] = useState('light')
  const [shots, setShots] = useState([])
  const [projName, setProjName] = useState('')
  const [projCtx, setProjCtx] = useState('')
  const [lang, setLang] = useState('en')
  const [phase, setPhase] = useState('upload')
  const [procStep, setProcStep] = useState(0)
  const [results, setResults] = useState(null)
  const [annotated, setAnnotated] = useState({})
  const [activeTab, setActiveTab] = useState('steps')
  const [error, setError] = useState('')
  const [drag, setDrag] = useState(false)
  const [lightboxSrc, setLightboxSrc] = useState(null)
  const [annotEditor, setAnnotEditor] = useState(null) // {stepNum, imgSrc, callouts}
  const fileRef = useRef()

  const [readmeMd, setReadmeMd] = useState('')
  const [mediumPost, setMediumPost] = useState('')
  const [linkedinPost, setLinkedinPost] = useState('')
  const [archMd, setArchMd] = useState('')

  const [ghToken, setGhToken] = useState(localStorage.getItem('dp_gh')||'')
  const [ghRepo, setGhRepo] = useState('')
  const [ghRepos, setGhRepos] = useState([])
  const [glToken, setGlToken] = useState(localStorage.getItem('dp_gl')||'')
  const [glProject, setGlProject] = useState('')
  const [glProjects, setGlProjects] = useState([])
  const [mdToken, setMdToken] = useState(localStorage.getItem('dp_md')||'')
  const [mdMode, setMdMode] = useState('draft')
  const [liMode, setLiMode] = useState('copy')
  const [showPub, setShowPub] = useState(false)
  const [pushStatus, setPushStatus] = useState({})

  // Inject CSS + apply theme
  useEffect(() => {
    if (!document.getElementById('dp-css')) {
      const s = document.createElement('style')
      s.id = 'dp-css'; s.textContent = CSS
      document.head.appendChild(s)
    }
    applyTheme(theme)
  }, [theme])

  const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light')

  const addFiles = useCallback(files => {
    Array.from(files).filter(f=>f.type.startsWith('image/')).forEach(file=>{
      const r = new FileReader()
      r.onload = e => setShots(p=>[...p,{id:Date.now()+Math.random(),file,name:file.name,preview:e.target.result}])
      r.readAsDataURL(file)
    })
  },[])

  async function fetchGHRepos(tok) {
    try {
      const r = await fetch('https://api.github.com/user/repos?per_page=100&sort=updated',
        {headers:{Authorization:`token ${tok}`,Accept:'application/vnd.github.v3+json'}})
      const d = await r.json()
      setGhRepos(d.filter(x=>!x.archived).map(x=>({name:x.full_name,id:x.full_name})))
    } catch { setGhRepos([]) }
  }

  async function fetchGLProjects(tok) {
    try {
      const r = await fetch('https://gitlab.com/api/v4/projects?membership=true&per_page=100',
        {headers:{'PRIVATE-TOKEN':tok}})
      const d = await r.json()
      setGlProjects(d.map(p=>({name:p.path_with_namespace,id:p.path_with_namespace})))
    } catch { setGlProjects([]) }
  }

  async function generate() {
    if (!shots.length) return
    setError(''); setAnnotated({}); setPhase('proc'); setProcStep(0)
    try {
      const fd = new FormData()
      shots.forEach(s=>fd.append('files',s.file,s.name))
      fd.append('project_name', projName||'Technical Project')
      fd.append('project_ctx', projCtx||'DevOps/Cloud')
      fd.append('language', lang)
      const res = await fetch(`${API_URL}/process`,{method:'POST',body:fd})
      if (!res.ok) { const e=await res.json().catch(()=>({detail:res.statusText})); throw new Error(e.detail||`HTTP ${res.status}`) }
      const {job_id} = await res.json()
      let attempts = 0
      while (attempts < 80) {
        await new Promise(r=>setTimeout(r,3000))
        attempts++
        const sr = await fetch(`${API_URL}/status/${job_id}`)
        if (!sr.ok) throw new Error('Failed to check status')
        const job = await sr.json()
        const step = job.progress<10?0:job.progress<30?1:job.progress<50?2:job.progress<65?3:job.progress<80?4:job.progress<92?5:6
        setProcStep(step)
        if (job.status==='done') {
          const d = job.result
          const merged = {...d.analysis,...d.content}
          setResults(merged); setAnnotated(d.annotated_images||{})
          setReadmeMd(d.content?.readme_md||'')
          setMediumPost(d.content?.medium_post||'')
          setLinkedinPost(d.content?.linkedin_post||'')
          setArchMd(d.content?.architecture_md||'')
          setPhase('results'); setActiveTab('steps'); return
        }
        if (job.status==='error') throw new Error(job.error||'Processing failed')
      }
      throw new Error('Timed out — please retry')
    } catch(e) { setError(e.message); setPhase('upload') }
  }

  function buildReadmeWithImages() {
    let md = readmeMd
    ;(results?.ordered_steps||[]).forEach(step=>{
      const img = annotated[String(step.number)]
      if (!img) return
      const marker = `### Step ${step.number}`
      if (md.includes(marker))
        md = md.replace(marker, `${marker}\n\n![Step ${step.number}](./images/step-${step.number}.jpg)\n`)
    })
    return md
  }

  async function downloadZip() {
    try {
      const {default:JSZip} = await import('https://cdn.jsdelivr.net/npm/jszip@3.10.1/+esm')
      const zip = new JSZip()
      const slug = (results?.title||'project').replace(/[^\w-]/g,'-').toLowerCase().slice(0,40)
      const folder = `devproof-${slug}/`
      zip.file(folder+'docs/README.md', buildReadmeWithImages())
      zip.file(folder+'docs/ARCHITECTURE.md', archMd)
      zip.file(folder+'medium-post.md', mediumPost)
      zip.file(folder+'linkedin-post.txt', linkedinPost)
      for (const [num,b64] of Object.entries(annotated)) {
        const bin=atob(b64); const arr=new Uint8Array(bin.length)
        for (let i=0;i<bin.length;i++) arr[i]=bin.charCodeAt(i)
        zip.file(folder+'docs/images/step-'+num+'.jpg', arr)
      }
      const svgEl = document.querySelector('#arch-svg svg')
      if (svgEl) zip.file(folder+'docs/images/architecture.svg', svgEl.outerHTML)
      const blob = await zip.generateAsync({type:'blob'})
      const a = document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=`devproof-${slug}.zip`; a.click()
    } catch(e) { alert('ZIP error: '+e.message) }
  }

  async function pushGitHub() {
    if (!ghToken||!ghRepo) { alert('Connect GitHub and select a repo'); return }
    setPushStatus(p=>({...p,gh:'Pushing...'}))
    const slug = (results?.title||'project').replace(/[^\w-]/g,'-').toLowerCase().slice(0,40)
    const folder = `docs/${slug}`
    const msg = `docs: add ${results?.title||'project'} via DevProof AI`
    async function put(path, content, isB64=false) {
      let sha=null
      try { const r=await fetch(`https://api.github.com/repos/${ghRepo}/contents/${path}`,{headers:{Authorization:`token ${ghToken}`,Accept:'application/vnd.github.v3+json'}}); if(r.ok) sha=(await r.json()).sha } catch{}
      const body={message:msg,content:isB64?content:btoa(unescape(encodeURIComponent(content)))}
      if (sha) body.sha=sha
      const r=await fetch(`https://api.github.com/repos/${ghRepo}/contents/${path}`,{method:'PUT',headers:{Authorization:`token ${ghToken}`,Accept:'application/vnd.github.v3+json','Content-Type':'application/json'},body:JSON.stringify(body)})
      if (!r.ok) { const d=await r.json(); throw new Error(d.message) }
    }
    try {
      await put(`${folder}/README.md`, buildReadmeWithImages())
      await put(`${folder}/ARCHITECTURE.md`, archMd)
      for (const [num,b64] of Object.entries(annotated)) await put(`${folder}/images/step-${num}.jpg`,b64,true)
      const svgEl=document.querySelector('#arch-svg svg')
      if (svgEl) await put(`${folder}/images/architecture.svg`,svgEl.outerHTML)
      setPushStatus(p=>({...p,gh:'✓ Pushed to docs/'}))
    } catch(e) { setPushStatus(p=>({...p,gh:'✗ '+e.message})) }
  }

  async function pushGitLab() {
    if (!glToken||!glProject) { alert('Connect GitLab and select a project'); return }
    setPushStatus(p=>({...p,gl:'Pushing...'}))
    const slug = (results?.title||'project').replace(/[^\w-]/g,'-').toLowerCase().slice(0,40)
    const folder = `docs/${slug}`
    const actions=[]
    const add=(path,content,isB64=false)=>actions.push({action:'create',file_path:path,content:isB64?content:btoa(unescape(encodeURIComponent(content))),encoding:'base64'})
    add(`${folder}/README.md`,buildReadmeWithImages())
    add(`${folder}/ARCHITECTURE.md`,archMd)
    for (const [num,b64] of Object.entries(annotated)) add(`${folder}/images/step-${num}.jpg`,b64,true)
    try {
      const r=await fetch(`https://gitlab.com/api/v4/projects/${encodeURIComponent(glProject)}/repository/commits`,{method:'POST',headers:{'PRIVATE-TOKEN':glToken,'Content-Type':'application/json'},body:JSON.stringify({branch:'main',commit_message:`docs: ${results?.title||'project'} — DevProof AI`,actions})})
      if (!r.ok) { const d=await r.json(); throw new Error(d.message) }
      setPushStatus(p=>({...p,gl:'✓ Pushed to docs/'}))
    } catch(e) { setPushStatus(p=>({...p,gl:'✗ '+e.message})) }
  }

  async function pushMedium() {
    if (!mdToken) { alert('Add your Medium integration token'); return }
    setPushStatus(p=>({...p,md:'Publishing...'}))
    try {
      const me=await (await fetch('https://api.medium.com/v1/me',{headers:{Authorization:`Bearer ${mdToken}`}})).json()
      if (!me.data?.id) throw new Error('Invalid token')
      const r=await fetch(`https://api.medium.com/v1/users/${me.data.id}/posts`,{method:'POST',headers:{Authorization:`Bearer ${mdToken}`,'Content-Type':'application/json'},body:JSON.stringify({title:results?.title||'DevProof Article',contentFormat:'markdown',content:mediumPost,publishStatus:mdMode==='draft'?'draft':'public',tags:results?.skills_demonstrated?.slice(0,5)||[]})})
      if (!r.ok) throw new Error('Medium API error')
      setPushStatus(p=>({...p,md:mdMode==='draft'?'✓ Draft saved':'✓ Published'}))
    } catch(e) { setPushStatus(p=>({...p,md:'✗ '+e.message})) }
  }

  function copyLinkedIn() {
    navigator.clipboard.writeText(linkedinPost||'').then(()=>{
      setPushStatus(p=>({...p,li:'✓ Copied'}))
      if (liMode==='open') window.open('https://www.linkedin.com/post/new','_blank')
    })
  }

  const statusColor = s => !s?'var(--text3)':s.startsWith('✓')?'var(--success)':s.includes('...')||s.includes('ing')?'var(--warning)':'var(--danger)'

  // ── Shared styles ──────────────────────────────────────────────────────────
  const card = {
    background:'var(--surface)',border:'1px solid var(--border)',
    borderRadius:'var(--r2)',padding:'20px',marginBottom:12,
    boxShadow:'var(--shadow)',
  }
  const inp = {
    width:'100%',padding:'8px 12px',border:'1px solid var(--border)',
    borderRadius:'var(--r)',fontSize:13.5,color:'var(--text)',
    background:'var(--surface)',outline:'none',transition:'var(--transition)',
  }
  const btn = {
    fontFamily:'var(--font)',fontSize:13,fontWeight:600,
    padding:'7px 14px',borderRadius:'var(--r)',
    border:'1px solid var(--border)',background:'var(--surface)',
    cursor:'pointer',color:'var(--text2)',transition:'var(--transition)',
    display:'inline-flex',alignItems:'center',gap:5,whiteSpace:'nowrap',
  }
  const btnPrimary = {
    ...btn, background:'var(--primary)',color:'#fff',
    border:'none',boxShadow:'0 2px 8px rgba(31,117,203,0.25)',
  }
  const tab = active => ({
    padding:'10px 16px',fontSize:13,fontWeight:600,cursor:'pointer',
    borderBottom:`2px solid ${active?'var(--primary)':'transparent'}`,
    color:active?'var(--primary)':'var(--text3)',background:'none',
    border:'none',borderBottom:`2px solid ${active?'var(--primary)':'transparent'}`,
    transition:'var(--transition)',fontFamily:'var(--font)',
  })

  const primaryColor = theme === 'light' ? '#1F75CB' : '#5B9CF6'

  return (
    <div style={{minHeight:'100vh',background:'var(--bg1)'}}>

      {lightboxSrc&&<Lightbox src={lightboxSrc} onClose={()=>setLightboxSrc(null)}/>}
      {annotEditor&&(
        <AnnotationEditor
          imgSrc={annotEditor.imgSrc}
          callouts={annotEditor.callouts}
          stepNum={annotEditor.stepNum}
          onSave={(newCallouts) => {
            setResults(prev => ({
              ...prev,
              ordered_steps: prev.ordered_steps.map(s =>
                s.number === annotEditor.stepNum ? {...s, callouts: newCallouts} : s
              )
            }))
            setAnnotEditor(null)
          }}
          onClose={() => setAnnotEditor(null)}
        />
      )}}

      {/* ── Top Navigation Bar (GitLab style) ── */}
      <nav style={{
        background:'var(--surface)',borderBottom:'1px solid var(--border)',
        padding:'0 24px',height:48,display:'flex',alignItems:'center',
        justifyContent:'space-between',position:'sticky',top:0,zIndex:100,
        boxShadow:'var(--shadow)',
      }}>
        {/* Logo + Name */}
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <NubianLogo size={32} primary={primaryColor}/>
          <div>
            <span style={{fontFamily:'var(--font)',fontSize:15,fontWeight:800,color:'var(--text)',letterSpacing:'-.2px'}}>
              DevProof
            </span>
            <span style={{fontFamily:'var(--font)',fontSize:15,fontWeight:800,color:'var(--primary)',letterSpacing:'-.2px'}}>
              {' '}AI
            </span>
          </div>
          <div style={{
            marginLeft:8,padding:'2px 8px',background:'var(--primary-bg)',
            color:'var(--primary)',fontSize:10,fontWeight:700,borderRadius:4,
            fontFamily:'var(--mono)',letterSpacing:'.3px'
          }}>BETA</div>
        </div>

        {/* Right nav */}
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          {phase==='results'&&(
            <button onClick={()=>{setPhase('upload');setResults(null);setShots([]);setProjName('');setProjCtx('')}}
              style={{...btn,fontSize:12}}>
              + New Project
            </button>
          )}
          {/* Theme toggle */}
          <button onClick={toggleTheme} style={{
            ...btn, padding:'6px 10px',fontSize:16,
            background:'var(--bg2)',border:'1px solid var(--border)',
          }}>
            {theme==='light'?'🌙':'☀️'}
          </button>
        </div>
      </nav>

      {/* ── Main content ── */}
      <div style={{maxWidth:960,margin:'0 auto',padding:'24px 20px'}}>

        {/* ── UPLOAD ── */}
        {phase==='upload'&&(
          <div className="fade-up">
            {/* Hero */}
            <div style={{textAlign:'center',marginBottom:28,paddingTop:12}}>
              <h1 style={{
                fontFamily:'var(--font)',fontSize:28,fontWeight:800,
                color:'var(--text)',letterSpacing:'-.5px',marginBottom:8,lineHeight:1.2
              }}>
                Turn screenshots into<br/>
                <span style={{color:'var(--primary)'}}>professional documentation</span>
              </h1>
              <p style={{fontSize:15,color:'var(--text3)',maxWidth:480,margin:'0 auto'}}>
                Upload your CI/CD, Kubernetes, or cloud screenshots. DevProof generates a GitHub README, Medium article, and LinkedIn post in 60 seconds.
              </p>
            </div>

            <div style={card}>
              {/* Form */}
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 160px',gap:14,marginBottom:18}}>
                <div>
                  <label style={{display:'block',fontSize:12.5,fontWeight:600,color:'var(--text2)',marginBottom:5}}>
                    Project name
                  </label>
                  <input style={inp} value={projName} onChange={e=>setProjName(e.target.value)}
                    placeholder="e.g. AWS EKS GitLab CI/CD"/>
                </div>
                <div>
                  <label style={{display:'block',fontSize:12.5,fontWeight:600,color:'var(--text2)',marginBottom:5}}>
                    Tech stack / Context
                  </label>
                  <input style={inp} value={projCtx} onChange={e=>setProjCtx(e.target.value)}
                    placeholder="e.g. Terraform, EKS, Maven, Trivy"/>
                </div>
                <div>
                  <label style={{display:'block',fontSize:12.5,fontWeight:600,color:'var(--text2)',marginBottom:5}}>
                    Language
                  </label>
                  <select style={{...inp,cursor:'pointer'}} value={lang} onChange={e=>setLang(e.target.value)}>
                    {LANGS.map(l=><option key={l.code} value={l.code}>{l.label}</option>)}
                  </select>
                </div>
              </div>

              {/* Drop zone */}
              <div
                onDragOver={e=>{e.preventDefault();setDrag(true)}}
                onDragLeave={()=>setDrag(false)}
                onDrop={e=>{e.preventDefault();setDrag(false);addFiles(e.dataTransfer.files)}}
                onClick={()=>fileRef.current?.click()}
                style={{
                  border:`2px dashed ${drag?'var(--primary)':'var(--border)'}`,
                  borderRadius:'var(--r2)',padding:'36px 20px',textAlign:'center',
                  cursor:'pointer',background:drag?'var(--primary-bg)':'var(--bg1)',
                  transition:'var(--transition)',
                }}
              >
                <input ref={fileRef} type="file" accept="image/*" multiple style={{display:'none'}}
                  onChange={e=>addFiles(e.target.files)}/>
                <div style={{fontSize:36,marginBottom:10}}>📸</div>
                <p style={{fontSize:15,fontWeight:700,color:'var(--text)',marginBottom:5}}>
                  Drop your screenshots here
                </p>
                <p style={{fontSize:13,color:'var(--text3)'}}>
                  Upload in any order — DevProof reorders by pipeline logic automatically
                </p>
              </div>

              {/* Thumbnails */}
              {shots.length>0&&(
                <div style={{marginTop:14}}>
                  <p style={{fontSize:12.5,color:'var(--text3)',marginBottom:8,fontWeight:600}}>
                    {shots.length} screenshot{shots.length!==1?'s':''} ready
                  </p>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(88px,1fr))',gap:8}}>
                    {shots.map((s,i)=>(
                      <div key={s.id} style={{position:'relative',borderRadius:'var(--r)',overflow:'hidden',border:'1px solid var(--border)',aspectRatio:'16/10',boxShadow:'var(--shadow)'}}>
                        <img src={s.preview} style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}}/>
                        <div style={{position:'absolute',bottom:3,left:4,fontSize:9,fontWeight:700,color:'#fff',background:'rgba(0,0,0,.55)',padding:'1px 5px',borderRadius:3}}>
                          #{i+1}
                        </div>
                        <button onClick={e=>{e.stopPropagation();setShots(p=>p.filter(x=>x.id!==s.id))}} style={{
                          position:'absolute',top:3,right:3,width:16,height:16,
                          background:'var(--danger)',border:'none',borderRadius:'50%',
                          color:'#fff',fontSize:9,cursor:'pointer',display:'flex',
                          alignItems:'center',justifyContent:'center',
                        }}>✕</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {error&&(
                <div style={{marginTop:12,padding:'10px 14px',background:'var(--danger-bg)',border:'1px solid var(--danger)',borderRadius:'var(--r)',fontSize:13,color:'var(--danger)'}}>
                  ⚠ {error}
                </div>
              )}

              <button onClick={generate} disabled={!shots.length} style={{
                ...btnPrimary,width:'100%',marginTop:16,
                padding:'11px',fontSize:14,fontWeight:700,justifyContent:'center',
                opacity:shots.length?1:.45,cursor:shots.length?'pointer':'not-allowed',
              }}>
                ⚡ Run DevProof Pipeline
              </button>
            </div>

            {/* Feature pills */}
            <div style={{display:'flex',flexWrap:'wrap',gap:8,justifyContent:'center',marginTop:20}}>
              {['CI/CD Intelligence','Gap Detection','Multi-channel Output','Git Push (docs only)','AWS Architecture Diagram'].map(f=>(
                <span key={f} style={{
                  padding:'4px 12px',background:'var(--surface)',border:'1px solid var(--border)',
                  borderRadius:20,fontSize:12,fontWeight:600,color:'var(--text3)',
                  boxShadow:'var(--shadow)',
                }}>{f}</span>
              ))}
            </div>
          </div>
        )}

        {/* ── PROCESSING ── */}
        {phase==='proc'&&(
          <div style={{...card,display:'flex',flexDirection:'column',alignItems:'center',gap:24,padding:'52px 24px'}} className="fade-up">
            <div style={{position:'relative',width:52,height:52}}>
              <div style={{position:'absolute',inset:0,borderRadius:'50%',border:'3px solid var(--border)',borderTopColor:'var(--primary)',animation:'spin .8s linear infinite'}}/>
              <div style={{position:'absolute',inset:6,display:'flex',alignItems:'center',justifyContent:'center'}}>
                <NubianLogo size={28} primary={primaryColor}/>
              </div>
            </div>
            <div style={{textAlign:'center'}}>
              <p style={{fontSize:16,fontWeight:700,color:'var(--text)',marginBottom:4}}>
                Processing your project
              </p>
              <p style={{fontSize:13,color:'var(--text3)'}}>
                This may take 30-60 seconds
              </p>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:5,width:'100%',maxWidth:420}}>
              {STEPS.map((s,i)=>{
                const done=i<procStep,active=i===procStep
                return (
                  <div key={i} style={{
                    display:'flex',alignItems:'center',gap:10,padding:'9px 14px',
                    borderRadius:'var(--r)',fontSize:13,fontWeight:500,
                    background:done?'var(--success-bg)':active?'var(--primary-bg)':'var(--bg2)',
                    color:done?'var(--success)':active?'var(--primary)':'var(--text3)',
                    border:`1px solid ${done?'#B8E8C8':active?'#BEDAF7':'var(--border)'}`,
                    transition:'var(--transition)',
                  }}>
                    <span style={{fontSize:14,minWidth:20}}>{done?'✓':active?'⟳':'○'}</span>
                    {s}
                    {active&&<div style={{marginLeft:'auto',width:14,height:14,borderRadius:'50%',border:'2px solid var(--primary)',borderTopColor:'transparent',animation:'spin .6s linear infinite'}}/>}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── RESULTS ── */}
        {phase==='results'&&results&&(
          <div className="fade-up">
            {/* Project header card */}
            <div style={{...card,marginBottom:12}}>
              <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:16}}>
                <div style={{flex:1}}>
                  <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}>
                    <span style={{
                      padding:'2px 8px',background:'var(--primary-bg)',color:'var(--primary)',
                      fontSize:11,fontWeight:700,borderRadius:4,fontFamily:'var(--mono)'
                    }}>{results.type}</span>
                    {results.pipeline_pattern&&(
                      <span style={{
                        padding:'2px 8px',background:'var(--bg2)',color:'var(--text3)',
                        fontSize:11,fontWeight:600,borderRadius:4
                      }}>{results.pipeline_pattern}</span>
                    )}
                  </div>
                  <h2 style={{fontSize:19,fontWeight:800,color:'var(--text)',letterSpacing:'-.3px',marginBottom:8,lineHeight:1.3}}>
                    {results.title}
                  </h2>
                  <p style={{fontSize:13.5,color:'var(--text2)',lineHeight:1.7,marginBottom:12}}>
                    {results.overview}
                  </p>
                  <div style={{display:'flex',flexWrap:'wrap',gap:5}}>
                    {(results.skills_demonstrated||[]).map(sk=>(
                      <span key={sk} style={{
                        padding:'3px 9px',background:'var(--bg2)',border:'1px solid var(--border)',
                        borderRadius:20,fontSize:11.5,fontWeight:600,color:'var(--text2)'
                      }}>{sk}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Security */}
              <div style={{
                padding:'8px 13px',borderRadius:'var(--r)',fontSize:12.5,
                marginTop:14,fontWeight:600,
                ...(results.secrets_detected?.length
                  ?{background:'var(--warning-bg)',color:'var(--warning)',border:'1px solid #EFD080'}
                  :{background:'var(--success-bg)',color:'var(--success)',border:'1px solid #B8E8C8'})
              }}>
                {results.secrets_detected?.length
                  ?`⚠ ${results.secrets_detected.length} sensitive item(s) detected and masked`
                  :'✓ No sensitive data detected — safe to publish'}
              </div>

              {/* Actions */}
              <div style={{borderTop:'1px solid var(--border)',paddingTop:14,marginTop:14}}>
                <div style={{display:'flex',gap:8,flexWrap:'wrap',alignItems:'center'}}>
                  <button onClick={()=>setShowPub(p=>!p)} style={btnPrimary}>
                    {showPub?'▲':'▼'} Publish & Push
                  </button>
                  <button onClick={downloadZip} style={btn}>⬇ Download ZIP</button>
                </div>

                {/* Publish panel */}
                {showPub&&(
                  <div style={{
                    background:'var(--bg2)',border:'1px solid var(--border)',
                    borderRadius:'var(--r2)',padding:16,marginTop:12,
                  }} className="fade-up">
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>

                      {/* GitHub */}
                      <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:'var(--r)',padding:14}}>
                        <div style={{fontSize:13,fontWeight:700,marginBottom:10,color:'var(--text)'}}>🐙 GitHub — docs/ only</div>
                        <input type="password" placeholder="ghp_token..." value={ghToken}
                          onChange={e=>{setGhToken(e.target.value);localStorage.setItem('dp_gh',e.target.value)}}
                          onBlur={()=>ghToken&&fetchGHRepos(ghToken)}
                          style={{...inp,marginBottom:8,fontSize:12}}/>
                        {ghRepos.length>0&&(
                          <select style={{...inp,marginBottom:8,fontSize:12}} value={ghRepo} onChange={e=>setGhRepo(e.target.value)}>
                            <option value="">Select repository...</option>
                            {ghRepos.map(r=><option key={r.id} value={r.id}>{r.name}</option>)}
                          </select>
                        )}
                        <button onClick={pushGitHub} style={{...btn,width:'100%',justifyContent:'center',fontSize:12}}>
                          Push documentation
                          {pushStatus.gh&&<span style={{color:statusColor(pushStatus.gh),marginLeft:4,fontSize:11}}>{pushStatus.gh}</span>}
                        </button>
                      </div>

                      {/* GitLab */}
                      <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:'var(--r)',padding:14}}>
                        <div style={{fontSize:13,fontWeight:700,marginBottom:10,color:'var(--text)'}}>🦊 GitLab — docs/ only</div>
                        <input type="password" placeholder="glpat_token..." value={glToken}
                          onChange={e=>{setGlToken(e.target.value);localStorage.setItem('dp_gl',e.target.value)}}
                          onBlur={()=>glToken&&fetchGLProjects(glToken)}
                          style={{...inp,marginBottom:8,fontSize:12}}/>
                        {glProjects.length>0&&(
                          <select style={{...inp,marginBottom:8,fontSize:12}} value={glProject} onChange={e=>setGlProject(e.target.value)}>
                            <option value="">Select project...</option>
                            {glProjects.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
                          </select>
                        )}
                        <button onClick={pushGitLab} style={{...btn,width:'100%',justifyContent:'center',fontSize:12}}>
                          Push documentation
                          {pushStatus.gl&&<span style={{color:statusColor(pushStatus.gl),marginLeft:4,fontSize:11}}>{pushStatus.gl}</span>}
                        </button>
                      </div>

                      {/* Medium */}
                      <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:'var(--r)',padding:14}}>
                        <div style={{fontSize:13,fontWeight:700,marginBottom:10,color:'var(--text)'}}>✍ Medium</div>
                        <input type="password" placeholder="Medium integration token..." value={mdToken}
                          onChange={e=>{setMdToken(e.target.value);localStorage.setItem('dp_md',e.target.value)}}
                          style={{...inp,marginBottom:8,fontSize:12}}/>
                        <div style={{display:'flex',gap:4,marginBottom:8}}>
                          {['draft','publish'].map(m=>(
                            <button key={m} onClick={()=>setMdMode(m)} style={{
                              flex:1,padding:'5px',fontSize:12,fontWeight:600,borderRadius:'var(--r)',cursor:'pointer',
                              border:`1px solid ${mdMode===m?'var(--primary)':'var(--border)'}`,
                              background:mdMode===m?'var(--primary-bg)':'var(--surface)',
                              color:mdMode===m?'var(--primary)':'var(--text3)',
                            }}>{m==='draft'?'📝 Draft':'🚀 Publish'}</button>
                          ))}
                        </div>
                        <button onClick={pushMedium} style={{...btn,width:'100%',justifyContent:'center',fontSize:12}}>
                          {mdMode==='draft'?'Save as draft':'Publish'}
                          {pushStatus.md&&<span style={{color:statusColor(pushStatus.md),marginLeft:4,fontSize:11}}>{pushStatus.md}</span>}
                        </button>
                      </div>

                      {/* LinkedIn */}
                      <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:'var(--r)',padding:14}}>
                        <div style={{fontSize:13,fontWeight:700,marginBottom:10,color:'var(--text)'}}>💼 LinkedIn</div>
                        <p style={{fontSize:12,color:'var(--text3)',marginBottom:8,lineHeight:1.5}}>
                          LinkedIn requires company verification for API access. Copy your post and paste directly.
                        </p>
                        <div style={{display:'flex',gap:4,marginBottom:8}}>
                          {['copy','open'].map(m=>(
                            <button key={m} onClick={()=>setLiMode(m)} style={{
                              flex:1,padding:'5px',fontSize:12,fontWeight:600,borderRadius:'var(--r)',cursor:'pointer',
                              border:`1px solid ${liMode===m?'#0A66C2':'var(--border)'}`,
                              background:liMode===m?'rgba(10,102,194,.08)':'var(--surface)',
                              color:liMode===m?'#0A66C2':'var(--text3)',
                            }}>{m==='copy'?'Copy only':'Copy + Open'}</button>
                          ))}
                        </div>
                        <button onClick={copyLinkedIn} style={{
                          ...btn,width:'100%',justifyContent:'center',fontSize:12,
                          background:'#0A66C2',color:'#fff',border:'none'
                        }}>
                          {liMode==='copy'?'Copy post':'Copy & Open LinkedIn'}
                          {pushStatus.li&&<span style={{marginLeft:4,fontSize:11}}>{pushStatus.li}</span>}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Content tabs */}
            <div style={card}>
              <div style={{display:'flex',borderBottom:'1px solid var(--border)',marginBottom:18,overflowX:'auto',gap:0}}>
                {[
                  {id:'steps',label:`Steps (${results.ordered_steps?.length||0})`},
                  {id:'arch',label:'Architecture'},
                  {id:'readme',label:'README.md'},
                  {id:'medium',label:'Medium'},
                  {id:'linkedin',label:'LinkedIn'},
                ].map(t=>(
                  <button key={t.id} onClick={()=>setActiveTab(t.id)} style={tab(activeTab===t.id)}>
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Steps */}
              {activeTab==='steps'&&(
                <div style={{display:'flex',flexDirection:'column',gap:12}}>
                  {(results.ordered_steps||[]).map(step=>{
                    const imgB64 = annotated[String(step.number)]
                    const imgSrc = imgB64 ? `data:image/jpeg;base64,${imgB64}` : null
                    const stageColors = {
                      Deploy:'var(--warning)', Verify:'var(--success)',
                      Monitor:'var(--purple)', Build:'var(--primary)',
                    }
                    const stageColor = stageColors[step.pipeline_stage] || 'var(--text3)'
                    return (
                      <div key={step.number} style={{border:'1px solid var(--border)',borderRadius:'var(--r2)',overflow:'hidden',boxShadow:'var(--shadow)'}}>
                        <div style={{display:'flex',alignItems:'center',gap:10,padding:'10px 14px',background:'var(--bg2)',borderBottom:'1px solid var(--border)'}}>
                          <div style={{
                            width:26,height:26,minWidth:26,borderRadius:'50%',
                            background:'var(--primary)',display:'flex',alignItems:'center',
                            justifyContent:'center',fontSize:11,fontWeight:800,color:'#fff'
                          }}>{step.number}</div>
                          <div style={{flex:1}}>
                            <div style={{fontSize:13.5,fontWeight:700,color:'var(--text)',marginBottom:1}}>
                              {step.title}
                            </div>
                            {step.pipeline_stage&&(
                              <span style={{fontSize:11,fontWeight:600,color:stageColor}}>
                                {step.pipeline_stage}
                              </span>
                            )}
                          </div>
                        </div>
                        <div style={{display:'flex'}}>
                          <div style={{padding:'13px 16px',fontSize:13.5,color:'var(--text2)',lineHeight:1.8,flex:1}}>
                            <p>{step.description}</p>
                            {step.command&&(
                              <div style={{marginTop:10,background:'var(--code-bg)',borderRadius:'var(--r)',padding:'10px 14px',border:'1px solid var(--border)'}}>
                                <div style={{fontSize:11,color:'var(--text3)',marginBottom:4,fontFamily:'var(--mono)'}}>$ command</div>
                                <code style={{fontFamily:'var(--mono)',fontSize:12,color:'#7DD3FC',whiteSpace:'pre-wrap'}}>
                                  {step.command}
                                </code>
                              </div>
                            )}
                            {step.key_output&&(
                              <div style={{marginTop:6,fontFamily:'var(--mono)',fontSize:12,color:'var(--success)',display:'flex',alignItems:'center',gap:5}}>
                                <span>→</span> {step.key_output}
                              </div>
                            )}
                            {step.senior_note&&(
                              <div style={{marginTop:10,padding:'9px 13px',background:'var(--warning-bg)',border:'1px solid #EFD080',borderRadius:'var(--r)',fontSize:12.5,color:'var(--warning)',lineHeight:1.5}}>
                                <strong>💡 Note:</strong> {step.senior_note}
                              </div>
                            )}
                          </div>
                          {imgSrc&&(
                            <div style={{borderLeft:'1px solid var(--border)',flexShrink:0,display:'flex',flexDirection:'column'}}>
                              <img src={imgSrc} onClick={()=>setLightboxSrc(imgSrc)}
                                style={{display:'block',width:230,height:'auto',cursor:'zoom-in'}}/>
                              <a href={imgSrc} download={`step-${step.number}.jpg`}
                                style={{textAlign:'center',padding:'6px',fontSize:11.5,fontWeight:600,color:'var(--text3)',borderTop:'1px solid var(--border)',textDecoration:'none',background:'var(--bg2)'}}>
                                ⬇ Download
                              </a>
                            </div>
                          )}
                        </div>
                        {(step.callouts||[]).length>0&&(
                          <div style={{padding:'8px 14px',borderTop:'1px solid var(--border)',background:'var(--bg2)'}}>
                            {(step.callouts||[]).map(c=>{
                              const cc={cyan:'var(--primary)',green:'var(--success)',amber:'var(--warning)',red:'var(--danger)'}
                              return (
                                <div key={c.id} style={{display:'flex',alignItems:'flex-start',gap:8,fontSize:12.5,color:'var(--text2)',marginBottom:3}}>
                                  <div style={{width:16,height:16,minWidth:16,borderRadius:'50%',background:cc[c.color]||'var(--primary)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:8,fontWeight:800,color:'#fff',flexShrink:0,marginTop:1}}>
                                    {c.id}
                                  </div>
                                  <div><strong style={{color:'var(--text)'}}>{c.label}</strong> — {c.explanation}</div>
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

              {activeTab==='arch'&&(
                <div>
                  <div id="arch-svg" style={{background:'#FAFAFA',borderRadius:'var(--r2)',padding:20,overflowX:'auto',border:'1px solid var(--border)',marginBottom:12}}>
                    <ArchSVG arch={results.architecture}/>
                  </div>
                  {archMd&&<MarkdownEditor value={archMd} onChange={setArchMd} label="ARCHITECTURE.md" icon="🏗"/>}
                  <div style={{display:'flex',gap:8,marginTop:10}}>
                    <button onClick={()=>{
                      const svgEl=document.querySelector('#arch-svg svg')
                      if (!svgEl) return
                      const a=document.createElement('a')
                      a.href='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svgEl.outerHTML)
                      a.download='architecture.svg';a.click()
                    }} style={btn}>⬇ Download SVG</button>
                  </div>
                </div>
              )}

              {activeTab==='readme'&&<MarkdownEditor value={readmeMd} onChange={setReadmeMd} label="README.md" icon="📄"/>}
              {activeTab==='medium'&&<MarkdownEditor value={mediumPost} onChange={setMediumPost} label="Medium Article" icon="✍"/>}
              {activeTab==='linkedin'&&<MarkdownEditor value={linkedinPost} onChange={setLinkedinPost} label="LinkedIn Post" icon="💼"/>}
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{textAlign:'center',marginTop:24,paddingBottom:24,fontSize:12,color:'var(--text3)'}}>
          DevProof AI · Built for DevOps engineers who build in public ·{' '}
          <a href="https://devproofai.com" style={{color:'var(--primary)',textDecoration:'none',fontWeight:600}}>devproofai.com</a>
        </div>
      </div>
    </div>
  )
}
