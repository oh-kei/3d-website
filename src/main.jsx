import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Canvas, useFrame } from '@react-three/fiber'
import { ContactShadows, Environment, Float, RoundedBox, Text, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import './styles.css'

const CV_SCRIBBLES = [
  [[-0.4, 0.12], [-0.29, 0.17], [-0.17, 0.08], [-0.04, 0.14], [0.09, 0.09], [0.23, 0.16], [0.39, 0.11]],
  [[-0.4, -0.05], [-0.32, -0.01], [-0.21, -0.08], [-0.07, -0.02], [0.05, -0.07], [0.2, 0], [0.36, -0.05]],
  [[-0.4, -0.22], [-0.31, -0.17], [-0.19, -0.25], [-0.03, -0.18], [0.12, -0.24], [0.25, -0.17], [0.37, -0.22]],
  [[-0.4, -0.39], [-0.34, -0.35], [-0.24, -0.43], [-0.1, -0.35], [0.03, -0.41], [0.17, -0.34], [0.38, -0.39]],
  [[-0.4, -0.56], [-0.29, -0.51], [-0.13, -0.59], [0.01, -0.52], [0.16, -0.58], [0.28, -0.51], [0.38, -0.56]],
].map((points) => new THREE.CatmullRomCurve3(points.map(([x, y]) => new THREE.Vector3(x, y, 0.061)), false, 'centripetal'))
const PROJECTS = [
  { title: 'Veronitech', type: 'Digital product', year: '2025', color: '#2A2864', note: 'Built a responsive landing page for a hospitality-tech startup, and improved the product dashboard experience.', details: 'As a Software Engineer at Veronitech from January to September 2026, I built the company’s responsive landing page from scratch with React, Vite, and Tailwind CSS, then deployed it on Netlify. I also redesigned and enhanced the dashboard, improving the interface, user experience, and its connection to backend systems.', website: 'https://veronitech.co', shape: 'orbit' },
  { title: 'UniMatch', type: 'Platform design', year: '2025', color: '#8846B4', note: 'Co-developed a social app for Hong Kong university students with more than 2,500 active users.', details: ' Helepd develop a social networking app for university students in Hong Kong, growing it to more than 2,500 active users. I built the frontend with React Native, Expo, and TypeScript, and worked with a Supabase and PostgreSQL backend. The product also included email-verification flows and JWT authentication.', shape: 'tiles' },
  { title: "Mariners’ Markets", type: 'E-commerce development', year: '2026', color: '#d49d3d', note: 'Built and deployed a full e-commerce platform for an international sailing-products distributor.', details: 'Contracted As a Web Developer from February to May 2026. I independently developed and deployed an e-commerce platform for an international sailing products distributor using Next.js, Medusa 2.0, and TypeScript. I built key storefront functionality including product customisation, bulk ordering, and Google OAuth authentication, and integrated Resend, Stripe, and MinIO on Railway.', website: 'https://marinersmarkets.com', websiteLabel: 'marinersmarkets.com', shape: 'market' },
  { title: 'GitHub', type: 'Open source', year: 'Ongoing', color: '#2f343a', note: 'Find my projects here!', shape: 'github', href: 'https://github.com/oh-kei' },
  { title: 'CV', type: 'Curriculum vitae', year: '2026', color: '#2A2864', note: 'An overview of my projects, work experienc, and technical skills.', shape: 'cv', pdf: '/cv/Kei%20CV.pdf', preview: '/cv/Kei-CV.png' },
]

function PlaceholderObject({ project, active, movement, rotation }) {
  const group = useRef()
  const cursor = useRef()
  useFrame((state, delta) => {
    if (!group.current) return
    group.current.rotation.y += delta * (active ? 0.62 : 0.09) * rotation
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, active ? Math.sin(state.clock.elapsedTime * 0.7) * 0.05 : 0, 0.06)
    if (cursor.current) cursor.current.visible = Math.floor(state.clock.elapsedTime * 2) % 2 === 0
  })
  const accent = new THREE.Color(project.color)
  const pale = accent.clone().lerp(new THREE.Color('#ffffff'), 0.58)
  return <Float speed={movement ? (active ? 1.4 : 0.6) : 0} rotationIntensity={movement ? 0.06 : 0} floatIntensity={movement ? (active ? 0.24 : 0.08) : 0}>
    <group ref={group} scale={active ? 1.08 : 0.82}>
      {project.shape === 'orbit' && <>
        <mesh><torusGeometry args={[1.05, 0.2, 22, 64]} /><meshStandardMaterial color={project.color} roughness={0.23} metalness={0.2} /></mesh>
        <mesh rotation={[Math.PI / 2.1, 0, 0]}><torusGeometry args={[0.56, 0.12, 18, 48]} /><meshStandardMaterial color={pale} roughness={0.27} /></mesh>
        <mesh position={[0.98, 0.1, 0]}><sphereGeometry args={[0.18, 32, 32]} /><meshStandardMaterial color="#fffaf0" roughness={0.28} /></mesh>
      </>}
      {project.shape === 'tiles' && <group rotation={[0.18, -0.4, 0.08]}>
        {[[-0.55, 0.25, '#eff2f5'], [0.42, 0.22, project.color], [-0.15, -0.5, '#203247']].map(([x,y,c], i) => <RoundedBox key={i} args={[0.93, 1.15, 0.14]} radius={0.08} smoothness={4} position={[x,y,i * 0.12]}><meshStandardMaterial color={c} roughness={0.3} /></RoundedBox>)}
      </group>}
      {project.shape === 'market' && <>
        <mesh rotation={[0.22, 0.45, 0]}><cylinderGeometry args={[0.67, 0.82, 1.05, 32]} /><meshStandardMaterial color={project.color} roughness={0.34} /></mesh>
        <mesh position={[0, 0.62, 0]} rotation={[0.22, 0.45, 0]}><torusGeometry args={[0.52, 0.1, 16, 32]} /><meshStandardMaterial color="#f6e2af" roughness={0.35} /></mesh>
        <mesh position={[0.45, 0.82, 0.05]}><sphereGeometry args={[0.18, 24, 24]} /><meshStandardMaterial color="#f7d47a" /></mesh>
      </>}
      {project.shape === 'github' && <group rotation={[0.08, 0.28, 0.03]}><RoundedBox args={[1.5, 1.04, 0.22]} radius={0.09} smoothness={4}><meshStandardMaterial color="#272b31" roughness={0.3} metalness={0.18} /></RoundedBox><mesh position={[0, 0, 0.116]}><planeGeometry args={[1.32, 0.86]} /><meshBasicMaterial color="#111316" /></mesh><mesh position={[0, 0.3, 0.123]}><boxGeometry args={[1.32, 0.11, 0.01]} /><meshBasicMaterial color="#1d2228" /></mesh><mesh position={[-0.53, 0.3, 0.13]}><sphereGeometry args={[0.026, 12, 12]} /><meshBasicMaterial color="#db704e" /></mesh><mesh position={[-0.44, 0.3, 0.13]}><sphereGeometry args={[0.026, 12, 12]} /><meshBasicMaterial color="#d49d3d" /></mesh><mesh position={[-0.35, 0.3, 0.13]}><sphereGeometry args={[0.026, 12, 12]} /><meshBasicMaterial color="#7c9d70" /></mesh><Text position={[-0.5, 0.03, 0.13]} fontSize={0.2} color="#d9e3d6" anchorX="left" anchorY="middle">&gt;</Text><mesh ref={cursor} position={[-0.29, 0.03, 0.13]}><boxGeometry args={[0.045, 0.16, 0.01]} /><meshBasicMaterial color="#d9e3d6" /></mesh><mesh position={[-0.19, -0.23, 0.13]}><boxGeometry args={[0.62, 0.035, 0.01]} /><meshBasicMaterial color="#59616a" /></mesh><mesh position={[-0.28, -0.36, 0.13]}><boxGeometry args={[0.44, 0.035, 0.01]} /><meshBasicMaterial color="#3f464e" /></mesh></group>}      {project.shape === 'cv' && <group rotation={[0.08, -0.22, 0.05]}><RoundedBox args={[1.2, 1.55, 0.08]} position={[-0.12, -0.08, -0.14]} rotation={[0, 0, -0.08]} radius={0.05} smoothness={4}><meshStandardMaterial color="#e8e6e1" roughness={0.72} /></RoundedBox><RoundedBox args={[1.2, 1.55, 0.08]} position={[0.1, 0.06, -0.07]} rotation={[0, 0, 0.05]} radius={0.05} smoothness={4}><meshStandardMaterial color="#f0eee9" roughness={0.68} /></RoundedBox><RoundedBox args={[1.2, 1.55, 0.08]} radius={0.05} smoothness={4}><meshStandardMaterial color="#fffefb" roughness={0.62} /></RoundedBox><Text position={[0, 0.43, 0.061]} fontSize={0.3} fontWeight={700} color={project.color} anchorX="center" anchorY="middle">CV</Text>{CV_SCRIBBLES.map((curve, i) => <mesh key={i}><tubeGeometry args={[curve, 40, 0.012, 6, false]} /><meshBasicMaterial color="#252525" /></mesh>)}</group>}
    </group>
  </Float>
}

function VeronitechModel({ active, color, movement, rotation }) {
  const group = useRef()
  const { scene } = useGLTF('/models/veronitech/veronitech-reduced.glb')
  const model = useMemo(() => {
    const clone = scene.clone(true)
    clone.traverse((child) => {
      if (!child.isMesh || !child.material?.color) return
      const material = child.material.clone()
      material.color.set(color)
      material.side = THREE.DoubleSide
      child.material = material
    })
    return clone
  }, [scene, color])

  useFrame((state, delta) => {
    if (!group.current) return
    group.current.rotation.y += delta * (active ? 0.62 : 0.09) * rotation
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, active ? Math.sin(state.clock.elapsedTime * 0.7) * 0.05 : 0, 0.06)
  })

  return <Float speed={movement ? (active ? 1.4 : 0.6) : 0} rotationIntensity={movement ? 0.06 : 0} floatIntensity={movement ? (active ? 0.24 : 0.08) : 0}>
    <group ref={group} scale={active ? 1.89 : 1.44}>
      <primitive object={model} rotation={[0, Math.PI / 2, 0]} />
    </group>
  </Float>
}

function UniMatchModel({ active, color, movement, rotation }) {
  const group = useRef()
  const { scene } = useGLTF('/models/unimatch/unimatch-model.glb')
const model = useMemo(() => {
    const clone = scene.clone(true)
    clone.traverse((child) => {
      if (!child.isMesh || !child.material?.color) return
      const material = child.material.clone()
      material.color.set(color)
      child.material = material
    })
    return clone
  }, [scene, color])

  useFrame((state, delta) => {
    if (!group.current) return
    group.current.rotation.y += delta * (active ? 0.62 : 0.09) * rotation
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, active ? Math.sin(state.clock.elapsedTime * 0.7) * 0.05 : 0, 0.06)
  })

  return <Float speed={movement ? (active ? 1.4 : 0.6) : 0} rotationIntensity={movement ? 0.06 : 0} floatIntensity={movement ? (active ? 0.24 : 0.08) : 0}>
    <group ref={group} scale={active ? 1.24 : 0.94}>
      <primitive object={model} position={[0, -0.46, 0]} />
    </group>
  </Float>
}

useGLTF.preload('/models/unimatch/unimatch-model.glb')
useGLTF.preload('/models/veronitech/veronitech-reduced.glb')
function CarouselScene({ index, select, openProject, onReady, settings }) {
  return <Canvas camera={{ position: [0, 0.2, 7.8], fov: 42 }} dpr={[1, 1.7]} gl={{ antialias: true }} onCreated={onReady}>
    <color attach="background" args={[settings.colour]} />
    <ambientLight intensity={1.15} />
    <directionalLight position={[4, 5, 5]} intensity={2.4} />
    <pointLight position={[-4, -1, 3]} intensity={0.7} color="#f4d8c9" />
    <Suspense fallback={null}>
      <group position={[0, 0.78, 0]}>
        {PROJECTS.map((project, i) => {
          let offset = i - index
          if (offset > 2) offset -= PROJECTS.length
          if (offset < -2) offset += PROJECTS.length
          return <group key={project.title} position={[offset * 2.65, 0, -Math.abs(offset) * 1.1]} rotation={[0, -offset * 0.18, 0]} onClick={() => select(i)}>{project.shape === 'orbit' ? <VeronitechModel active={offset === 0} color={project.color} movement rotation={settings.rotation} /> : project.shape === 'tiles' ? <UniMatchModel active={offset === 0} color={project.color} movement rotation={settings.rotation} /> : <PlaceholderObject project={project} active={offset === 0} movement rotation={settings.rotation} />}</group>
        })}
      </group>
      <ContactShadows position={[0, -1.48, 0]} opacity={0.42} scale={16} blur={2.5} far={7} color="#776f65" />
      <Environment preset="city" />
    </Suspense>
  </Canvas>
}

function App() {
  const [index, setIndex] = useState(0)
  const [open, setOpen] = useState(false)
  const [ready, setReady] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [settings, setSettings] = useState({ sound: true, colour: '#f7f6f2', rotation: 1 })
  const audio = useRef(null)
  const project = PROJECTS[index]
  const sound = useCallback(() => {
    if (!settings.sound) return
    try { const ctx = audio.current || new AudioContext(); audio.current = ctx; const low = ctx.createOscillator(); const tap = ctx.createOscillator(); const gain = ctx.createGain(); const tapGain = ctx.createGain(); low.type = 'sine'; tap.type = 'triangle'; low.frequency.setValueAtTime(118, ctx.currentTime); low.frequency.exponentialRampToValueAtTime(64, ctx.currentTime + 0.15); tap.frequency.setValueAtTime(205, ctx.currentTime); tap.frequency.exponentialRampToValueAtTime(92, ctx.currentTime + 0.09); gain.gain.setValueAtTime(0.055, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.17); tapGain.gain.setValueAtTime(0.017, ctx.currentTime); tapGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1); low.connect(gain).connect(ctx.destination); tap.connect(tapGain).connect(ctx.destination); low.start(); tap.start(); low.stop(ctx.currentTime + 0.18); tap.stop(ctx.currentTime + 0.11) } catch {}
  }, [settings.sound])
  const move = useCallback((step) => { setIndex(i => (i + step + PROJECTS.length) % PROJECTS.length); sound() }, [sound])
  useEffect(() => { const key = e => { if (e.key === 'ArrowLeft') move(-1); if (e.key === 'ArrowRight') move(1); if (e.key === 'Enter') setOpen(true); if (e.key === 'Escape') setOpen(false) }; window.addEventListener('keydown', key); return () => window.removeEventListener('keydown', key) }, [move])
  return <><main style={{ '--page-colour': settings.colour }}>
    <header><span className="wordmark" aria-label="Kei">k</span><div className="settings-wrap"><button className="menu" aria-label="Open settings" aria-expanded={settingsOpen} onClick={() => setSettingsOpen(v => !v)}>•••</button>{settingsOpen && <section className="settings" aria-label="Display settings"><div className="setting-row"><span>Sound</span><button className={settings.sound ? 'switch on' : 'switch'} aria-pressed={settings.sound} onClick={() => setSettings(s => ({ ...s, sound: !s.sound }))}><i /></button></div><div className="setting-row"><span>Colour</span><div className="swatches">{['#f7f6f2', '#edf2f5', '#f1ece5'].map((colour, i) => <button key={colour} className={settings.colour === colour ? 'swatch selected' : 'swatch'} style={{ background: colour }} aria-label={['Warm', 'Cool', 'Blush'][i]} onClick={() => setSettings(s => ({ ...s, colour }))} />)}</div></div><div className="setting-row"><span>Rotation</span><button className={settings.rotation ? 'switch on' : 'switch'} aria-pressed={!!settings.rotation} onClick={() => setSettings(s => ({ ...s, rotation: s.rotation ? 0 : 1 }))}><i /></button></div></section>}</div></header>
    <section className="gallery" aria-label="Project carousel">
      <div className="canvas-wrap"><CarouselScene index={index} select={(i) => { setIndex(i); sound() }} openProject={(i) => { setIndex(i); sound(); setOpen(true) }} onReady={() => setReady(true)} settings={settings} /></div>
      
      <div className="project-info"><h1>{project.title}</h1><p>{project.note}</p>{project.href ? <a className="learn" href={project.href} target="_blank" rel="noreferrer">Visit GitHub <span>↗</span></a> : <button className="learn" onClick={() => setOpen(true)}>{project.pdf ? 'View CV' : 'Explore project'} <span>↗</span></button>}</div>
      <div className="dots">{PROJECTS.map((p, i) => <button key={p.title} onClick={() => { setIndex(i); sound() }} className={i === index ? 'active' : ''} aria-label={`View ${p.title}`} />)}</div>
    </section>
    
    {open && <div className="overlay" role="dialog" aria-modal="true" aria-label={`${project.title} details`} onMouseDown={() => setOpen(false)}><article className={project.pdf ? 'cv-modal' : ''} onMouseDown={e => e.stopPropagation()}><>{project.pdf && <a className="cv-download" href={project.pdf} download aria-label="Download Kei CV">↓</a>}<button className="close" onClick={() => setOpen(false)}>Close ×</button></>{project.pdf ? <><h2>{project.title}</h2><img className="cv-preview" src={project.preview} alt="Kei CV" /></> : <><h2>{project.title}</h2><p>{project.details || `${project.note} This project page is ready for your full case study, imagery, and links.`}{project.website && <> <a href={project.website} target="_blank" rel="noreferrer">{project.websiteLabel || 'veronitech.co'}</a></>}</p>{project.href && <a className="visit" href={project.href} target="_blank" rel="noreferrer">Visit GitHub ↗</a>}</>}</article></div>}
  </main>{!ready && <div className="loader" role="status" aria-live="polite"><div className="loader-mark">K</div><span>Loading selected work</span></div>}</>
}

createRoot(document.getElementById('root')).render(<App />)
