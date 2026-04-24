import { useState, useRef, useCallback, useEffect } from 'react'

const API_URL = '/api'

// ── Google Fonts injection ────────────────────────────────────────────────────
const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');`

// ── Design tokens ─────────────────────────────────────────────────────────────
const CSS = `
${FONTS}
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
:root {
  --bg:        #070B12;
  --bg1:       #0D1220;
  --bg2:       #111827;
  --bg3:       #1A2235;
  --border:    #1E2D42;
  --border2:   #243447;
  --text:      #E8F0FF;
  --text2:     #8DA4BE;
  --text3:     #4A6680;
  --cyan:      #00C8FF;
  --cyan-dim:  rgba(0,200,255,0.12);
  --amber:     #FF9500;
  --amber-dim: rgba(255,149,0,0.12);
  --green:     #00D68F;
  --green-dim: rgba(0,214,143,0.1);
  --red:       #FF4560;
  --violet:    #7B61FF;
  --font-display: 'Syne', sans-serif;
  --font-body:    'Plus Jakarta Sans', sans-serif;
  --font-mono:    'DM Mono', monospace;
  --r:   8px;
  --r2:  12px;
  --r3:  16px;
}
body {
  font-family: var(--font-body);
  background: var(--bg);
  color: var(--text);
  -webkit-font-smoothing: antialiased;
  min-height: 100vh;
  overflow-x: hidden;
}
::selection { background: rgba(0,200,255,0.2); color: var(--text); }
::-webkit-scrollbar { width: 4px; height: 4px; }
::-webkit-scrollbar-track { background: var(--bg1); }
::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 2px; }
button, input, select, textarea { font-family: var(--font-body); }
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
@keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:.4; } }
@keyframes scanline {
  0% { transform: translateY(-100%); }
  100% { transform: translateY(100vh); }
}
@keyframes glow {
  0%,100% { box-shadow: 0 0 20px rgba(0,200,255,0.1); }
  50% { box-shadow: 0 0 40px rgba(0,200,255,0.25); }
}
.fade-up { animation: fadeUp .4s cubic-bezier(.16,1,.3,1) forwards; }
.fade-up-2 { animation: fadeUp .4s .1s cubic-bezier(.16,1,.3,1) both; }
.fade-up-3 { animation: fadeUp .4s .2s cubic-bezier(.16,1,.3,1) both; }
`

// ── Logo SVG ──────────────────────────────────────────────────────────────────
function Logo({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="8" fill="#0D1220"/>
      <rect x="1" y="1" width="30" height="30" rx="7" stroke="#00C8FF" strokeWidth=".5" strokeOpacity=".4"/>
      {/* Terminal bracket */}
      <path d="M7 10 L4 13 L7 16" stroke="#00C8FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M25 10 L28 13 L25 16" stroke="#00C8FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      {/* Check mark */}
      <path d="M12 22 L15 25 L21 18" stroke="#00D68F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      {/* Horizontal lines (doc) */}
      <line x1="11" y1="11.5" x2="21" y2="11.5" stroke="#8DA4BE" strokeWidth="1" strokeLinecap="round" strokeOpacity=".6"/>
      <line x1="11" y1="14" x2="19" y2="14" stroke="#8DA4BE" strokeWidth="1" strokeLinecap="round" strokeOpacity=".4"/>
    </svg>
  )
}

// ── Grid background ───────────────────────────────────────────────────────────
function GridBg() {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `
          linear-gradient(rgba(0,200,255,0.025) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,200,255,0.025) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px',
      }}/>
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(0,200,255,0.06) 0%, transparent 70%)',
      }}/>
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '40%',
        background: 'linear-gradient(to top, rgba(7,11,18,1) 0%, transparent 100%)',
      }}/>
    </div>
  )
}

// ── AWS Architecture SVG ──────────────────────────────────────────────────────
function ArchSVG({ arch }) {
  if (!arch?.components?.length) return (
    <div style={{ padding: 40, textAlign: 'center', color: 'var(--text3)', fontSize: 13, fontFamily: 'var(--font-mono)' }}>
      // no architecture data
    </div>
  )
  const comps = arch.components || [], edges = arch.edges || []
  const CW=185, RH=120, PX=50, PY=60, NW=155, NH=68
  const maxCol = Math.max(...comps.map(c => c.col||0))
  const maxRow = Math.max(...comps.map(c => c.row||0))
  const W = (maxCol+1)*CW + PX*2
  const H = (maxRow+1)*RH + PY*2 + 60
  const pos = {}
  comps.forEach(n => { pos[n.id] = { x: PX+(n.col||0)*CW+CW/2, y: PY+50+(n.row||0)*RH+RH/2 }})
  const ST = {
    client:  {bg:'#0D0F1E',b:'#7B61FF',a:'#9D85FF',icon:'◈'},
    cicd:    {bg:'#0F1208',b:'#FF9500',a:'#FFB340',icon:'⬡'},
    cluster: {bg:'#070F0F',b:'#00C8FF',a:'#00C8FF',icon:'⎈'},
    node:    {bg:'#071009',b:'#00D68F',a:'#00D68F',icon:'▣'},
    service: {bg:'#110A00',b:'#FF9500',a:'#FFB340',icon:'⚡'},
    security:{bg:'#110007',b:'#FF4560',a:'#FF6B82',icon:'🛡'},
    monitor: {bg:'#070A17',b:'#7B61FF',a:'#9D85FF',icon:'◉'},
    default: {bg:'#0D1220',b:'#243447',a:'#4A6680',icon:'□'},
  }
  const EC = {dashed:'#243447',solid:'#FF9500',bold:'#00D68F'}
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{maxWidth:'100%',display:'block',margin:'auto'}}>
      <defs>
        {[['d','#243447'],['s','#FF9500'],['b','#00D68F']].map(([id,fill])=>(
          <marker key={id} id={`m${id}`} markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill={fill}/>
          </marker>
        ))}
        <radialGradient id="glow-c" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#00C8FF" stopOpacity=".15"/>
          <stop offset="100%" stopColor="#00C8FF" stopOpacity="0"/>
        </radialGradient>
      </defs>
      <rect width={W} height={H} fill="#070B12" rx="12"/>
      {/* Grid */}
      {Array.from({length:Math.ceil(W/32)}).map((_,i)=>
        Array.from({length:Math.ceil(H/32)}).map((_,j)=>(
          <circle key={`${i}-${j}`} cx={i*32+16} cy={j*32+16} r="1" fill="rgba(0,200,255,0.04)"/>
        ))
      )}
      <text x={W/2} y="24" textAnchor="middle" fontFamily="DM Mono,monospace" fontSize="11" fill="rgba(0,200,255,0.4)" fontStyle="italic">
        // {arch.title || 'architecture'}
      </text>
      {edges.map((ed,i)=>{
        const f=pos[ed.from],t=pos[ed.to]
        if(!f||!t) return null
        const dx=t.x-f.x,dy=t.y-f.y,dist=Math.sqrt(dx*dx+dy*dy)||1
        const off=NW/2+10,rx=dx/dist,ry=dy/dist
        const mk=ed.style==='bold'?'url(#mb)':ed.style==='dashed'?'url(#md)':'url(#ms)'
        const clr=EC[ed.style||'solid']
        const mx=(f.x+t.x)/2,my=(f.y+t.y)/2
        return (
          <g key={i}>
            <line x1={(f.x+rx*off).toFixed(1)} y1={(f.y+ry*off).toFixed(1)}
                  x2={(t.x-rx*off).toFixed(1)} y2={(t.y-ry*off).toFixed(1)}
                  stroke={clr} strokeWidth={ed.style==='bold'?2:1.5}
                  strokeDasharray={ed.style==='dashed'?'5,4':'none'}
                  markerEnd={mk} opacity=".7"/>
            {ed.label&&<>
              <rect x={mx-24} y={my-7} width="48" height="13" rx="3" fill="#070B12" opacity=".9"/>
              <text x={mx} y={my+3} textAnchor="middle" fontFamily="DM Mono,monospace" fontSize="7.5" fill={clr} opacity=".8">{ed.label}</text>
            </>}
          </g>
        )
      })}
      {comps.map(n=>{
        const p=pos[n.id];if(!p) return null
        const st=ST[n.type]||ST.default
        const x=p.x-NW/2,y=p.y-NH/2
        return (
          <g key={n.id}>
            <rect x={x-1} y={y-1} width={NW+2} height={NH+2} rx="10" fill="none" stroke={st.b} strokeWidth=".5" opacity=".3"/>
            <rect x={x} y={y} width={NW} height={NH} rx="9" fill={st.bg} stroke={st.b} strokeWidth="1.5"/>
            <rect x={x+5} y={y} width={NW-10} height="2.5" rx="1.5" fill={st.a} opacity=".6"/>
            <text x={p.x} y={p.y-6} textAnchor="middle" fontSize="16">{st.icon}</text>
            <text x={p.x} y={p.y+10} textAnchor="middle" fontFamily="DM Mono,monospace" fontSize="10.5" fontWeight="500" fill={st.a}>{n.label||n.id}</text>
            {n.sublabel&&<text x={p.x} y={p.y+24} textAnchor="middle" fontFamily="DM Mono,monospace" fontSize="7" fill={st.a} opacity=".45">{n.sublabel}</text>}
          </g>
        )
      })}
      <text x={W-10} y={H-8} textAnchor="end" fontFamily="DM Mono,monospace" fontSize="7.5" fill="rgba(255,149,0,0.25)">AWS Architecture</text>
    </svg>
  )
}

// ── Markdown renderer ─────────────────────────────────────────────────────────
function renderMd(text) {
  if (!text) return ''
  return text
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/^### (.+)$/gm,'<h3 style="font-family:var(--font-display);font-size:14px;font-weight:700;margin:18px 0 6px;color:var(--text)">$1</h3>')
    .replace(/^## (.+)$/gm,'<h2 style="font-family:var(--font-display);font-size:16px;font-weight:700;margin:22px 0 8px;color:var(--cyan);border-bottom:1px solid var(--border);padding-bottom:6px">$1</h2>')
    .replace(/^# (.+)$/gm,'<h1 style="font-family:var(--font-display);font-size:22px;font-weight:800;margin:0 0 14px;color:var(--text)">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g,'<strong style="color:var(--text);font-weight:600">$1</strong>')
    .replace(/`([^`]+)`/g,'<code style="background:var(--bg3);padding:2px 6px;border-radius:4px;font-family:var(--font-mono);font-size:11.5px;color:var(--cyan)">$1</code>')
    .replace(/```[\w]*\n([\s\S]*?)```/g,'<pre style="background:var(--bg1);border:1px solid var(--border);color:#7DD3FC;padding:14px;border-radius:var(--r);overflow:auto;font-size:12px;margin:10px 0;font-family:var(--font-mono)"><code>$1</code></pre>')
    .replace(/^\| (.+) \|$/gm,(m,content)=>{
      const cells=content.split(' | ').map(c=>`<td style="padding:7px 12px;border:1px solid var(--border);font-size:12px">${c}</td>`).join('')
      return `<tr>${cells}</tr>`
    })
    .replace(/(<tr>.*<\/tr>\n?)+/gs,m=>`<table style="border-collapse:collapse;width:100%;margin:10px 0">${m}</table>`)
    .replace(/^---$/gm,'<hr style="border:none;border-top:1px solid var(--border);margin:18px 0">')
    .replace(/^\> (.+)$/gm,'<blockquote style="border-left:2px solid var(--amber);padding:8px 14px;margin:10px 0;background:var(--amber-dim);color:var(--text2);font-style:italic;border-radius:0 var(--r) var(--r) 0">$1</blockquote>')
    .replace(/^[•\-] (.+)$/gm,'<li style="margin:4px 0;color:var(--text2);font-size:13px;list-style:none;padding-left:18px;position:relative">$1</li>')
    .replace(/(<li.*<\/li>\n?)+/gs,m=>`<ul style="margin:8px 0">${m}</ul>`)
    .replace(/\n\n/g,'</p><p style="margin:8px 0;color:var(--text2);line-height:1.75;font-size:13px">')
}

// ── Lightbox ──────────────────────────────────────────────────────────────────
function Lightbox({ src, onClose }) {
  useEffect(() => {
    const h = e => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])
  return (
    <div onClick={onClose} style={{
      position:'fixed',inset:0,background:'rgba(7,11,18,0.95)',zIndex:1000,
      display:'flex',alignItems:'center',justifyContent:'center',cursor:'zoom-out',
      backdropFilter:'blur(8px)'
    }}>
      <img src={src} style={{maxWidth:'92vw',maxHeight:'90vh',borderRadius:var_r2,
        boxShadow:'0 32px 80px rgba(0,0,0,.8)',border:'1px solid var(--border2)'}}
        onClick={e=>e.stopPropagation()}/>
      <button onClick={onClose} style={{
        position:'absolute',top:20,right:24,background:'var(--bg3)',
        border:'1px solid var(--border2)',color:'var(--text2)',
        width:36,height:36,borderRadius:'50%',fontSize:16,cursor:'pointer'
      }}>✕</button>
    </div>
  )
}

const var_r2 = '12px'

// ── Markdown Editor ───────────────────────────────────────────────────────────
function MarkdownEditor({ value, onChange, label, icon }) {
  const [tab, setTab] = useState('edit')
  return (
    <div style={{border:'1px solid var(--border)',borderRadius:'var(--r2)',overflow:'hidden'}}>
      <div style={{
        display:'flex',alignItems:'center',justifyContent:'space-between',
        padding:'10px 14px',background:'var(--bg2)',borderBottom:'1px solid var(--border)'
      }}>
        <span style={{fontSize:12,fontWeight:600,color:'var(--text2)',fontFamily:'var(--font-mono)'}}>
          {icon} {label}
        </span>
        <div style={{display:'flex',gap:3}}>
          {['edit','preview','split'].map(t=>(
            <button key={t} onClick={()=>setTab(t)} style={{
              padding:'3px 10px',fontSize:10.5,fontWeight:600,borderRadius:5,cursor:'pointer',
              fontFamily:'var(--font-mono)',letterSpacing:'.3px',
              border:`1px solid ${tab===t?'var(--cyan)':'var(--border)'}`,
              background:tab===t?'var(--cyan-dim)':'transparent',
              color:tab===t?'var(--cyan)':'var(--text3)',transition:'all .15s'
            }}>{t}</button>
          ))}
        </div>
      </div>
      <div style={{display:'flex',minHeight:300}}>
        {(tab==='edit'||tab==='split')&&(
          <textarea value={value} onChange={e=>onChange(e.target.value)} style={{
            flex:1,padding:'14px 16px',fontFamily:'var(--font-mono)',fontSize:12,
            color:'var(--text)',background:'var(--bg1)',border:'none',outline:'none',
            resize:'vertical',minHeight:300,lineHeight:1.7,
            borderRight:tab==='split'?'1px solid var(--border)':'none'
          }}/>
        )}
        {(tab==='preview'||tab==='split')&&(
          <div style={{
            flex:1,padding:'16px 20px',fontSize:13,lineHeight:1.75,
            overflowY:'auto',background:'var(--bg1)',color:'var(--text2)'
          }} dangerouslySetInnerHTML={{__html:renderMd(value)}}/>
        )}
      </div>
    </div>
  )
}

// ── Pipeline steps ────────────────────────────────────────────────────────────
const STEPS = [
  {icon:'🔍', label:'Analyzing screenshots'},
  {icon:'🔒', label:'Detecting sensitive data'},
  {icon:'🔀', label:'Reordering by pipeline logic'},
  {icon:'📐', label:'Planning annotations'},
  {icon:'✍', label:'Generating documentation'},
  {icon:'🏗', label:'Building architecture diagram'},
  {icon:'✅', label:'Finalizing output'},
]

// ── Languages ─────────────────────────────────────────────────────────────────
const LANGS = [
  {code:'en',label:'EN — English'},
  {code:'fr',label:'FR — Français'},
  {code:'es',label:'ES — Español'},
  {code:'pt',label:'PT — Português'},
  {code:'de',label:'DE — Deutsch'},
]

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
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

  useEffect(() => { injectCSS() }, [])

  function injectCSS() {
    if (document.getElementById('dp-css')) return
    const s = document.createElement('style')
    s.id = 'dp-css'; s.textContent = CSS
    document.head.appendChild(s)
  }

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
      setGhRepos(d.filter(r=>!r.archived).map(r=>({name:r.full_name,id:r.full_name})))
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
      let attempts=0
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
          setReadmeMd(d.content?.readme_md||merged.readme_md||'')
          setMediumPost(d.content?.medium_post||merged.medium_post||'')
          setLinkedinPost(d.content?.linkedin_post||merged.linkedin_post||'')
          setArchMd(d.content?.architecture_md||merged.architecture_md||'')
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
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob); a.download = `devproof-${slug}.zip`; a.click()
    } catch(e) { alert('ZIP error: '+e.message) }
  }

  async function pushGitHub() {
    if (!ghToken||!ghRepo) { alert('Connect GitHub and select a repo'); return }
    setPushStatus(p=>({...p,gh:'pushing...'}))
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
      setPushStatus(p=>({...p,gh:'✓ pushed'}))
    } catch(e) { setPushStatus(p=>({...p,gh:'✗ '+e.message})) }
  }

  async function pushGitLab() {
    if (!glToken||!glProject) { alert('Connect GitLab and select a project'); return }
    setPushStatus(p=>({...p,gl:'pushing...'}))
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
      setPushStatus(p=>({...p,gl:'✓ pushed'}))
    } catch(e) { setPushStatus(p=>({...p,gl:'✗ '+e.message})) }
  }

  async function pushMedium() {
    if (!mdToken) { alert('Add your Medium integration token'); return }
    setPushStatus(p=>({...p,md:'pushing...'}))
    try {
      const me=await (await fetch('https://api.medium.com/v1/me',{headers:{Authorization:`Bearer ${mdToken}`}})).json()
      if (!me.data?.id) throw new Error('Invalid token')
      const r=await fetch(`https://api.medium.com/v1/users/${me.data.id}/posts`,{method:'POST',headers:{Authorization:`Bearer ${mdToken}`,'Content-Type':'application/json'},body:JSON.stringify({title:results?.title||'DevProof Article',contentFormat:'markdown',content:mediumPost,publishStatus:mdMode==='draft'?'draft':'public',tags:results?.skills_demonstrated?.slice(0,5)||[]})})
      if (!r.ok) throw new Error('Medium API error')
      setPushStatus(p=>({...p,md:mdMode==='draft'?'✓ draft saved':'✓ published'}))
    } catch(e) { setPushStatus(p=>({...p,md:'✗ '+e.message})) }
  }

  function copyLinkedIn() {
    navigator.clipboard.writeText(linkedinPost||'').then(()=>{
      setPushStatus(p=>({...p,li:'✓ copied'}))
      if (liMode==='open') window.open('https://www.linkedin.com/post/new','_blank')
    })
  }

  const statusColor = s => !s?'var(--text3)':s.startsWith('✓')?'var(--green)':s.includes('...')?'var(--amber)':'var(--red)'

  // Shared styles
  const S = {
    card: {
      background:'var(--bg1)',border:'1px solid var(--border)',
      borderRadius:'var(--r2)',padding:'20px',marginBottom:12,
    },
    inp: {
      width:'100%',padding:'9px 13px',border:'1px solid var(--border2)',
      borderRadius:'var(--r)',fontSize:13,color:'var(--text)',background:'var(--bg2)',
      outline:'none',fontFamily:'var(--font-body)',transition:'border-color .15s',
    },
    btn: {
      fontFamily:'var(--font-body)',fontSize:12,fontWeight:600,padding:'7px 14px',
      borderRadius:'var(--r)',border:'1px solid var(--border2)',background:'var(--bg2)',
      cursor:'pointer',color:'var(--text2)',transition:'all .15s',display:'inline-flex',
      alignItems:'center',gap:5,whiteSpace:'nowrap',
    },
    tab: (active) => ({
      padding:'9px 16px',fontSize:12,fontWeight:600,cursor:'pointer',
      fontFamily:'var(--font-mono)',letterSpacing:'.3px',
      borderBottom:`2px solid ${active?'var(--cyan)':'transparent'}`,
      color:active?'var(--cyan)':'var(--text3)',background:'none',
      border:'none',borderBottom:`2px solid ${active?'var(--cyan)':'transparent'}`,
      transition:'all .15s',
    }),
  }

  return (
    <div style={{position:'relative',maxWidth:960,margin:'0 auto',padding:'24px 16px',zIndex:1}}>
      <GridBg/>
      {lightboxSrc&&<Lightbox src={lightboxSrc} onClose={()=>setLightboxSrc(null)}/>}

      {/* ── Header ── */}
      <div style={{marginBottom:28,textAlign:'center'}} className="fade-up">
        <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:12,marginBottom:10}}>
          <Logo size={40}/>
          <div style={{textAlign:'left'}}>
            <h1 style={{fontFamily:'var(--font-display)',fontSize:26,fontWeight:800,letterSpacing:'-.5px',lineHeight:1}}>
              DevProof
              <span style={{color:'var(--cyan)'}}> AI</span>
            </h1>
            <p style={{fontFamily:'var(--font-mono)',fontSize:10,color:'var(--text3)',letterSpacing:'.5px'}}>
              // screenshot → professional docs in 60s
            </p>
          </div>
        </div>
        <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
          <div style={{width:6,height:6,borderRadius:'50%',background:'var(--green)',boxShadow:'0 0 8px var(--green)',animation:'pulse 2s infinite'}}/>
          <span style={{fontFamily:'var(--font-mono)',fontSize:11,color:'var(--text3)'}}>production</span>
        </div>
      </div>

      {/* ── UPLOAD ── */}
      {phase==='upload'&&(
        <div className="fade-up">
          <div style={S.card}>
            {/* Form row */}
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 160px',gap:12,marginBottom:16}}>
              <div>
                <label style={{fontFamily:'var(--font-mono)',fontSize:10,color:'var(--text3)',display:'block',marginBottom:6,letterSpacing:'.5px'}}>// project_name</label>
                <input style={S.inp} value={projName} onChange={e=>setProjName(e.target.value)} placeholder="AWS EKS GitLab CI/CD"/>
              </div>
              <div>
                <label style={{fontFamily:'var(--font-mono)',fontSize:10,color:'var(--text3)',display:'block',marginBottom:6,letterSpacing:'.5px'}}>// tech_stack</label>
                <input style={S.inp} value={projCtx} onChange={e=>setProjCtx(e.target.value)} placeholder="Terraform, EKS, Maven, Trivy"/>
              </div>
              <div>
                <label style={{fontFamily:'var(--font-mono)',fontSize:10,color:'var(--text3)',display:'block',marginBottom:6,letterSpacing:'.5px'}}>// language</label>
                <select style={{...S.inp,cursor:'pointer'}} value={lang} onChange={e=>setLang(e.target.value)}>
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
                border:`1px dashed ${drag?'var(--cyan)':'var(--border2)'}`,
                borderRadius:'var(--r2)',padding:'36px 20px',textAlign:'center',cursor:'pointer',
                background:drag?'var(--cyan-dim)':'transparent',transition:'all .2s',
                position:'relative',overflow:'hidden',
              }}
            >
              <input ref={fileRef} type="file" accept="image/*" multiple style={{display:'none'}} onChange={e=>addFiles(e.target.files)}/>
              <div style={{fontSize:32,marginBottom:10}}>📸</div>
              <p style={{fontFamily:'var(--font-display)',fontSize:15,fontWeight:700,color:'var(--text)',marginBottom:4}}>
                Drop your screenshots here
              </p>
              <p style={{fontFamily:'var(--font-mono)',fontSize:11,color:'var(--text3)'}}>
                // upload in any order — DevProof reorders by pipeline logic
              </p>
            </div>

            {/* Thumbnails */}
            {shots.length>0&&(
              <div style={{marginTop:14}}>
                <p style={{fontFamily:'var(--font-mono)',fontSize:11,color:'var(--text3)',marginBottom:8}}>
                  // {shots.length} screenshot{shots.length!==1?'s':''} loaded
                </p>
                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(90px,1fr))',gap:8}}>
                  {shots.map((s,i)=>(
                    <div key={s.id} style={{position:'relative',borderRadius:'var(--r)',overflow:'hidden',border:'1px solid var(--border)',aspectRatio:'16/10'}}>
                      <img src={s.preview} style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}}/>
                      <div style={{position:'absolute',bottom:3,left:4,fontFamily:'var(--font-mono)',fontSize:9,color:'rgba(0,200,255,.8)',background:'rgba(7,11,18,.8)',padding:'1px 5px',borderRadius:3}}>
                        #{i+1}
                      </div>
                      <button onClick={()=>setShots(p=>p.filter(x=>x.id!==s.id))} style={{
                        position:'absolute',top:3,right:3,width:16,height:16,
                        background:'rgba(255,69,96,.9)',border:'none',borderRadius:'50%',
                        color:'#fff',fontSize:9,cursor:'pointer'
                      }}>✕</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {error&&(
              <div style={{marginTop:12,padding:'10px 14px',background:'rgba(255,69,96,.08)',border:'1px solid rgba(255,69,96,.3)',borderRadius:'var(--r)',fontFamily:'var(--font-mono)',fontSize:12,color:'var(--red)'}}>
                ⚠ {error}
              </div>
            )}

            <button onClick={generate} disabled={!shots.length} style={{
              width:'100%',marginTop:16,padding:'13px',
              background:shots.length?'var(--cyan)':'var(--bg3)',
              color:shots.length?'#070B12':'var(--text3)',
              border:'none',borderRadius:'var(--r)',
              fontFamily:'var(--font-display)',fontSize:14,fontWeight:800,
              cursor:shots.length?'pointer':'not-allowed',
              letterSpacing:'.5px',transition:'all .2s',
              boxShadow:shots.length?'0 0 30px rgba(0,200,255,0.2)':'none',
            }}>
              ⚡ RUN DEVPROOF PIPELINE
            </button>
          </div>
        </div>
      )}

      {/* ── PROCESSING ── */}
      {phase==='proc'&&(
        <div style={{...S.card,display:'flex',flexDirection:'column',alignItems:'center',gap:24,padding:'52px 24px'}} className="fade-up">
          {/* Spinner */}
          <div style={{position:'relative',width:56,height:56}}>
            <div style={{position:'absolute',inset:0,borderRadius:'50%',border:'2px solid var(--border)',borderTopColor:'var(--cyan)',borderRightColor:'var(--violet)',animation:'spin .8s linear infinite'}}/>
            <div style={{position:'absolute',inset:6,borderRadius:'50%',border:'1px solid var(--border)',borderBottomColor:'var(--amber)',animation:'spin 1.2s linear infinite reverse'}}/>
          </div>

          <div style={{textAlign:'center'}}>
            <p style={{fontFamily:'var(--font-display)',fontSize:16,fontWeight:700,marginBottom:4}}>
              Processing your project
            </p>
            <p style={{fontFamily:'var(--font-mono)',fontSize:11,color:'var(--text3)'}}>
              // devproof pipeline running...
            </p>
          </div>

          <div style={{display:'flex',flexDirection:'column',gap:5,width:'100%',maxWidth:400}}>
            {STEPS.map((s,i)=>{
              const done=i<procStep,active=i===procStep
              return (
                <div key={i} style={{
                  display:'flex',alignItems:'center',gap:10,padding:'8px 12px',
                  borderRadius:'var(--r)',fontFamily:'var(--font-mono)',fontSize:11.5,
                  background:done?'var(--green-dim)':active?'var(--cyan-dim)':'var(--bg2)',
                  color:done?'var(--green)':active?'var(--cyan)':'var(--text3)',
                  border:`1px solid ${done?'rgba(0,214,143,.2)':active?'rgba(0,200,255,.2)':'var(--border)'}`,
                  transition:'all .4s',
                }}>
                  <span style={{fontSize:14}}>{done?'✓':active?s.icon:'○'}</span>
                  <span>{done?'// done':active?'// running...':`// pending`} {s.label}</span>
                  {active&&<div style={{marginLeft:'auto',width:14,height:14,borderRadius:'50%',border:'1.5px solid var(--cyan)',borderTopColor:'transparent',animation:'spin .6s linear infinite'}}/>}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── RESULTS ── */}
      {phase==='results'&&results&&(
        <div className="fade-up">
          {/* Hero card */}
          <div style={{...S.card,position:'relative',overflow:'hidden',marginBottom:12}}>
            {/* Top accent */}
            <div style={{position:'absolute',top:0,left:0,right:0,height:2,background:'linear-gradient(90deg,var(--cyan),var(--violet),var(--green))'}}/>
            
            <div style={{display:'flex',alignItems:'flex-start',gap:16,marginBottom:14}}>
              <div style={{flex:1}}>
                <div style={{fontFamily:'var(--font-mono)',fontSize:10,color:'var(--amber)',letterSpacing:'.8px',marginBottom:6}}>
                  // {results.type} · {results.pipeline_pattern}
                </div>
                <h2 style={{fontFamily:'var(--font-display)',fontSize:20,fontWeight:800,letterSpacing:'-.3px',lineHeight:1.25,marginBottom:10}}>
                  {results.title}
                </h2>
                <p style={{fontSize:13,color:'var(--text2)',lineHeight:1.75,marginBottom:12}}>
                  {results.overview}
                </p>
              </div>
            </div>

            {/* Skills */}
            <div style={{display:'flex',flexWrap:'wrap',gap:5,marginBottom:16}}>
              {(results.skills_demonstrated||[]).map(sk=>(
                <span key={sk} style={{
                  padding:'3px 9px',background:'var(--bg3)',border:'1px solid var(--border2)',
                  borderRadius:20,fontFamily:'var(--font-mono)',fontSize:10.5,color:'var(--cyan)'
                }}>{sk}</span>
              ))}
            </div>

            {/* Security badge */}
            <div style={{
              padding:'8px 13px',borderRadius:'var(--r)',fontSize:12,marginBottom:16,
              fontFamily:'var(--font-mono)',
              ...(results.secrets_detected?.length
                ?{background:'rgba(255,69,96,.08)',color:'var(--red)',border:'1px solid rgba(255,69,96,.25)'}
                :{background:'var(--green-dim)',color:'var(--green)',border:'1px solid rgba(0,214,143,.2)'})
            }}>
              {results.secrets_detected?.length
                ?`⚠ ${results.secrets_detected.length} sensitive item(s) detected and masked`
                :'✓ no sensitive data detected — safe to publish'}
            </div>

            {/* Action bar */}
            <div style={{borderTop:'1px solid var(--border)',paddingTop:14}}>
              {/* Primary actions */}
              <div style={{display:'flex',gap:6,flexWrap:'wrap',alignItems:'center',marginBottom:8}}>
                <button onClick={()=>setShowPub(p=>!p)} style={{
                  ...S.btn,background:'var(--cyan)',color:'#070B12',border:'none',fontWeight:700
                }}>
                  {showPub?'▲':'▼'} Publish & Push
                </button>
                <button onClick={downloadZip} style={{...S.btn}}>⬇ ZIP</button>
                <button onClick={()=>{setPhase('upload');setResults(null);setShots([]);setProjName('');setProjCtx('')}}
                  style={{...S.btn,color:'var(--red)',borderColor:'rgba(255,69,96,.3)',marginLeft:'auto'}}>
                  ↺ New project
                </button>
              </div>

              {/* Publish panel */}
              {showPub&&(
                <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:'var(--r2)',padding:16,marginTop:8}} className="fade-up">
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>

                    {/* GitHub */}
                    <div style={{background:'var(--bg3)',border:'1px solid var(--border)',borderRadius:'var(--r)',padding:12}}>
                      <div style={{fontFamily:'var(--font-mono)',fontSize:11,color:'var(--text2)',marginBottom:8}}>🐙 GitHub — docs/ push</div>
                      <input type="password" placeholder="ghp_token..." value={ghToken}
                        onChange={e=>{setGhToken(e.target.value);localStorage.setItem('dp_gh',e.target.value)}}
                        onBlur={()=>ghToken&&fetchGHRepos(ghToken)}
                        style={{...S.inp,marginBottom:6,fontSize:11}}/>
                      {ghRepos.length>0&&(
                        <select style={{...S.inp,marginBottom:6,fontSize:11}} value={ghRepo} onChange={e=>setGhRepo(e.target.value)}>
                          <option value="">Select repo...</option>
                          {ghRepos.map(r=><option key={r.id} value={r.id}>{r.name}</option>)}
                        </select>
                      )}
                      <button onClick={pushGitHub} style={{...S.btn,width:'100%',justifyContent:'center',fontSize:11}}>
                        Push docs
                        {pushStatus.gh&&<span style={{color:statusColor(pushStatus.gh),marginLeft:4}}>{pushStatus.gh}</span>}
                      </button>
                    </div>

                    {/* GitLab */}
                    <div style={{background:'var(--bg3)',border:'1px solid var(--border)',borderRadius:'var(--r)',padding:12}}>
                      <div style={{fontFamily:'var(--font-mono)',fontSize:11,color:'var(--text2)',marginBottom:8}}>🦊 GitLab — docs/ push</div>
                      <input type="password" placeholder="glpat_token..." value={glToken}
                        onChange={e=>{setGlToken(e.target.value);localStorage.setItem('dp_gl',e.target.value)}}
                        onBlur={()=>glToken&&fetchGLProjects(glToken)}
                        style={{...S.inp,marginBottom:6,fontSize:11}}/>
                      {glProjects.length>0&&(
                        <select style={{...S.inp,marginBottom:6,fontSize:11}} value={glProject} onChange={e=>setGlProject(e.target.value)}>
                          <option value="">Select project...</option>
                          {glProjects.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                      )}
                      <button onClick={pushGitLab} style={{...S.btn,width:'100%',justifyContent:'center',fontSize:11}}>
                        Push docs
                        {pushStatus.gl&&<span style={{color:statusColor(pushStatus.gl),marginLeft:4}}>{pushStatus.gl}</span>}
                      </button>
                    </div>

                    {/* Medium */}
                    <div style={{background:'var(--bg3)',border:'1px solid var(--border)',borderRadius:'var(--r)',padding:12}}>
                      <div style={{fontFamily:'var(--font-mono)',fontSize:11,color:'var(--text2)',marginBottom:8}}>✍ Medium</div>
                      <input type="password" placeholder="Medium integration token..." value={mdToken}
                        onChange={e=>{setMdToken(e.target.value);localStorage.setItem('dp_md',e.target.value)}}
                        style={{...S.inp,marginBottom:6,fontSize:11}}/>
                      <div style={{display:'flex',gap:4,marginBottom:6}}>
                        {['draft','publish'].map(m=>(
                          <button key={m} onClick={()=>setMdMode(m)} style={{
                            flex:1,padding:'4px',fontSize:10,borderRadius:5,cursor:'pointer',
                            fontFamily:'var(--font-mono)',border:`1px solid ${mdMode===m?'var(--cyan)':'var(--border)'}`,
                            background:mdMode===m?'var(--cyan-dim)':'transparent',
                            color:mdMode===m?'var(--cyan)':'var(--text3)'
                          }}>{m==='draft'?'📝 Draft':'🚀 Publish'}</button>
                        ))}
                      </div>
                      <button onClick={pushMedium} style={{...S.btn,width:'100%',justifyContent:'center',fontSize:11}}>
                        {mdMode==='draft'?'Save draft':'Publish'}
                        {pushStatus.md&&<span style={{color:statusColor(pushStatus.md),marginLeft:4}}>{pushStatus.md}</span>}
                      </button>
                    </div>

                    {/* LinkedIn */}
                    <div style={{background:'var(--bg3)',border:'1px solid var(--border)',borderRadius:'var(--r)',padding:12}}>
                      <div style={{fontFamily:'var(--font-mono)',fontSize:11,color:'var(--text2)',marginBottom:8}}>💼 LinkedIn</div>
                      <p style={{fontFamily:'var(--font-mono)',fontSize:10,color:'var(--text3)',marginBottom:8,lineHeight:1.5}}>
                        // LinkedIn API requires company verification. Copy & paste directly.
                      </p>
                      <div style={{display:'flex',gap:4,marginBottom:6}}>
                        {['copy','copy+open'].map(m=>(
                          <button key={m} onClick={()=>setLiMode(m)} style={{
                            flex:1,padding:'4px',fontSize:10,borderRadius:5,cursor:'pointer',
                            fontFamily:'var(--font-mono)',border:`1px solid ${liMode===m?'#0A66C2':'var(--border)'}`,
                            background:liMode===m?'rgba(10,102,194,.15)':'transparent',
                            color:liMode===m?'#60A5FA':'var(--text3)'
                          }}>{m==='copy'?'Copy':'Copy + Open'}</button>
                        ))}
                      </div>
                      <button onClick={copyLinkedIn} style={{
                        ...S.btn,width:'100%',justifyContent:'center',fontSize:11,
                        background:'#0A66C2',color:'#fff',border:'none'
                      }}>
                        {liMode==='copy'?'Copy post':'Copy & Open LinkedIn'}
                        {pushStatus.li&&<span style={{marginLeft:4}}>{pushStatus.li}</span>}
                      </button>
                    </div>

                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Content tabs */}
          <div style={S.card}>
            <div style={{display:'flex',borderBottom:'1px solid var(--border)',marginBottom:18,overflowX:'auto'}}>
              {[
                {id:'steps',label:`// steps (${results.ordered_steps?.length||0})`},
                {id:'arch',label:'// architecture'},
                {id:'readme',label:'// README.md'},
                {id:'medium',label:'// medium'},
                {id:'linkedin',label:'// linkedin'},
              ].map(t=>(
                <button key={t.id} onClick={()=>setActiveTab(t.id)} style={S.tab(activeTab===t.id)}>
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
                  const stageColor = step.pipeline_stage==='Deploy'?'var(--amber)':step.pipeline_stage==='Verify'?'var(--green)':step.pipeline_stage?.includes('Scan')||step.pipeline_stage?.includes('Security')?'var(--red)':'var(--cyan)'
                  return (
                    <div key={step.number} style={{border:'1px solid var(--border)',borderRadius:'var(--r2)',overflow:'hidden'}}>
                      {/* Step header */}
                      <div style={{display:'flex',alignItems:'center',gap:10,padding:'10px 14px',background:'var(--bg2)',borderBottom:'1px solid var(--border)'}}>
                        <div style={{
                          width:26,height:26,minWidth:26,borderRadius:'50%',
                          background:`linear-gradient(135deg,var(--amber),var(--cyan))`,
                          display:'flex',alignItems:'center',justifyContent:'center',
                          fontFamily:'var(--font-mono)',fontSize:11,fontWeight:700,color:'#070B12'
                        }}>{step.number}</div>
                        <div style={{flex:1}}>
                          <div style={{fontFamily:'var(--font-display)',fontSize:13,fontWeight:700,color:'var(--text)',marginBottom:2}}>
                            {step.title}
                          </div>
                          {step.pipeline_stage&&(
                            <span style={{fontFamily:'var(--font-mono)',fontSize:10,color:stageColor,opacity:.8}}>
                              // {step.pipeline_stage}
                            </span>
                          )}
                        </div>
                      </div>

                      <div style={{display:'flex'}}>
                        {/* Content */}
                        <div style={{padding:'13px 16px',fontSize:13,color:'var(--text2)',lineHeight:1.8,flex:1}}>
                          <p>{step.description}</p>
                          {step.command&&(
                            <div style={{marginTop:8,background:'var(--bg)',border:'1px solid var(--border)',borderRadius:'var(--r)',padding:'10px 13px'}}>
                              <div style={{fontFamily:'var(--font-mono)',fontSize:10,color:'var(--text3)',marginBottom:4}}>$ command</div>
                              <code style={{fontFamily:'var(--font-mono)',fontSize:11.5,color:'var(--cyan)',whiteSpace:'pre-wrap'}}>
                                {step.command}
                              </code>
                            </div>
                          )}
                          {step.key_output&&(
                            <div style={{marginTop:6,fontFamily:'var(--font-mono)',fontSize:11,color:'var(--green)'}}>
                              → {step.key_output}
                            </div>
                          )}
                          {step.senior_note&&(
                            <div style={{marginTop:8,padding:'8px 12px',background:'var(--amber-dim)',border:'1px solid rgba(255,149,0,.2)',borderRadius:'var(--r)',fontFamily:'var(--font-mono)',fontSize:11,color:'var(--amber)'}}>
                              💡 {step.senior_note}
                            </div>
                          )}
                        </div>

                        {/* Image */}
                        {imgSrc&&(
                          <div style={{borderLeft:'1px solid var(--border)',flexShrink:0,display:'flex',flexDirection:'column'}}>
                            <img src={imgSrc} onClick={()=>setLightboxSrc(imgSrc)}
                              style={{display:'block',width:220,height:'auto',cursor:'zoom-in'}}/>
                            <a href={imgSrc} download={`step-${step.number}.jpg`}
                              style={{textAlign:'center',padding:'6px',fontFamily:'var(--font-mono)',fontSize:10,color:'var(--text3)',borderTop:'1px solid var(--border)',textDecoration:'none',background:'var(--bg2)'}}>
                              ⬇ download
                            </a>
                          </div>
                        )}
                      </div>

                      {/* Callouts */}
                      {(step.callouts||[]).length>0&&(
                        <div style={{padding:'8px 14px',borderTop:'1px solid var(--border)',background:'var(--bg2)'}}>
                          {(step.callouts||[]).map(c=>{
                            const cc={cyan:'var(--cyan)',green:'var(--green)',amber:'var(--amber)',red:'var(--red)'}
                            return (
                              <div key={c.id} style={{display:'flex',alignItems:'flex-start',gap:8,fontFamily:'var(--font-mono)',fontSize:11,color:'var(--text2)',marginBottom:3}}>
                                <div style={{width:16,height:16,minWidth:16,borderRadius:'50%',background:cc[c.color]||'var(--cyan)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:8,fontWeight:700,color:'#070B12',flexShrink:0,marginTop:1}}>
                                  {c.id}
                                </div>
                                <div><span style={{color:cc[c.color]||'var(--cyan)'}}>{c.label}</span> — {c.explanation}</div>
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

            {/* Architecture */}
            {activeTab==='arch'&&(
              <div>
                <div id="arch-svg" style={{background:'#070B12',borderRadius:'var(--r2)',padding:16,overflowX:'auto',border:'1px solid var(--border)',marginBottom:12}}>
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
                  }} style={S.btn}>⬇ Download SVG</button>
                </div>
              </div>
            )}

            {activeTab==='readme'&&<MarkdownEditor value={readmeMd} onChange={setReadmeMd} label="README.md" icon="📄"/>}
            {activeTab==='medium'&&<MarkdownEditor value={mediumPost} onChange={setMediumPost} label="medium-post.md" icon="✍"/>}
            {activeTab==='linkedin'&&<MarkdownEditor value={linkedinPost} onChange={setLinkedinPost} label="linkedin-post.txt" icon="💼"/>}
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{textAlign:'center',marginTop:20,fontFamily:'var(--font-mono)',fontSize:10.5,color:'var(--text3)'}}>
        DevProof AI · built for DevOps engineers who build in public · <span style={{color:'var(--cyan)'}}>devproofai.com</span>
      </div>
    </div>
  )
}
