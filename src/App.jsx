import { useState, useRef, useCallback } from 'react'

// ── Config ─────────────────────────────────────────────────────────────────
// Set your Railway backend URL here after deploying
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// ── Arch SVG ───────────────────────────────────────────────────────────────
function ArchSVG({ arch }) {
  if (!arch?.components?.length) return null
  const comps = arch.components || [], edges = arch.edges || []
  const CW=165, RH=105, PX=36, PY=46, NW=128, NH=52
  const maxCol = Math.max(...comps.map(c => c.col || 0))
  const maxRow = Math.max(...comps.map(c => c.row || 0))
  const W = (maxCol+1)*CW + PX*2
  const H = (maxRow+1)*RH + PY*2 + 46
  const pos = {}
  comps.forEach(n => { pos[n.id] = { x: PX+(n.col||0)*CW+CW/2, y: PY+40+(n.row||0)*RH+RH/2 }})
  const TC = { host:'#334155', cluster:'#1e3a5f', node:'#064e3b', service:'#1c1407', client:'#1a0a2e', controlplane:'#1e1b4b', default:'#27272a' }
  const BC = { host:'#64748b', cluster:'#3b82f6', node:'#10b981', service:'#f59e0b', client:'#8b5cf6', controlplane:'#6366f1', default:'#52525b' }
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ maxWidth:'100%', display:'block', margin:'auto' }}>
      <defs>
        {[['d','#475569'],['s','#2d4a6a'],['b','#10b981']].map(([id,fill]) => (
          <marker key={id} id={`m${id}`} markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
            <path d="M0,0 L0,6 L7,3 z" fill={fill}/>
          </marker>
        ))}
      </defs>
      <rect width={W} height={H} fill="#09090b" rx="8"/>
      <text x={W/2} y="22" textAnchor="middle" fontFamily="system-ui" fontSize="11" fill="#71717a">
        {arch.title || ''}
      </text>
      {edges.map((ed, i) => {
        const f = pos[ed.from], t = pos[ed.to]
        if (!f || !t) return null
        const dx=t.x-f.x, dy=t.y-f.y, dist=Math.sqrt(dx*dx+dy*dy)||1, off=NW/2+8
        const rx=dx/dist, ry=dy/dist
        const mk = ed.style==='bold'?'url(#mb)': ed.style==='dashed'?'url(#md)':'url(#ms)'
        const mx=(f.x+t.x)/2, my=(f.y+t.y)/2
        return (
          <g key={i}>
            <line
              x1={(f.x+rx*off).toFixed(1)} y1={(f.y+ry*off).toFixed(1)}
              x2={(t.x-rx*off).toFixed(1)} y2={(t.y-ry*off).toFixed(1)}
              stroke={ed.style==='bold'?'#10b981':ed.style==='dashed'?'#475569':'#2d4a6a'}
              strokeWidth={ed.style==='bold'?2.5:1.5}
              strokeDasharray={ed.style==='dashed'?'5,4':'none'}
              markerEnd={mk}
            />
            {ed.label && <>
              <rect x={mx-20} y={my-6} width="40" height="12" rx="3" fill="#09090b"/>
              <text x={mx} y={my+3} textAnchor="middle" fontFamily="monospace" fontSize="7.5" fill="#52525b">
                {ed.label}
              </text>
            </>}
          </g>
        )
      })}
      {comps.map(n => {
        const p = pos[n.id]
        if (!p) return null
        const x=p.x-NW/2, y=p.y-NH/2
        const bg=TC[n.type]||TC.default, bc=BC[n.type]||BC.default
        return (
          <g key={n.id}>
            <rect x={x} y={y} width={NW} height={NH} rx="8" fill={bg} stroke={bc} strokeWidth="1.5"/>
            <rect x={x+4} y={y} width={NW-8} height="2" rx="1" fill={bc} opacity="0.5"/>
            <text x={p.x} y={p.y+3} textAnchor="middle" fontFamily="system-ui" fontSize="11" fontWeight="600" fill={bc}>
              {n.label||n.id}
            </text>
            {n.sublabel && (
              <text x={p.x} y={p.y+16} textAnchor="middle" fontFamily="monospace" fontSize="7" fill={bc} opacity="0.55">
                {n.sublabel}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}

// ── Step card ──────────────────────────────────────────────────────────────
function StepCard({ step, imgB64 }) {
  const CC = { cyan:'#22D3EE', green:'#10B981', amber:'#F59E0B', red:'#EF4444' }
  return (
    <div style={{ border:'1px solid var(--border)', borderRadius:'var(--radius)', overflow:'hidden', background:'var(--surface)', boxShadow:'var(--shadow)' }}>
      <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', background:'var(--surface2)', borderBottom:'1px solid var(--border)' }}>
        <div style={{ width:22, height:22, minWidth:22, borderRadius:'50%', background:'var(--cyan)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:700, color:'#fff' }}>
          {step.number}
        </div>
        <span style={{ fontSize:13, fontWeight:600, color:'var(--text)' }}>{step.title}</span>
      </div>
      <div style={{ display:'flex' }}>
        <div style={{ padding:'12px 14px', fontSize:12.5, color:'var(--text2)', lineHeight:1.75, flex:1 }}>
          <p>{step.description}</p>
          {step.command && (
            <code style={{ display:'block', marginTop:8, fontFamily:'monospace', fontSize:11, background:'#1e1e2e', color:'#7dd3fc', padding:'8px 12px', borderRadius:6, whiteSpace:'pre-wrap' }}>
              {step.command}
            </code>
          )}
          {step.key_output && (
            <div style={{ marginTop:5, fontFamily:'monospace', fontSize:11, color:'var(--green)' }}>
              → {step.key_output}
            </div>
          )}
          {step.context && (
            <div style={{ marginTop:8, padding:'7px 10px', background:'#FFFBEB', border:'1px solid #FDE68A', borderRadius:6, fontSize:11.5, color:'#92400E' }}>
              💡 {step.context}
            </div>
          )}
        </div>
        {imgB64 && (
          <div style={{ borderLeft:'1px solid var(--border)', flexShrink:0 }}>
            <img src={`data:image/jpeg;base64,${imgB64}`} alt={`Step ${step.number}`}
                 style={{ display:'block', width:230, height:'auto' }}/>
          </div>
        )}
      </div>
      {step.callouts?.length > 0 && (
        <div style={{ padding:'8px 12px', borderTop:'1px solid var(--border)', background:'var(--surface2)' }}>
          {step.callouts.map(c => (
            <div key={c.id} style={{ display:'flex', alignItems:'flex-start', gap:6, fontSize:11, color:'var(--text2)', marginBottom:3 }}>
              <div style={{ width:14, height:14, minWidth:14, borderRadius:'50%', background:CC[c.color]||CC.cyan, display:'flex', alignItems:'center', justifyContent:'center', fontSize:8, fontWeight:700, color:'#09090b', flexShrink:0, marginTop:1 }}>
                {c.id}
              </div>
              <div><strong style={{ color:'var(--text)' }}>{c.label}</strong> — {c.explanation}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Pipeline steps ─────────────────────────────────────────────────────────
const PIPELINE = [
  'Analyzing screenshots with Claude Vision',
  'Detecting & masking sensitive data',
  'Reordering steps logically',
  'Planning callout annotations',
  'Generating technical documentation',
  'Writing Medium & LinkedIn content',
  'Building architecture diagram',
]

// ── Main App ───────────────────────────────────────────────────────────────
export default function App() {
  const [shots, setShots] = useState([])
  const [projName, setProjName] = useState('')
  const [projCtx, setProjCtx] = useState('')
  const [phase, setPhase] = useState('upload') // upload | proc | results
  const [procStep, setProcStep] = useState(0)
  const [results, setResults] = useState(null)
  const [annotated, setAnnotated] = useState({})
  const [activeTab, setActiveTab] = useState('steps')
  const [error, setError] = useState('')
  const [drag, setDrag] = useState(false)
  const fileRef = useRef()

  const addFiles = useCallback(files => {
    Array.from(files).filter(f => f.type.startsWith('image/')).forEach(file => {
      const r = new FileReader()
      r.onload = e => setShots(p => [...p, {
        id: Date.now() + Math.random(),
        file,
        name: file.name,
        preview: e.target.result,
      }])
      r.readAsDataURL(file)
    })
  }, [])

  async function generate() {
    if (!shots.length) return
    setError('')
    setAnnotated({})
    setPhase('proc')
    setProcStep(0)

    let animStep = 0
    const anim = setInterval(() => { if (animStep < 4) setProcStep(++animStep) }, 4000)

    try {
      const fd = new FormData()
      shots.forEach(s => fd.append('files', s.file, s.name))
      fd.append('project_name', projName || 'Technical Project')
      fd.append('project_ctx', projCtx || 'DevOps/Cloud')

      const res = await fetch(`${API_URL}/process`, { method: 'POST', body: fd })

      clearInterval(anim)
      setProcStep(6)

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: res.statusText }))
        throw new Error(err.detail || `HTTP ${res.status}`)
      }

      const data = await res.json()
      const merged = { ...data.analysis, ...data.content }
      setResults(merged)
      setAnnotated(data.annotated_images || {})
      setPhase('results')
      setActiveTab('steps')

    } catch (e) {
      clearInterval(anim)
      setError(e.message)
      setPhase('upload')
      console.error(e)
    }
  }

  function dlFile(content, name, mime) {
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([content], { type: mime }))
    a.download = name
    a.click()
  }

  function cpText(text, label) {
    navigator.clipboard.writeText(text || '').then(() => alert(`${label} copied!`))
  }

  // ── Styles ────────────────────────────────────────────────────────────────
  const card = { background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', padding:'1.25rem', marginBottom:12, boxShadow:'var(--shadow)' }
  const inp = { width:'100%', padding:'9px 12px', border:'1px solid var(--border2)', borderRadius:'var(--radius)', fontSize:13, color:'var(--text)', background:'var(--surface)', outline:'none' }
  const btn = { fontSize:12, fontWeight:500, padding:'6px 13px', borderRadius:8, border:'1px solid var(--border2)', background:'var(--surface)', color:'var(--text)' }
  const btnPri = { ...btn, background:'var(--text)', color:'#fff', border:'none', fontSize:14, padding:'11px 20px', width:'100%' }
  const tab = active => ({ padding:'8px 14px', fontSize:12, fontWeight:500, cursor:'pointer', borderBottom:`2px solid ${active?'var(--text)':'transparent'}`, color:active?'var(--text)':'var(--text3)', background:'none', border:'none', borderBottom:`2px solid ${active?'var(--text)':'transparent'}` })
  const codeBox = { background:'#1e1e2e', border:'1px solid #2d2d3f', borderRadius:'var(--radius)', padding:'14px 16px', fontFamily:'monospace', fontSize:11.5, color:'#cdd6f4', lineHeight:1.75, whiteSpace:'pre-wrap', maxHeight:480, overflowY:'auto' }

  return (
    <div style={{ maxWidth:900, margin:'0 auto', padding:'24px 16px' }}>

      {/* Header */}
      <div style={{ marginBottom:20, textAlign:'center' }}>
        <h1 style={{ fontSize:28, fontWeight:800, letterSpacing:'-.5px', marginBottom:6 }}>
          ⚡ DevProof AI
        </h1>
        <p style={{ fontSize:14, color:'var(--text2)' }}>
          Turn your technical screenshots into professional documentation — in 60 seconds
        </p>
      </div>

      {/* ── UPLOAD ── */}
      {phase === 'upload' && (
        <div className="fade-in">
          <div style={card}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:14 }}>
              <div>
                <label style={{ fontSize:11, fontWeight:600, color:'var(--text3)', display:'block', marginBottom:5, textTransform:'uppercase', letterSpacing:'.5px' }}>Project name</label>
                <input style={inp} value={projName} onChange={e => setProjName(e.target.value)}
                       placeholder="e.g. AWS EKS GitLab CI/CD"/>
              </div>
              <div>
                <label style={{ fontSize:11, fontWeight:600, color:'var(--text3)', display:'block', marginBottom:5, textTransform:'uppercase', letterSpacing:'.5px' }}>Stack / Context</label>
                <input style={inp} value={projCtx} onChange={e => setProjCtx(e.target.value)}
                       placeholder="e.g. Terraform, EKS, Trivy, Docker"/>
              </div>
            </div>

            {/* Drop zone */}
            <div
              onDragOver={e => { e.preventDefault(); setDrag(true) }}
              onDragLeave={() => setDrag(false)}
              onDrop={e => { e.preventDefault(); setDrag(false); addFiles(e.dataTransfer.files) }}
              onClick={() => fileRef.current?.click()}
              style={{ border:`2px dashed ${drag?'var(--text)':'var(--border2)'}`, borderRadius:'var(--radius-lg)', padding:'32px 20px', textAlign:'center', cursor:'pointer', background:drag?'var(--surface2)':'var(--bg)', transition:'all .15s' }}
            >
              <input ref={fileRef} type="file" accept="image/*" multiple style={{ display:'none' }}
                     onChange={e => addFiles(e.target.files)}/>
              <div style={{ fontSize:28, marginBottom:10 }}>📸</div>
              <strong style={{ fontSize:15, color:'var(--text)' }}>Drop your screenshots here</strong>
              <p style={{ fontSize:13, color:'var(--text2)', marginTop:5 }}>
                or click to browse · upload in any order · DevProof reorders automatically
              </p>
            </div>

            {/* Thumbnails */}
            {shots.length > 0 && (
              <div style={{ marginTop:12 }}>
                <p style={{ fontSize:12, color:'var(--text2)', marginBottom:8 }}>
                  {shots.length} screenshot{shots.length !== 1 ? 's' : ''}
                </p>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(100px,1fr))', gap:8 }}>
                  {shots.map((s, i) => (
                    <div key={s.id} style={{ position:'relative', borderRadius:8, overflow:'hidden', border:'1px solid var(--border)', aspectRatio:'16/10' }}>
                      <img src={s.preview} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}/>
                      <div style={{ position:'absolute', bottom:3, left:4, fontSize:9, color:'rgba(255,255,255,.9)', background:'rgba(0,0,0,.55)', padding:'1px 5px', borderRadius:3 }}>#{i+1}</div>
                      <button onClick={() => setShots(p => p.filter(x => x.id !== s.id))}
                              style={{ position:'absolute', top:3, right:3, width:16, height:16, background:'rgba(220,38,38,.9)', border:'none', borderRadius:'50%', color:'#fff', fontSize:9 }}>
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div style={{ marginTop:12, padding:'10px 14px', background:'#FEF2F2', border:'1px solid #FECACA', borderRadius:8, fontSize:12.5, color:'#DC2626' }}>
                ⚠ {error}
              </div>
            )}

            <button onClick={generate} disabled={!shots.length}
                    style={{ ...btnPri, marginTop:14, opacity:shots.length?1:.4 }}>
              ⚡ Run DevProof Pipeline
            </button>
          </div>
        </div>
      )}

      {/* ── PROCESSING ── */}
      {phase === 'proc' && (
        <div style={{ ...card, display:'flex', flexDirection:'column', alignItems:'center', gap:22, padding:'48px 24px' }} className="fade-in">
          <div style={{ width:52, height:52, borderRadius:'50%', border:'2.5px solid var(--border)', borderTopColor:'var(--cyan)', borderRightColor:'var(--violet)', animation:'spin .9s linear infinite' }}/>
          <p style={{ fontSize:16, fontWeight:600, color:'var(--text)' }}>Generating your documentation…</p>
          <div style={{ display:'flex', flexDirection:'column', gap:6, width:'100%', maxWidth:360 }}>
            {PIPELINE.map((s, i) => {
              const done = i < procStep, active = i === procStep
              return (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:9, padding:'7px 12px', borderRadius:8, fontSize:12, fontFamily:'monospace', background:done?'#F0FDF4':active?'#EFF6FF':'var(--surface2)', color:done?'#15803D':active?'#1D4ED8':'var(--text3)', border:`1px solid ${done?'#86EFAC':active?'#93C5FD':'var(--border)'}`, transition:'all .3s' }}>
                  <div style={{ width:5, height:5, borderRadius:'50%', background:'currentColor', flexShrink:0 }}/>
                  {done?'✓ ':active?'→ ':'  '}{s}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── RESULTS ── */}
      {phase === 'results' && results && (
        <div className="fade-in">
          {/* Hero */}
          <div style={{ ...card, position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:'linear-gradient(90deg, var(--cyan), var(--violet), var(--green))' }}/>
            <div style={{ fontSize:10, fontWeight:600, color:'var(--cyan)', textTransform:'uppercase', letterSpacing:'.6px', marginBottom:6 }}>{results.type}</div>
            <h2 style={{ fontSize:22, fontWeight:700, letterSpacing:'-.3px', marginBottom:8, lineHeight:1.2 }}>{results.title}</h2>
            <p style={{ fontSize:13.5, color:'var(--text2)', lineHeight:1.75, marginBottom:12 }}>{results.overview}</p>
            <div style={{ display:'flex', flexWrap:'wrap', gap:5, marginBottom:14 }}>
              {(results.skills_demonstrated||[]).map(sk => (
                <span key={sk} style={{ padding:'3px 9px', background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:20, fontSize:11, color:'var(--text2)' }}>{sk}</span>
              ))}
            </div>
            <div style={{ padding:'9px 13px', borderRadius:8, fontSize:12.5, marginBottom:16, ...(results.secrets_detected?.length?{background:'#FEF2F2',color:'#DC2626',border:'1px solid #FECACA'}:{background:'#F0FDF4',color:'#15803D',border:'1px solid #86EFAC'}) }}>
              {results.secrets_detected?.length ? `⚠ ${results.secrets_detected.length} sensitive item(s) detected and masked` : '✓ No sensitive data detected — safe to publish'}
            </div>
            <div style={{ display:'flex', gap:6, flexWrap:'wrap', paddingTop:14, borderTop:'1px solid var(--border)' }}>
              <button onClick={() => cpText(results.readme_md, 'README')} style={btn}>📋 Copy README</button>
              <button onClick={() => dlFile(results.readme_md||'', 'README.md', 'text/markdown')} style={btn}>⬇ .md</button>
              <button onClick={() => cpText(results.linkedin_post, 'LinkedIn')} style={btn}>💼 LinkedIn</button>
              <button onClick={() => cpText(results.medium_post, 'Medium')} style={btn}>✍ Medium</button>
              <button onClick={() => { setPhase('upload'); setResults(null); setShots([]); setProjName(''); setProjCtx('') }}
                      style={{ ...btn, color:'var(--red)', borderColor:'#FECACA' }}>↺ New project</button>
            </div>
          </div>

          {/* Tabs */}
          <div style={card}>
            <div style={{ display:'flex', borderBottom:'1px solid var(--border)', marginBottom:16 }}>
              {['steps','arch','readme','medium','linkedin'].map(t => (
                <button key={t} onClick={() => setActiveTab(t)} style={tab(activeTab===t)}>
                  {t==='steps'?`Steps (${results.ordered_steps?.length||0})`:t.charAt(0).toUpperCase()+t.slice(1)}
                </button>
              ))}
            </div>

            {activeTab === 'steps' && (
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                {(results.ordered_steps||[]).map(step => (
                  <StepCard key={step.number} step={step} imgB64={annotated[String(step.number)]}/>
                ))}
              </div>
            )}

            {activeTab === 'arch' && (
              <div style={{ background:'#09090b', borderRadius:8, padding:16, overflowX:'auto' }}>
                <ArchSVG arch={results.architecture}/>
              </div>
            )}

            {['readme','medium','linkedin'].includes(activeTab) && (
              <div style={codeBox}>
                {activeTab==='readme' ? results.readme_md : activeTab==='medium' ? results.medium_post : results.linkedin_post}
              </div>
            )}
          </div>
        </div>
      )}

      <p style={{ textAlign:'center', fontSize:11, color:'var(--text3)', marginTop:16 }}>
        DevProof AI · Built for DevOps engineers who build in public
      </p>
    </div>
  )
}
