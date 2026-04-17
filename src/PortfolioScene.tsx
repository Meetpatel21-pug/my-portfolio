import { useRef } from 'react'
import type { Group } from 'three'
import { Canvas, useFrame } from '@react-three/fiber'
import {
  ContactShadows,
  Float,
  OrbitControls,
  Sparkles,
} from '@react-three/drei'

function Scene() {
  const group = useRef<Group>(null)

  useFrame((state) => {
    if (!group.current) {
      return
    }

    const elapsed = state.clock.getElapsedTime()
    group.current.rotation.y = elapsed * 0.35
    group.current.rotation.x = Math.sin(elapsed * 0.35) * 0.18
    group.current.position.y = Math.sin(elapsed * 0.7) * 0.12
  })

  return (
    <group ref={group}>
      <Float speed={1.4} rotationIntensity={1.2} floatIntensity={1.8}>
        <mesh>
          <torusKnotGeometry args={[1.1, 0.34, 180, 28]} />
          <meshStandardMaterial
            color="#0f172a"
            metalness={0.68}
            roughness={0.28}
            emissive="#155e75"
            emissiveIntensity={0.15}
          />
        </mesh>
      </Float>

      <Float speed={2} rotationIntensity={2} floatIntensity={2.5}>
        <mesh position={[-2.15, 0.8, -0.2]}>
          <icosahedronGeometry args={[0.38, 0]} />
          <meshStandardMaterial color="#67e8f9" metalness={0.7} roughness={0.14} />
        </mesh>
      </Float>

      <Float speed={1.6} rotationIntensity={1.8} floatIntensity={2.1}>
        <mesh position={[2.0, -0.55, 0.35]}>
          <octahedronGeometry args={[0.46, 0]} />
          <meshStandardMaterial color="#f472b6" metalness={0.7} roughness={0.18} />
        </mesh>
      </Float>

      <Float speed={1.8} rotationIntensity={1.6} floatIntensity={1.7}>
        <mesh position={[0.45, 1.65, -0.8]}>
          <dodecahedronGeometry args={[0.28, 0]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.55} roughness={0.2} />
        </mesh>
      </Float>

      <Sparkles count={70} scale={7} size={2.3} speed={0.35} color="#9bf6ff" />
      <ContactShadows
        position={[0, -2.15, 0]}
        opacity={0.4}
        blur={2.4}
        scale={9}
        far={4}
      />
      <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.6} />
    </group>
  )
}

export default function PortfolioScene() {
  return (
    <Canvas dpr={[1, 1.6]} camera={{ position: [0, 0, 6.2], fov: 42 }}>
      <color attach="background" args={['#020617']} />
      <fog attach="fog" args={['#020617', 8, 16]} />
      <ambientLight intensity={0.62} />
      <directionalLight position={[4, 4, 4]} intensity={1.15} color="#ffffff" />
      <pointLight position={[-3, -1.5, 2]} intensity={2.2} color="#5eead4" />
      <pointLight position={[2.6, 2, -0.5]} intensity={1.4} color="#f472b6" />
      <Scene />
    </Canvas>
  )
}
