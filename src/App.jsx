import { useState, useRef, useCallback, useEffect } from 'react'

const API_URL = '/api'

// ── AWS Architecture SVG ───────────────────────────────────────────────────
function ArchSVG({ arch }) {
  if (!arch?.components?.length) return (
    <div style={{ padding: 40, textAlign: 'center', color: '#6B7280', fontSize: 13 }}>
      No architecture data available
    </div>
  )

  const comps = arch.components || [], edges = arch.edges || []
  const CW = 180, RH = 120, PX = 50, PY = 60, NW = 150, NH = 70

  const maxCol = Math.max(...comps.map(c => c.col || 0))
  const maxRow = Math.max(...comps.map(c => c.row || 0))
  const W = (maxCol + 1) * CW + PX * 2
  const H = (maxRow + 1) * RH + PY * 2 + 60

  const pos = {}
  comps.forEach(n => {
    pos[n.id] = { x: PX + (n.col || 0) * CW + CW / 2, y: PY + 50 + (n.row || 0) * RH + RH / 2 }
  })

  // AWS Service colors & icons
  const AWS_STYLE = {
    client:       { bg: '#1A1A2E', border: '#8B5CF6', accent: '#A78BFA', icon: '👤', label: 'Client' },
    host:         { bg: '#1E293B', border: '#64748B', accent: '#94A3B8', icon: '🖥', label: 'Server' },
    cluster:      { bg: '#0C2340', border: '#FF9900', accent: '#FF9900', icon: '⎈', label: 'EKS' },
    controlplane: { bg: '#1E1B4B', border: '#6366F1', accent: '#818CF8', icon: '⚙', label: 'Control' },
    node:         { bg: '#064E3B', border: '#10B981', accent: '#34D399', icon: '▣', label: 'Node' },
    service:      { bg: '#FF990015', border: '#FF9900', accent: '#FF9900', icon: '⚡', label: 'Service' },
    ecr:          { bg: '#0C2340', border: '#FF9900', accent: '#FF9900', icon: '📦', label: 'ECR' },
    s3:           { bg: '#1C2B1E', border: '#569A31', accent: '#7EC053', icon: '🪣', label: 'S3' },
    rds:          { bg: '#1C1B2E', border: '#4B6EAF', accent: '#6B8DD6', icon: '🗄', label: 'RDS' },
    elb:          { bg: '#2D1B00', border: '#FF9900', accent: '#FF9900', icon: '⚖', label: 'ELB' },
    default:      { bg: '#1A1A2E', border: '#374151', accent: '#6B7280', icon: '□', label: '' },
  }

  const EDGE_COLOR = { dashed: '#6B7280', solid: '#FF9900', bold: '#10B981' }

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ maxWidth: '100%', display: 'block', margin: 'auto' }}>
      <defs>
        {[['d', '#6B7280'], ['s', '#FF9900'], ['b', '#10B981']].map(([id, fill]) => (
          <marker key={id} id={`aw-${id}`} markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill={fill} />
          </marker>
        ))}
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Background */}
      <rect width={W} height={H} fill="#0A0F1E" rx="12" />

      {/* Grid dots */}
      {Array.from({ length: Math.ceil(W / 30) }).map((_, i) =>
        Array.from({ length: Math.ceil(H / 30) }).map((_, j) => (
          <circle key={`${i}-${j}`} cx={i * 30 + 15} cy={j * 30 + 15} r="1" fill="rgba(255,255,255,0.04)" />
        ))
      )}

      {/* Title */}
      <text x={W / 2} y="28" textAnchor="middle" fontFamily="system-ui" fontSize="12" fontWeight="600" fill="#9CA3AF">
        {arch.title || 'Architecture'}
      </text>
      <line x1={PX} y1="38" x2={W - PX} y2="38" stroke="rgba(255,153,0,0.2)" strokeWidth="1" />

      {/* Edges */}
      {edges.map((ed, i) => {
        const f = pos[ed.from], t = pos[ed.to]
        if (!f || !t) return null
        const dx = t.x - f.x, dy = t.y - f.y
        const dist = Math.sqrt(dx * dx + dy * dy) || 1
        const off = NW / 2 + 10
        const rx = dx / dist, ry = dy / dist
        const mk = ed.style === 'bold' ? 'url(#aw-b)' : ed.style === 'dashed' ? 'url(#aw-d)' : 'url(#aw-s)'
        const clr = EDGE_COLOR[ed.style || 'solid']
        const mx = (f.x + t.x) / 2, my = (f.y + t.y) / 2
        return (
          <g key={i}>
            <line
              x1={(f.x + rx * off).toFixed(1)} y1={(f.y + ry * off).toFixed(1)}
              x2={(t.x - rx * off).toFixed(1)} y2={(t.y - ry * off).toFixed(1)}
              stroke={clr} strokeWidth={ed.style === 'bold' ? 2.5 : 1.5}
              strokeDasharray={ed.style === 'dashed' ? '6,4' : 'none'}
              markerEnd={mk} opacity="0.8"
            />
            {ed.label && (
              <>
                <rect x={mx - 26} y={my - 8} width="52" height="15" rx="4" fill="#0A0F1E" opacity="0.9" />
                <text x={mx} y={my + 3} textAnchor="middle" fontFamily="monospace" fontSize="8" fill={clr} opacity="0.9">
                  {ed.label}
                </text>
              </>
            )}
          </g>
        )
      })}

      {/* Nodes */}
      {comps.map(n => {
        const p = pos[n.id]
        if (!p) return null
        const st = AWS_STYLE[n.type] || AWS_STYLE.default
        const x = p.x - NW / 2, y = p.y - NH / 2

        return (
          <g key={n.id}>
            {/* Glow border */}
            <rect x={x - 1} y={y - 1} width={NW + 2} height={NH + 2} rx="10"
              fill="none" stroke={st.border} strokeWidth="1" opacity="0.3" filter="url(#glow)" />
            {/* Main box */}
            <rect x={x} y={y} width={NW} height={NH} rx="9" fill={st.bg} stroke={st.border} strokeWidth="1.5" />
            {/* Top accent bar */}
            <rect x={x + 5} y={y} width={NW - 10} height="3" rx="1.5" fill={st.accent} opacity="0.7" />
            {/* Icon */}
            <text x={p.x} y={p.y - 8} textAnchor="middle" fontSize="18" dominantBaseline="middle">{st.icon}</text>
            {/* Label */}
            <text x={p.x} y={p.y + 10} textAnchor="middle" fontFamily="system-ui" fontSize="11" fontWeight="600" fill={st.accent}>
              {n.label || n.id}
            </text>
            {/* Sublabel */}
            {n.sublabel && (
              <text x={p.x} y={p.y + 24} textAnchor="middle" fontFamily="monospace" fontSize="7.5" fill={st.accent} opacity="0.55">
                {n.sublabel}
              </text>
            )}
          </g>
        )
      })}

      {/* AWS Logo watermark */}
      <text x={W - 12} y={H - 8} textAnchor="end" fontFamily="monospace" fontSize="8" fill="rgba(255,153,0,0.3)">
        AWS Architecture
      </text>
    </svg>
  )
}

// ── Markdown Preview ───────────────────────────────────────────────────────
function renderMd(text) {
  if (!text) return ''
  return text
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/^### (.+)$/gm, '<h3 style="font-size:15px;font-weight:600;margin:16px 0 6px;color:#1A1A1A">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 style="font-size:17px;font-weight:700;margin:20px 0 8px;color:#1A1A1A;border-bottom:1px solid #E5E7EB;padding-bottom:6px">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 style="font-size:22px;font-weight:800;margin:0 0 12px;color:#1A1A1A">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code style="background:#F3F4F6;padding:1px 5px;border-radius:4px;font-family:monospace;font-size:12px;color:#DC2626">$1</code>')
    .replace(/```[\w]*\n([\s\S]*?)```/g, '<pre style="background:#1E1E2E;color:#CDD6F4;padding:12px;border-radius:8px;overflow:auto;font-size:12px;margin:10px 0"><code>$1</code></pre>')
    .replace(/^\| (.+) \|$/gm, (m, content) => {
      const cells = content.split(' | ').map(c => `<td style="padding:6px 10px;border:1px solid #E5E7EB">${c}</td>`).join('')
      return `<tr>${cells}</tr>`
    })
    .replace(/(<tr>.*<\/tr>\n?)+/gs, m => `<table style="border-collapse:collapse;width:100%;margin:10px 0">${m}</table>`)
    .replace(/^---$/gm, '<hr style="border:none;border-top:1px solid #E5E7EB;margin:16px 0">')
    .replace(/^\> (.+)$/gm, '<blockquote style="border-left:3px solid #FF9900;padding:8px 14px;margin:10px 0;background:#FFFBEB;color:#92400E;font-style:italic">$1</blockquote>')
    .replace(/^• (.+)$/gm, '<li style="margin:3px 0;color:#374151">$1</li>')
    .replace(/^- (.+)$/gm, '<li style="margin:3px 0;color:#374151">$1</li>')
    .replace(/(<li.*<\/li>\n?)+/gs, m => `<ul style="margin:8px 0;padding-left:20px">${m}</ul>`)
    .replace(/\n\n/g, '</p><p style="margin:8px 0;color:#374151;line-height:1.7">')
    .replace(/^(?!<)(.+)$/gm, (m) => m.trim() ? m : '')
}

// ── Lightbox ───────────────────────────────────────────────────────────────
function Lightbox({ src, onClose }) {
  useEffect(() => {
    const handler = e => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out' }}>
      <img src={src} style={{ maxWidth: '92vw', maxHeight: '90vh', borderRadius: 8, boxShadow: '0 24px 60px rgba(0,0,0,.6)' }} onClick={e => e.stopPropagation()} />
      <button onClick={onClose} style={{ position: 'absolute', top: 20, right: 24, background: 'rgba(255,255,255,.15)', border: 'none', color: '#fff', width: 36, height: 36, borderRadius: '50%', fontSize: 18, cursor: 'pointer' }}>✕</button>
    </div>
  )
}

// ── Languages ──────────────────────────────────────────────────────────────
const LANGUAGES = [
  { code: 'en', label: '🇬🇧 English', name: 'English' },
  { code: 'fr', label: '🇫🇷 Français', name: 'French' },
  { code: 'es', label: '🇪🇸 Español', name: 'Spanish' },
  { code: 'pt', label: '🇵🇹 Português', name: 'Portuguese' },
  { code: 'de', label: '🇩🇪 Deutsch', name: 'German' },
]

// ── Pipeline steps ─────────────────────────────────────────────────────────
const PIPELINE = [
  'Analyzing screenshots with Claude Vision',
  'Detecting & masking sensitive data',
  'Reordering steps logically',
  'Planning callout annotations',
  'Generating technical documentation',
  'Writing content',
  'Building AWS architecture diagram',
]

// ── Editor with Preview ────────────────────────────────────────────────────
function MarkdownEditor({ value, onChange, label }) {
  const [tab, setTab] = useState('edit')
  return (
    <div style={{ border: '1px solid #E5E7EB', borderRadius: 10, overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>{label}</span>
        <div style={{ display: 'flex', gap: 4 }}>
          {['edit', 'preview', 'split'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: '3px 10px', fontSize: 11, fontWeight: 500, borderRadius: 6, border: `1px solid ${tab === t ? '#111827' : '#D1D5DB'}`, background: tab === t ? '#111827' : '#fff', color: tab === t ? '#fff' : '#6B7280', cursor: 'pointer' }}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', minHeight: 320 }}>
        {(tab === 'edit' || tab === 'split') && (
          <textarea
            value={value}
            onChange={e => onChange(e.target.value)}
            style={{ flex: 1, padding: '14px 16px', fontFamily: 'monospace', fontSize: 12, color: '#1F2937', background: '#FAFAFA', border: 'none', outline: 'none', resize: 'vertical', minHeight: 320, borderRight: tab === 'split' ? '1px solid #E5E7EB' : 'none' }}
          />
        )}
        {(tab === 'preview' || tab === 'split') && (
          <div
            style={{ flex: 1, padding: '14px 16px', fontSize: 13, lineHeight: 1.7, overflowY: 'auto', background: '#fff' }}
            dangerouslySetInnerHTML={{ __html: renderMd(value) }}
          />
        )}
      </div>
    </div>
  )
}

// ── Main App ───────────────────────────────────────────────────────────────
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

  // Editable content
  const [readmeMd, setReadmeMd] = useState('')
  const [mediumPost, setMediumPost] = useState('')
  const [linkedinPost, setLinkedinPost] = useState('')

  // Integrations
  const [ghToken, setGhToken] = useState(localStorage.getItem('dp_gh_tok') || '')
  const [ghRepo, setGhRepo] = useState('')
  const [ghRepos, setGhRepos] = useState([])
  const [glToken, setGlToken] = useState(localStorage.getItem('dp_gl_tok') || '')
  const [glProject, setGlProject] = useState('')
  const [glProjects, setGlProjects] = useState([])
  const [mdToken, setMdToken] = useState(localStorage.getItem('dp_md_tok') || '')
  const [mdMode, setMdMode] = useState('draft')
  const [liMode, setLiMode] = useState('draft')
  const [showIntegrations, setShowIntegrations] = useState(false)
  const [pushStatus, setPushStatus] = useState({})

  const addFiles = useCallback(files => {
    Array.from(files).filter(f => f.type.startsWith('image/')).forEach(file => {
      const r = new FileReader()
      r.onload = e => setShots(p => [...p, {
        id: Date.now() + Math.random(), file, name: file.name,
        preview: e.target.result,
      }])
      r.readAsDataURL(file)
    })
  }, [])

  // Fetch GitHub repos
  async function fetchGHRepos(token) {
    try {
      const r = await fetch('https://api.github.com/user/repos?per_page=100&sort=updated', {
        headers: { Authorization: `token ${token}`, Accept: 'application/vnd.github.v3+json' }
      })
      const data = await r.json()
      setGhRepos(data.filter(r => !r.archived).map(r => ({ name: r.full_name, id: r.full_name })))
    } catch { setGhRepos([]) }
  }

  // Fetch GitLab projects
  async function fetchGLProjects(token) {
    try {
      const r = await fetch('https://gitlab.com/api/v4/projects?membership=true&per_page=100&order_by=last_activity_at', {
        headers: { 'PRIVATE-TOKEN': token }
      })
      const data = await r.json()
      setGlProjects(data.map(p => ({ name: p.path_with_namespace, id: p.path_with_namespace })))
    } catch { setGlProjects([]) }
  }

  async function generate() {
    if (!shots.length) return
    setError(''); setAnnotated({}); setPhase('proc'); setProcStep(0)
    let animStep = 0
    const anim = setInterval(() => { if (animStep < 4) setProcStep(++animStep) }, 4000)
    try {
      const fd = new FormData()
      shots.forEach(s => fd.append('files', s.file, s.name))
      fd.append('project_name', projName || 'Technical Project')
      fd.append('project_ctx', projCtx || 'DevOps/Cloud')
      fd.append('language', lang)
      const res = await fetch(`${API_URL}/process`, { method: 'POST', body: fd })
      clearInterval(anim); setProcStep(6)
      if (!res.ok) { const e = await res.json().catch(() => ({ detail: res.statusText })); throw new Error(e.detail || `HTTP ${res.status}`) }
      const data = await res.json()
      const merged = { ...data.analysis, ...data.content }
      setResults(merged)
      setAnnotated(data.annotated_images || {})
      setReadmeMd(merged.readme_md || '')
      setMediumPost(merged.medium_post || '')
      setLinkedinPost(merged.linkedin_post || '')
      setPhase('results'); setActiveTab('steps')
    } catch (e) { clearInterval(anim); setError(e.message); setPhase('upload'); console.error(e) }
  }

  // ── Build README with images ───────────────────────────────────────────
  function buildReadmeWithImages() {
    let md = readmeMd
    ;(results?.ordered_steps || []).forEach(step => {
      const img = annotated[String(step.number)]
      if (!img) return
      const marker = `### Step ${step.number}`
      if (md.includes(marker)) {
        md = md.replace(marker, `${marker}\n\n![Step ${step.number}](./images/step-${step.number}.jpg)\n`)
      }
    })
    if (results?.architecture) {
      md = md.replace('## Architecture', '## Architecture\n\n![Architecture](./images/architecture.svg)\n')
    }
    return md
  }

  // ── Download ZIP ───────────────────────────────────────────────────────
  async function downloadZip() {
    const { default: JSZip } = await import('https://cdn.jsdelivr.net/npm/jszip@3.10.1/+esm')
    const zip = new JSZip()
    const slug = (results?.title || 'project').replace(/[^\w-]/g, '-').toLowerCase().slice(0, 40)
    const folder = `devproof-${slug}/`

    zip.file(folder + 'README.md', buildReadmeWithImages())
    zip.file(folder + 'medium-post.md', mediumPost)
    zip.file(folder + 'linkedin-post.txt', linkedinPost)

    // Annotated images
    for (const [num, b64] of Object.entries(annotated)) {
      const bin = atob(b64); const arr = new Uint8Array(bin.length)
      for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i)
      zip.file(folder + `images/step-${num}.jpg`, arr)
    }

    // Architecture SVG
    const svgEl = document.querySelector('#arch-svg-container svg')
    if (svgEl) zip.file(folder + 'images/architecture.svg', svgEl.outerHTML)

    const blob = await zip.generateAsync({ type: 'blob' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `devproof-${slug}.zip`; a.click()
  }

  // ── Push GitHub ────────────────────────────────────────────────────────
  async function pushGitHub() {
    if (!ghToken || !ghRepo) { alert('Connect GitHub and select a repo first'); return }
    setPushStatus(p => ({ ...p, gh: 'pushing' }))
    const slug = (results?.title || 'project').replace(/[^\w-]/g, '-').toLowerCase().slice(0, 40)
    const folder = `docs/${slug}`
    const msg = `docs: add ${results?.title || 'project'} — generated by DevProof AI`

    async function ghPut(path, content, isB64 = false) {
      let sha = null
      try {
        const r = await fetch(`https://api.github.com/repos/${ghRepo}/contents/${path}`, { headers: { Authorization: `token ${ghToken}`, Accept: 'application/vnd.github.v3+json' } })
        if (r.ok) sha = (await r.json()).sha || null
      } catch {}
      const body = { message: msg, content: isB64 ? content : btoa(unescape(encodeURIComponent(content))) }
      if (sha) body.sha = sha
      const r = await fetch(`https://api.github.com/repos/${ghRepo}/contents/${path}`, {
        method: 'PUT', headers: { Authorization: `token ${ghToken}`, Accept: 'application/vnd.github.v3+json', 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      if (!r.ok) { const d = await r.json(); throw new Error(d.message) }
    }

    try {
      await ghPut(`${folder}/README.md`, buildReadmeWithImages())
      for (const [num, b64] of Object.entries(annotated)) await ghPut(`${folder}/images/step-${num}.jpg`, b64, true)
      const svgEl = document.querySelector('#arch-svg-container svg')
      if (svgEl) await ghPut(`${folder}/images/architecture.svg`, svgEl.outerHTML)
      setPushStatus(p => ({ ...p, gh: 'done' }))
    } catch (e) { setPushStatus(p => ({ ...p, gh: 'error: ' + e.message })) }
  }

  // ── Push GitLab ────────────────────────────────────────────────────────
  async function pushGitLab() {
    if (!glToken || !glProject) { alert('Connect GitLab and select a project first'); return }
    setPushStatus(p => ({ ...p, gl: 'pushing' }))
    const slug = (results?.title || 'project').replace(/[^\w-]/g, '-').toLowerCase().slice(0, 40)
    const folder = `docs/${slug}`
    const actions = []
    const add = (path, content, isB64 = false) => actions.push({ action: 'create', file_path: path, content: isB64 ? content : btoa(unescape(encodeURIComponent(content))), encoding: 'base64' })
    add(`${folder}/README.md`, buildReadmeWithImages())
    for (const [num, b64] of Object.entries(annotated)) add(`${folder}/images/step-${num}.jpg`, b64, true)
    const svgEl = document.querySelector('#arch-svg-container svg')
    if (svgEl) add(`${folder}/images/architecture.svg`, svgEl.outerHTML)
    try {
      const r = await fetch(`https://gitlab.com/api/v4/projects/${encodeURIComponent(glProject)}/repository/commits`, {
        method: 'POST', headers: { 'PRIVATE-TOKEN': glToken, 'Content-Type': 'application/json' },
        body: JSON.stringify({ branch: 'main', commit_message: `docs: add ${results?.title || 'project'} — DevProof AI`, actions })
      })
      if (!r.ok) { const d = await r.json(); throw new Error(d.message) }
      setPushStatus(p => ({ ...p, gl: 'done' }))
    } catch (e) { setPushStatus(p => ({ ...p, gl: 'error: ' + e.message })) }
  }

  // ── Push Medium ────────────────────────────────────────────────────────
  async function pushMedium() {
    if (!mdToken) { alert('Add your Medium token first'); return }
    setPushStatus(p => ({ ...p, md: 'pushing' }))
    try {
      const meRes = await fetch('https://api.medium.com/v1/me', { headers: { Authorization: `Bearer ${mdToken}` } })
      if (!meRes.ok) throw new Error('Invalid Medium token')
      const me = await meRes.json()
      const r = await fetch(`https://api.medium.com/v1/users/${me.data.id}/posts`, {
        method: 'POST', headers: { Authorization: `Bearer ${mdToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: results?.title || 'DevProof Article', contentFormat: 'markdown', content: mediumPost, publishStatus: mdMode === 'draft' ? 'draft' : 'public', tags: results?.skills_demonstrated?.slice(0, 5) || [] })
      })
      if (!r.ok) throw new Error('Medium publish failed')
      const d = await r.json()
      setPushStatus(p => ({ ...p, md: mdMode === 'draft' ? 'draft saved' : 'published' }))
    } catch (e) { setPushStatus(p => ({ ...p, md: 'error: ' + e.message })) }
  }

  // ── Copy LinkedIn ──────────────────────────────────────────────────────
  function copyLinkedIn() {
    navigator.clipboard.writeText(linkedinPost || '').then(() => setPushStatus(p => ({ ...p, li: 'copied!' })))
  }

  const statusBadge = (key) => {
    const s = pushStatus[key]
    if (!s) return null
    const color = s === 'done' || s === 'copied!' || s.includes('saved') || s.includes('published') ? '#10B981' : s === 'pushing' ? '#F59E0B' : '#EF4444'
    return <span style={{ fontSize: 11, color, fontWeight: 600, marginLeft: 6 }}>{s === 'pushing' ? '⏳' : '✓'} {s}</span>
  }

  // ── Styles ─────────────────────────────────────────────────────────────
  const card = { background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, padding: '1.25rem', marginBottom: 12, boxShadow: '0 1px 3px rgba(0,0,0,.05)' }
  const inp = { width: '100%', padding: '9px 12px', border: '1px solid #D1D5DB', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', color: '#111827', outline: 'none', background: '#FAFAFA' }
  const btn = { fontFamily: 'inherit', fontSize: 12, fontWeight: 600, padding: '7px 14px', borderRadius: 8, border: '1px solid #D1D5DB', background: '#fff', cursor: 'pointer', color: '#111827', transition: 'all .15s', display: 'inline-flex', alignItems: 'center', gap: 5 }
  const btnPri = { ...btn, background: '#111827', color: '#fff', border: 'none', fontSize: 14, padding: '11px 20px', width: '100%', justifyContent: 'center' }
  const tabStyle = active => ({ padding: '8px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer', borderBottom: `2px solid ${active ? '#111827' : 'transparent'}`, color: active ? '#111827' : '#9CA3AF', background: 'none', border: 'none', borderBottom: `2px solid ${active ? '#111827' : 'transparent'}`, fontFamily: 'inherit' })

  return (
    <div style={{ maxWidth: 920, margin: '0 auto', padding: '24px 16px', fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" }}>
      {lightboxSrc && <Lightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />}

      {/* Header */}
      <div style={{ marginBottom: 20, textAlign: 'center' }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-.5px', marginBottom: 5 }}>⚡ DevProof AI</h1>
        <p style={{ fontSize: 14, color: '#6B7280' }}>Turn your technical screenshots into professional documentation — in 60 seconds</p>
      </div>

      {/* UPLOAD */}
      {phase === 'upload' && (
        <div>
          <div style={card}>
            {/* Language + Project */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 140px', gap: 12, marginBottom: 14 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '.5px' }}>Project name</label>
                <input style={inp} value={projName} onChange={e => setProjName(e.target.value)} placeholder="e.g. AWS EKS GitLab CI/CD" />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '.5px' }}>Stack / Context</label>
                <input style={inp} value={projCtx} onChange={e => setProjCtx(e.target.value)} placeholder="e.g. Terraform, EKS, Maven, Trivy" />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '.5px' }}>Language</label>
                <select style={{ ...inp, cursor: 'pointer' }} value={lang} onChange={e => setLang(e.target.value)}>
                  {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
                </select>
              </div>
            </div>

            {/* Drop zone */}
            <div
              onDragOver={e => { e.preventDefault(); setDrag(true) }}
              onDragLeave={() => setDrag(false)}
              onDrop={e => { e.preventDefault(); setDrag(false); addFiles(e.dataTransfer.files) }}
              onClick={() => fileRef.current?.click()}
              style={{ border: `2px dashed ${drag ? '#111827' : '#D1D5DB'}`, borderRadius: 10, padding: '32px 20px', textAlign: 'center', cursor: 'pointer', background: drag ? '#F9FAFB' : '#FAFAFA', transition: 'all .15s' }}
            >
              <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={e => addFiles(e.target.files)} />
              <div style={{ fontSize: 28, marginBottom: 8 }}>📸</div>
              <strong style={{ fontSize: 15, color: '#111827' }}>Drop your screenshots here</strong>
              <p style={{ fontSize: 13, color: '#6B7280', marginTop: 5 }}>Upload in any order · DevProof reorders automatically</p>
            </div>

            {shots.length > 0 && (
              <div style={{ marginTop: 12 }}>
                <p style={{ fontSize: 12, color: '#6B7280', marginBottom: 8 }}>{shots.length} screenshot{shots.length !== 1 ? 's' : ''}</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(100px,1fr))', gap: 8 }}>
                  {shots.map((s, i) => (
                    <div key={s.id} style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', border: '1px solid #E5E7EB', aspectRatio: '16/10' }}>
                      <img src={s.preview} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                      <div style={{ position: 'absolute', bottom: 3, left: 4, fontSize: 9, color: 'rgba(255,255,255,.9)', background: 'rgba(0,0,0,.55)', padding: '1px 5px', borderRadius: 3 }}>#{i + 1}</div>
                      <button onClick={() => setShots(p => p.filter(x => x.id !== s.id))} style={{ position: 'absolute', top: 3, right: 3, width: 16, height: 16, background: 'rgba(220,38,38,.9)', border: 'none', borderRadius: '50%', color: '#fff', fontSize: 9, cursor: 'pointer' }}>✕</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {error && <div style={{ marginTop: 12, padding: '10px 14px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, fontSize: 12.5, color: '#DC2626' }}>⚠ {error}</div>}
            <button onClick={generate} disabled={!shots.length} style={{ ...btnPri, marginTop: 14, opacity: shots.length ? 1 : .4 }}>
              ⚡ Run DevProof Pipeline
            </button>
          </div>
        </div>
      )}

      {/* PROCESSING */}
      {phase === 'proc' && (
        <div style={{ ...card, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22, padding: '48px 24px' }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', border: '2.5px solid #E5E7EB', borderTopColor: '#FF9900', borderRightColor: '#6366F1', animation: 'spin .9s linear infinite' }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}.fade-in{animation:fadeIn .3s ease}`}</style>
          <p style={{ fontSize: 16, fontWeight: 600 }}>Generating your documentation…</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%', maxWidth: 380 }}>
            {PIPELINE.map((s, i) => {
              const done = i < procStep, active = i === procStep
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '7px 12px', borderRadius: 8, fontSize: 12, fontFamily: 'monospace', background: done ? '#F0FDF4' : active ? '#FFF7ED' : '#F9FAFB', color: done ? '#15803D' : active ? '#92400E' : '#9CA3AF', border: `1px solid ${done ? '#86EFAC' : active ? '#FDE68A' : '#E5E7EB'}`, transition: 'all .3s' }}>
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor', flexShrink: 0 }} />
                  {done ? '✓ ' : active ? '→ ' : '  '}{s}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* RESULTS */}
      {phase === 'results' && results && (
        <div className="fade-in">
          {/* Hero */}
          <div style={{ ...card, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg,#FF9900,#6366F1,#10B981)' }} />
            <div style={{ fontSize: 10, fontWeight: 700, color: '#FF9900', textTransform: 'uppercase', letterSpacing: '.7px', marginBottom: 6, fontFamily: 'monospace' }}>{results.type}</div>
            <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-.3px', marginBottom: 8, lineHeight: 1.2 }}>{results.title}</h2>
            <p style={{ fontSize: 13.5, color: '#4B5563', lineHeight: 1.75, marginBottom: 12 }}>{results.overview}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 14 }}>
              {(results.skills_demonstrated || []).map(sk => (
                <span key={sk} style={{ padding: '3px 9px', background: '#F3F4F6', border: '1px solid #E5E7EB', borderRadius: 20, fontSize: 11, color: '#4B5563', fontFamily: 'monospace' }}>{sk}</span>
              ))}
            </div>
            <div style={{ padding: '9px 13px', borderRadius: 8, fontSize: 12.5, marginBottom: 16, ...(results.secrets_detected?.length ? { background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA' } : { background: '#F0FDF4', color: '#15803D', border: '1px solid #86EFAC' }) }}>
              {results.secrets_detected?.length ? `⚠ ${results.secrets_detected.length} sensitive item(s) detected and masked` : '✓ No sensitive data detected — safe to publish'}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', paddingTop: 14, borderTop: '1px solid #E5E7EB' }}>
              <button onClick={downloadZip} style={{ ...btn, background: '#111827', color: '#fff', border: 'none' }}>⬇ Download ZIP</button>
              <button onClick={() => setShowIntegrations(p => !p)} style={{ ...btn, color: '#FF9900', borderColor: '#FDE68A' }}>
                {showIntegrations ? '▲' : '▼'} Publish & Push
              </button>
              <button onClick={() => { setPhase('upload'); setResults(null); setShots([]) }} style={{ ...btn, color: '#EF4444', borderColor: '#FECACA', marginLeft: 'auto' }}>↺ New</button>
            </div>

            {/* Integrations panel */}
            {showIntegrations && (
              <div style={{ marginTop: 16, padding: 16, background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 10 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>

                  {/* GitHub */}
                  <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 8, padding: 12 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8 }}>🐙 GitHub</div>
                    <input type="password" placeholder="ghp_token..." value={ghToken}
                      onChange={e => { setGhToken(e.target.value); localStorage.setItem('dp_gh_tok', e.target.value) }}
                      onBlur={() => ghToken && fetchGHRepos(ghToken)}
                      style={{ ...inp, marginBottom: 6, fontSize: 11 }} />
                    {ghRepos.length > 0 && (
                      <select style={{ ...inp, marginBottom: 6, fontSize: 11 }} value={ghRepo} onChange={e => setGhRepo(e.target.value)}>
                        <option value="">Select repo…</option>
                        {ghRepos.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                      </select>
                    )}
                    <button onClick={pushGitHub} style={{ ...btn, width: '100%', justifyContent: 'center', fontSize: 11 }}>
                      Push docs to GitHub {statusBadge('gh')}
                    </button>
                  </div>

                  {/* GitLab */}
                  <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 8, padding: 12 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8 }}>🦊 GitLab</div>
                    <input type="password" placeholder="glpat_token..." value={glToken}
                      onChange={e => { setGlToken(e.target.value); localStorage.setItem('dp_gl_tok', e.target.value) }}
                      onBlur={() => glToken && fetchGLProjects(glToken)}
                      style={{ ...inp, marginBottom: 6, fontSize: 11 }} />
                    {glProjects.length > 0 && (
                      <select style={{ ...inp, marginBottom: 6, fontSize: 11 }} value={glProject} onChange={e => setGlProject(e.target.value)}>
                        <option value="">Select project…</option>
                        {glProjects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                    )}
                    <button onClick={pushGitLab} style={{ ...btn, width: '100%', justifyContent: 'center', fontSize: 11 }}>
                      Push docs to GitLab {statusBadge('gl')}
                    </button>
                  </div>

                  {/* Medium */}
                  <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 8, padding: 12 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8 }}>✍ Medium</div>
                    <input type="password" placeholder="Medium integration token..." value={mdToken}
                      onChange={e => { setMdToken(e.target.value); localStorage.setItem('dp_md_tok', e.target.value) }}
                      style={{ ...inp, marginBottom: 6, fontSize: 11 }} />
                    <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
                      {['draft', 'publish'].map(m => (
                        <button key={m} onClick={() => setMdMode(m)} style={{ flex: 1, padding: '4px', fontSize: 11, borderRadius: 6, border: `1px solid ${mdMode === m ? '#111827' : '#E5E7EB'}`, background: mdMode === m ? '#111827' : '#fff', color: mdMode === m ? '#fff' : '#6B7280', cursor: 'pointer', fontFamily: 'inherit' }}>
                          {m === 'draft' ? '📝 Draft' : '🚀 Publish'}
                        </button>
                      ))}
                    </div>
                    <button onClick={pushMedium} style={{ ...btn, width: '100%', justifyContent: 'center', fontSize: 11 }}>
                      {mdMode === 'draft' ? 'Save as Draft' : 'Publish'} on Medium {statusBadge('md')}
                    </button>
                  </div>

                  {/* LinkedIn */}
                  <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 8, padding: 12 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8 }}>💼 LinkedIn</div>
                    <p style={{ fontSize: 11, color: '#6B7280', marginBottom: 8, lineHeight: 1.5 }}>
                      LinkedIn's API requires company verification. Copy your post and paste it directly on LinkedIn.
                    </p>
                    <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
                      {['draft', 'publish'].map(m => (
                        <button key={m} onClick={() => setLiMode(m)} style={{ flex: 1, padding: '4px', fontSize: 11, borderRadius: 6, border: `1px solid ${liMode === m ? '#0A66C2' : '#E5E7EB'}`, background: liMode === m ? '#0A66C2' : '#fff', color: liMode === m ? '#fff' : '#6B7280', cursor: 'pointer', fontFamily: 'inherit' }}>
                          {m === 'draft' ? '📝 Copy Draft' : '🚀 Copy & Open'}
                        </button>
                      ))}
                    </div>
                    <button onClick={() => {
                      copyLinkedIn()
                      if (liMode === 'publish') window.open('https://www.linkedin.com/post/new', '_blank')
                    }} style={{ ...btn, width: '100%', justifyContent: 'center', fontSize: 11, background: '#0A66C2', color: '#fff', border: 'none' }}>
                      {liMode === 'draft' ? 'Copy post' : 'Copy & Open LinkedIn'} {statusBadge('li')}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div style={card}>
            <div style={{ display: 'flex', borderBottom: '1px solid #E5E7EB', marginBottom: 18 }}>
              {['steps', 'arch', 'readme', 'medium', 'linkedin'].map(t => (
                <button key={t} onClick={() => setActiveTab(t)} style={tabStyle(activeTab === t)}>
                  {t === 'steps' ? `📸 Steps (${results.ordered_steps?.length || 0})` :
                    t === 'arch' ? '🏗 Architecture' :
                    t === 'readme' ? '📄 README' :
                    t === 'medium' ? '✍ Medium' : '💼 LinkedIn'}
                </button>
              ))}
            </div>

            {/* Steps */}
            {activeTab === 'steps' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {(results.ordered_steps || []).map(step => {
                  const imgB64 = annotated[String(step.number)]
                  const imgSrc = imgB64 ? `data:image/jpeg;base64,${imgB64}` : null
                  return (
                    <div key={step.number} style={{ border: '1px solid #E5E7EB', borderRadius: 10, overflow: 'hidden' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                        <div style={{ width: 24, height: 24, minWidth: 24, borderRadius: '50%', background: 'linear-gradient(135deg,#FF9900,#FF6600)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff' }}>{step.number}</div>
                        <span style={{ fontSize: 13.5, fontWeight: 700, color: '#111827' }}>{step.title}</span>
                      </div>
                      <div style={{ display: 'flex' }}>
                        <div style={{ padding: '13px 16px', fontSize: 13, color: '#4B5563', lineHeight: 1.8, flex: 1 }}>
                          <p>{step.description}</p>
                          {step.command && <code style={{ display: 'block', marginTop: 8, fontFamily: 'monospace', fontSize: 11, background: '#1E1E2E', color: '#7DD3FC', padding: '8px 12px', borderRadius: 7, whiteSpace: 'pre-wrap' }}>{step.command}</code>}
                          {step.key_output && <div style={{ marginTop: 5, fontFamily: 'monospace', fontSize: 11, color: '#10B981' }}>→ {step.key_output}</div>}
                          {step.context && <div style={{ marginTop: 8, padding: '8px 11px', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 7, fontSize: 11.5, color: '#92400E' }}>💡 {step.context}</div>}
                        </div>
                        {imgSrc && (
                          <div style={{ borderLeft: '1px solid #E5E7EB', flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
                            <img src={imgSrc} onClick={() => setLightboxSrc(imgSrc)}
                              style={{ display: 'block', width: 240, height: 'auto', cursor: 'zoom-in' }} />
                            <a href={imgSrc} download={`step-${step.number}.jpg`}
                              style={{ textAlign: 'center', padding: '6px', fontSize: 11, color: '#6B7280', borderTop: '1px solid #E5E7EB', textDecoration: 'none', background: '#F9FAFB' }}>
                              ⬇ Download
                            </a>
                          </div>
                        )}
                      </div>
                      {(step.callouts || []).length > 0 && (
                        <div style={{ padding: '8px 14px', borderTop: '1px solid #E5E7EB', background: '#F9FAFB' }}>
                          {(step.callouts || []).map(c => {
                            const cc = { cyan: '#22D3EE', green: '#10B981', amber: '#F59E0B', red: '#EF4444' }
                            return (
                              <div key={c.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 7, fontSize: 11.5, color: '#4B5563', marginBottom: 3 }}>
                                <div style={{ width: 16, height: 16, borderRadius: '50%', background: cc[c.color] || cc.cyan, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: '#09090b', flexShrink: 0, marginTop: 1 }}>{c.id}</div>
                                <div><strong style={{ color: '#111827' }}>{c.label}</strong> — {c.explanation}</div>
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
            {activeTab === 'arch' && (
              <div>
                <div id="arch-svg-container" style={{ background: '#0A0F1E', borderRadius: 10, padding: 20, overflowX: 'auto', marginBottom: 12 }}>
                  <ArchSVG arch={results.architecture} />
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => {
                    const svgEl = document.querySelector('#arch-svg-container svg')
                    if (!svgEl) return
                    const a = document.createElement('a')
                    a.href = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgEl.outerHTML)
                    a.download = 'architecture.svg'; a.click()
                  }} style={btn}>⬇ Download SVG</button>
                </div>
              </div>
            )}

            {/* README Editor */}
            {activeTab === 'readme' && (
              <MarkdownEditor value={readmeMd} onChange={setReadmeMd} label="README.md — Edit before pushing to GitHub/GitLab" />
            )}

            {/* Medium Editor */}
            {activeTab === 'medium' && (
              <MarkdownEditor value={mediumPost} onChange={setMediumPost} label="Medium Article — Edit before publishing" />
            )}

            {/* LinkedIn Editor */}
            {activeTab === 'linkedin' && (
              <MarkdownEditor value={linkedinPost} onChange={setLinkedinPost} label="LinkedIn Post — Edit before copying" />
            )}
          </div>
        </div>
      )}

      <p style={{ textAlign: 'center', fontSize: 11, color: '#9CA3AF', marginTop: 16 }}>
        DevProof AI · Built for DevOps engineers who build in public
      </p>
    </div>
  )
}
