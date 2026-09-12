import React, { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Canvas, useFrame } from '@react-three/fiber'
import { ContactShadows, Environment, Float, RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import './styles.css'

const PROJECTS = [
  { title: 'Veronitech', type: 'Digital product', year: '2025', color: '#db704e', note: 'A focused product experience shaped around clarity and momentum.', shape: 'orbit' },
  { title: 'UniMatch', type: 'Platform design', year: '2025', color: '#4b678f', note: 'A thoughtful matching space for ambitious university communities.', shape: 'tiles' },
  { title: "Mariners’ Markets", type: 'Identity & web', year: '2024', color: '#d49d3d', note: 'A modern market identity with a warm, local point of view.', shape: 'market' },
  { title: 'GitHub', type: 'Open source', year: 'Ongoing', color: '#2f343a', note: 'Experiments, prototypes, and the work behind the work.', shape: 'github', href: 'https://github.com/oh-kei' },
  { title: 'Coming soon', type: 'In progress', year: '2026', color: '#9c9589', note: 'A new idea is taking shape. Check back soon.', shape: 'soon' },
]

function PlaceholderObject({ project, active }) {
  const group = useRef()
  useFrame((state, delta) => {
    if (!group.current) return
    group.current.rotation.y += delta * (active ? 0.62 : 0.09)
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, active ? Math.sin(state.clock.elapsedTime * 0.7) * 0.05 : 0, 0.06)
  })
  const accent = new THREE.Color(project.color)
  const pale = accent.clone().lerp(new THREE.Color('#ffffff'), 0.58)
  return <Float speed={active ? 1.4 : 0.6} rotationIntensity={0.06} floatIntensity={active ? 0.24 : 0.08}>
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
      {project.shape === 'github' && <mesh rotation={[0.1, 0.45, 0.05]}><icosahedronGeometry args={[1, 2]} /><meshStandardMaterial color={project.color} roughness={0.22} metalness={0.15} /></mesh>}
      {project.shape === 'soon' && <><mesh><torusKnotGeometry args={[0.66, 0.21, 128, 20]} /><meshStandardMaterial color={project.color} roughness={0.32} /></mesh><mesh scale={0.55}><sphereGeometry args={[0.55, 32, 32]} /><meshStandardMaterial color="#f8f7f3" roughness={0.45} /></mesh></>}
    </group>
  </Float>
}

function CarouselScene({ index, select, onReady }) {
  return <Canvas camera={{ position: [0, 0.2, 7.8], fov: 42 }} dpr={[1, 1.7]} gl={{ antialias: true }} onCreated={onReady}>
    <color attach="background" args={['#f7f6f2']} />
    <ambientLight intensity={1.15} />
    <directionalLight position={[4, 5, 5]} intensity={2.4} />
    <pointLight position={[-4, -1, 3]} intensity={0.7} color="#f4d8c9" />
    <Suspense fallback={null}>
      <group position={[0, 0.78, 0]}>
        {PROJECTS.map((project, i) => {
          let offset = i - index
          if (offset > 2) offset -= PROJECTS.length
          if (offset < -2) offset += PROJECTS.length
          return <group key={project.title} position={[offset * 2.65, 0, -Math.abs(offset) * 1.1]} rotation={[0, -offset * 0.18, 0]} onClick={() => select(i)}><PlaceholderObject project={project} active={offset === 0} /></group>
        })}
      </group>
      <ContactShadows position={[0, -1.48, 0]} opacity={0.25} scale={18} blur={3.8} far={8} color="#9b9388" />
      <Environment preset="city" />
    </Suspense>
  </Canvas>
}

function App() {
  const [index, setIndex] = useState(0)
  const [open, setOpen] = useState(false)
  const [ready, setReady] = useState(false)
  const audio = useRef(null)
  const project = PROJECTS[index]
  const sound = useCallback(() => {
    try { const ctx = audio.current || new AudioContext(); audio.current = ctx; const low = ctx.createOscillator(); const tap = ctx.createOscillator(); const gain = ctx.createGain(); const tapGain = ctx.createGain(); low.type = 'sine'; tap.type = 'triangle'; low.frequency.setValueAtTime(118, ctx.currentTime); low.frequency.exponentialRampToValueAtTime(64, ctx.currentTime + 0.15); tap.frequency.setValueAtTime(205, ctx.currentTime); tap.frequency.exponentialRampToValueAtTime(92, ctx.currentTime + 0.09); gain.gain.setValueAtTime(0.055, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.17); tapGain.gain.setValueAtTime(0.017, ctx.currentTime); tapGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1); low.connect(gain).connect(ctx.destination); tap.connect(tapGain).connect(ctx.destination); low.start(); tap.start(); low.stop(ctx.currentTime + 0.18); tap.stop(ctx.currentTime + 0.11) } catch {}
  }, [])
  const move = useCallback((step) => { setIndex(i => (i + step + PROJECTS.length) % PROJECTS.length); sound() }, [sound])
  useEffect(() => { const key = e => { if (e.key === 'ArrowLeft') move(-1); if (e.key === 'ArrowRight') move(1); if (e.key === 'Enter') setOpen(true); if (e.key === 'Escape') setOpen(false) }; window.addEventListener('keydown', key); return () => window.removeEventListener('keydown', key) }, [move])
  return <><main>
    <header><a className="wordmark" aria-label="Kei home" href="#top"><svg viewBox="0 0 46 28" aria-hidden="true"><path d="M4 3v22M5 15 19 3M5 15l15 10M25 4v20M25 14h15M40 4v20" /></svg></a><button className="menu" aria-label="Open menu">•••</button></header>
    <section className="gallery" aria-label="Project carousel">
      <div className="canvas-wrap"><CarouselScene index={index} select={(i) => { setIndex(i); sound() }} onReady={() => setReady(true)} /></div>
      
      <div className="project-info"><h1>{project.title}</h1><p>{project.note}</p><button className="learn" onClick={() => setOpen(true)}>Explore project <span>↗</span></button></div>
      <div className="dots">{PROJECTS.map((p, i) => <button key={p.title} onClick={() => { setIndex(i); sound() }} className={i === index ? 'active' : ''} aria-label={`View ${p.title}`} />)}</div>
    </section>
    
    {open && <div className="overlay" role="dialog" aria-modal="true" aria-label={`${project.title} details`} onMouseDown={() => setOpen(false)}><article onMouseDown={e => e.stopPropagation()}><button className="close" onClick={() => setOpen(false)}>Close ×</button><span className="eyebrow">{project.type} · {project.year}</span><h2>{project.title}</h2><p>{project.note} This project page is ready for your full case study, imagery, and links.</p>{project.href ? <a className="visit" href={project.href} target="_blank" rel="noreferrer">Visit GitHub ↗</a> : <button className="visit" onClick={() => setOpen(false)}>Back to work</button>}</article></div>}
  </main>{!ready && <div className="loader" role="status" aria-live="polite"><div className="loader-mark">K</div><span>Loading selected work</span></div>}</>
}

createRoot(document.getElementById('root')).render(<App />)
